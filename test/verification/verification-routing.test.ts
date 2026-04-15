import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveMainAppVerificationRedirect } from '../../src/components/pages/verification/verification-routing.ts';

test('falls back to the dashboard when next is missing', () => {
    assert.deepEqual(
        resolveMainAppVerificationRedirect(null, 'http://localhost:4002'),
        { kind: 'internal', destination: '/dashboard' },
    );
});

test('allows redirects into the documents app only when origin matches docs base', () => {
    assert.deepEqual(
        resolveMainAppVerificationRedirect(
            'http://localhost:4002/invitations/abc',
            'http://localhost:4002',
        ),
        {
            kind: 'external',
            destination: 'http://localhost:4002/invitations/abc',
        },
    );
});

test('rejects invalid or foreign next urls', () => {
    assert.deepEqual(
        resolveMainAppVerificationRedirect(
            'https://example.com/attack',
            'http://localhost:4002',
        ),
        { kind: 'internal', destination: '/dashboard' },
    );
    assert.deepEqual(
        resolveMainAppVerificationRedirect('not-a-url', 'http://localhost:4002'),
        { kind: 'internal', destination: '/dashboard' },
    );
});
