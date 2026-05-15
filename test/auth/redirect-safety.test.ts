import test from 'node:test';
import assert from 'node:assert/strict';
import {
    parseAllowedRedirectOrigins,
    resolveSafeLoginRedirect,
} from '../../src/lib/auth/redirect-safety.ts';

test('login redirects allow safe internal paths', () => {
    assert.deepEqual(
        resolveSafeLoginRedirect('/profile/signature?setup=1', 'http://localhost:4002'),
        { kind: 'internal', destination: '/profile/signature?setup=1' },
    );
});

test('login redirects allow only configured documents origin', () => {
    assert.deepEqual(
        resolveSafeLoginRedirect(
            'http://localhost:4002/documents/abc/edit',
            'http://localhost:4002',
        ),
        {
            kind: 'external',
            destination: 'http://localhost:4002/documents/abc/edit',
        },
    );
});

test('login redirects reject unsafe and lookalike destinations', () => {
    for (const next of [
        'javascript:alert(1)',
        '//evil.example/path',
        'https://evil.example/path',
        'http://localhost:4002.evil.example/documents',
        'not-a-url',
    ]) {
        assert.deepEqual(
            resolveSafeLoginRedirect(next, 'http://localhost:4002'),
            { kind: 'internal', destination: '/dashboard' },
        );
    }
});

test('login redirects allow configured extra origins only by exact origin', () => {
    const allowed = parseAllowedRedirectOrigins(
        'https://documents.gracon360.com, https://app.gracon360.com',
    );

    assert.deepEqual(
        resolveSafeLoginRedirect(
            'https://documents.gracon360.com/invitations/abc',
            'http://localhost:4002',
            allowed,
        ),
        {
            kind: 'external',
            destination: 'https://documents.gracon360.com/invitations/abc',
        },
    );
    assert.deepEqual(
        resolveSafeLoginRedirect(
            'https://documents.gracon360.com.evil.test/invitations/abc',
            'http://localhost:4002',
            allowed,
        ),
        { kind: 'internal', destination: '/dashboard' },
    );
});
