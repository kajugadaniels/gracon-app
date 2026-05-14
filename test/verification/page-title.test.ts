import test from 'node:test';
import assert from 'node:assert/strict';
import { formatPageTitle } from '../../src/lib/hooks/usePageTitle.ts';

test('formats page titles with the Gracon 360 suffix', () => {
    assert.equal(formatPageTitle('Login'), 'Login | Gracon 360');
    assert.equal(formatPageTitle('Digital Signature'), 'Digital Signature | Gracon 360');
});

test('falls back to the app name when the title is blank', () => {
    assert.equal(formatPageTitle('   '), 'Gracon 360');
});
