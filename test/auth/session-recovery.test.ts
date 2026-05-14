import test from 'node:test';
import assert from 'node:assert/strict';
import axios from 'axios';
import {
    clearAuthAndRedirect,
    getStoredAccessToken,
    getStoredRefreshToken,
    isIdentityVerificationError,
    redirectToIdentityVerification,
    refreshStoredSession,
    upgradeStoredSession,
} from '../../src/api/auth/session-recovery.ts';

type SessionMap = Map<string, string>;

function installBrowserMocks(initialStorage: Record<string, string> = {}) {
    const sessionValues: SessionMap = new Map(Object.entries(initialStorage));
    const cookieWrites: string[] = [];
    const location = {
        pathname: '/profile/signature',
        search: '?tab=certificate',
        href: 'http://localhost:4000/profile/signature?tab=certificate',
    };

    Object.defineProperty(globalThis, 'sessionStorage', {
        configurable: true,
        value: {
            getItem: (key: string) => sessionValues.get(key) ?? null,
            setItem: (key: string, value: string) => {
                sessionValues.set(key, value);
            },
            removeItem: (key: string) => {
                sessionValues.delete(key);
            },
        },
    });

    Object.defineProperty(globalThis, 'document', {
        configurable: true,
        value: {
            get cookie() {
                return cookieWrites.join('; ');
            },
            set cookie(value: string) {
                cookieWrites.push(value);
            },
        },
    });

    Object.defineProperty(globalThis, 'window', {
        configurable: true,
        value: {
            location,
        },
    });

    return { sessionValues, cookieWrites, location };
}

function removeBrowserMocks() {
    Reflect.deleteProperty(globalThis, 'window');
    Reflect.deleteProperty(globalThis, 'document');
    Reflect.deleteProperty(globalThis, 'sessionStorage');
}

test('reads stored auth tokens from session storage before hydration', () => {
    installBrowserMocks({
        av_at: 'stored-access',
        av_rt: 'stored-refresh',
    });

    try {
        assert.equal(getStoredAccessToken(), 'stored-access');
        assert.equal(getStoredRefreshToken(), 'stored-refresh');
    } finally {
        removeBrowserMocks();
    }
});

test('refreshes a stored session and persists rotated tokens', async () => {
    const { sessionValues, cookieWrites } = installBrowserMocks({
        av_rt: 'old-refresh',
    });
    const originalPost = axios.post;
    const calls: Array<{ url: string; body: unknown }> = [];

    axios.post = (async (url: string, body: unknown) => {
        calls.push({ url, body });
        return {
            data: {
                data: {
                    accessToken: 'new-access',
                    refreshToken: 'new-refresh',
                },
            },
        };
    }) as typeof axios.post;

    try {
        const token = await refreshStoredSession();

        assert.equal(token, 'new-access');
        assert.deepEqual(calls, [
            {
                url: 'http://localhost:3000/api/v1/auth/refresh',
                body: { refreshToken: 'old-refresh' },
            },
        ]);
        assert.equal(sessionValues.get('av_at'), 'new-access');
        assert.equal(sessionValues.get('av_rt'), 'new-refresh');
        assert.ok(cookieWrites.some((cookie) => cookie.startsWith('g360_at=new-access;')));
        assert.ok(cookieWrites.some((cookie) => cookie.startsWith('g360_rt=new-refresh;')));
        assert.ok(cookieWrites.some((cookie) => cookie.startsWith('session_active=1;')));
    } finally {
        axios.post = originalPost;
        removeBrowserMocks();
    }
});

test('upgrades only full-token session responses', async () => {
    const { sessionValues } = installBrowserMocks({ av_rt: 'limited-refresh' });
    const originalPost = axios.post;
    let tokenType: 'full' | 'limited' = 'limited';

    axios.post = (async () => ({
        data: {
            accessToken: 'upgraded-access',
            refreshToken: 'upgraded-refresh',
            tokenType,
        },
    })) as typeof axios.post;

    try {
        assert.equal(await upgradeStoredSession(), null);
        assert.equal(sessionValues.get('av_at'), undefined);

        tokenType = 'full';
        assert.equal(await upgradeStoredSession(), 'upgraded-access');
        assert.equal(sessionValues.get('av_at'), 'upgraded-access');
        assert.equal(sessionValues.get('av_rt'), 'upgraded-refresh');
    } finally {
        axios.post = originalPost;
        removeBrowserMocks();
    }
});

test('detects identity-verification errors from limited-token API responses', () => {
    assert.equal(
        isIdentityVerificationError({
            response: {
                status: 403,
                data: { message: 'Identity verification is required' },
            },
        } as never),
        true,
    );
    assert.equal(
        isIdentityVerificationError({
            response: {
                status: 403,
                data: { message: ['Request blocked', 'limited token'] },
            },
        } as never),
        true,
    );
    assert.equal(
        isIdentityVerificationError({
            response: {
                status: 401,
                data: { message: 'Identity verification is required' },
            },
        } as never),
        false,
    );
});

test('redirects to identity verification with the current route as next', () => {
    const { location } = installBrowserMocks();

    try {
        redirectToIdentityVerification();
        assert.equal(
            location.href,
            '/verify-identity?next=%2Fprofile%2Fsignature%3Ftab%3Dcertificate',
        );
    } finally {
        removeBrowserMocks();
    }
});

test('does not redirect when already on identity verification', () => {
    const { location } = installBrowserMocks();
    location.pathname = '/verify-identity';
    location.search = '?next=%2Fdashboard';
    location.href = 'http://localhost:4000/verify-identity?next=%2Fdashboard';

    try {
        redirectToIdentityVerification();
        assert.equal(location.href, 'http://localhost:4000/verify-identity?next=%2Fdashboard');
    } finally {
        removeBrowserMocks();
    }
});

test('cleans auth tokens and sends the user to login', () => {
    const { sessionValues, cookieWrites, location } = installBrowserMocks({
        av_at: 'access',
        av_rt: 'refresh',
        av_user: '{"userId":"u1"}',
    });

    try {
        clearAuthAndRedirect();

        assert.equal(sessionValues.has('av_at'), false);
        assert.equal(sessionValues.has('av_rt'), false);
        assert.equal(sessionValues.has('av_user'), false);
        assert.ok(cookieWrites.some((cookie) => cookie.startsWith('session_active=;')));
        assert.ok(cookieWrites.some((cookie) => cookie.startsWith('g360_at=;')));
        assert.ok(cookieWrites.some((cookie) => cookie.startsWith('g360_rt=;')));
        assert.equal(location.href, '/login');
    } finally {
        removeBrowserMocks();
    }
});
