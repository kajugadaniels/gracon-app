/**
 * Security baseline checks for the Gracon identity frontend.
 *
 * The script avoids external dependencies so it can run in CI before install
 * drift or package audits hide session, redirect, or env mistakes.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const projectRoot = resolve(new URL('..', import.meta.url).pathname);
const errors = [];

const requiredEnvExampleKeys = [
    'NEXT_PUBLIC_API_URL',
    'NEXT_PUBLIC_SIGNATURE_API_URL',
    'NEXT_PUBLIC_DOCS_URL',
    'NEXT_PUBLIC_MEETINGS_URL',
    'NEXT_PUBLIC_AUTH_ALLOWED_REDIRECT_ORIGINS',
    'AUTH_ALLOWED_REDIRECT_ORIGINS',
    'AUTH_COOKIE_DOMAIN',
    'AUTH_COOKIE_SECURE',
    'AUTH_COOKIE_SAME_SITE',
    'ALLOW_DEV_READABLE_AUTH_COOKIES',
];

const requiredGitignoreEntries = [
    '.env',
    '.env.local',
    '.env.production',
    '.env.production.local',
    'env',
    'env.local',
    'env.production',
    'env.production.local',
];

const allowedCookieFiles = new Set([
    'src/api/auth/session-recovery.ts',
    'src/lib/auth/session-cookie-policy.ts',
]);

function readProjectFile(path) {
    return readFileSync(join(projectRoot, path), 'utf8');
}

function parseEnv(source) {
    const values = new Map();
    for (const line of source.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
        const index = trimmed.indexOf('=');
        values.set(trimmed.slice(0, index), trimmed.slice(index + 1));
    }
    return values;
}

function walk(directory, files = []) {
    if (!existsSync(directory)) return files;

    for (const entry of readdirSync(directory)) {
        const absolute = join(directory, entry);
        const stats = statSync(absolute);
        if (stats.isDirectory()) {
            if (!['node_modules', '.next', 'out', 'coverage'].includes(entry)) {
                walk(absolute, files);
            }
            continue;
        }

        if (/\.(ts|tsx|js|jsx|mjs)$/.test(entry)) files.push(absolute);
    }

    return files;
}

function checkEnvExample() {
    const envPath = join(projectRoot, '.env.example');
    if (!existsSync(envPath)) {
        errors.push('.env.example is required.');
        return;
    }

    const env = parseEnv(readFileSync(envPath, 'utf8'));
    for (const key of requiredEnvExampleKeys) {
        if (!env.has(key)) errors.push(`.env.example must document ${key}.`);
    }

    for (const key of env.keys()) {
        if (/^NEXT_PUBLIC_/.test(key) && /(SECRET|PASSWORD|PRIVATE|API_SECRET|CLIENT_SECRET)$/.test(key)) {
            errors.push(`.env.example must not expose sensitive key ${key} with NEXT_PUBLIC_.`);
        }
    }
}

function checkDeployEnv() {
    if (process.env.CHECK_DEPLOY_ENV !== 'true') return;

    const requiredTrue = ['AUTH_COOKIE_SECURE'];
    const requiredFalse = [
        'ALLOW_DEV_READABLE_AUTH_COOKIES',
        'NEXT_PUBLIC_ALLOW_DEV_READABLE_AUTH_COOKIES',
    ];

    for (const key of requiredTrue) {
        if (process.env[key] !== 'true') errors.push(`${key} must be true in production.`);
    }

    for (const key of requiredFalse) {
        if (process.env[key] && process.env[key] !== 'false') {
            errors.push(`${key} must be false in production.`);
        }
    }

    const cookieDomain = process.env.AUTH_COOKIE_DOMAIN ?? process.env.NEXT_PUBLIC_AUTH_COOKIE_DOMAIN;
    if (!cookieDomain || !cookieDomain.startsWith('.')) {
        errors.push('AUTH_COOKIE_DOMAIN must be a parent domain in production, for example .gracon360.com.');
    }

    for (const key of ['NEXT_PUBLIC_API_URL', 'NEXT_PUBLIC_SIGNATURE_API_URL', 'NEXT_PUBLIC_DOCS_URL']) {
        const value = process.env[key];
        if (!value) {
            errors.push(`${key} is required for production validation.`);
        } else if (!value.startsWith('https://')) {
            errors.push(`${key} must use HTTPS in production.`);
        }
    }
}

function checkGitignore() {
    const gitignorePath = join(projectRoot, '.gitignore');
    if (!existsSync(gitignorePath)) {
        errors.push('.gitignore is required.');
        return;
    }

    const entries = new Set(
        readFileSync(gitignorePath, 'utf8')
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter((line) => line && !line.startsWith('#')),
    );

    for (const entry of requiredGitignoreEntries) {
        if (!entries.has(entry)) errors.push(`.gitignore must ignore ${entry}.`);
    }
}

function checkNextSecurityHeaders() {
    const configPath = join(projectRoot, 'next.config.ts');
    if (!existsSync(configPath)) {
        errors.push('next.config.ts is required.');
        return;
    }

    const config = readFileSync(configPath, 'utf8');
    for (const marker of [
        'Content-Security-Policy',
        'Referrer-Policy',
        'X-Content-Type-Options',
        'X-Frame-Options',
        'Permissions-Policy',
        'frame-ancestors',
        'camera=(self)',
    ]) {
        if (!config.includes(marker)) {
            errors.push(`next.config.ts must configure ${marker}.`);
        }
    }
}

function checkWorkflowSecretScanning() {
    const workflowPath = join(projectRoot, '.github/workflows/app-security.yml');
    if (!existsSync(workflowPath)) {
        errors.push('.github/workflows/app-security.yml is required.');
        return;
    }

    const workflow = readFileSync(workflowPath, 'utf8');
    if (!workflow.includes('gitleaks/gitleaks-action')) {
        errors.push('app-security workflow must run Gitleaks secret scanning.');
    }
}

function checkSourceBoundary() {
    const sensitiveStorage = /\b(localStorage|sessionStorage)\b.*(token|jwt|secret|password|private|nid|pid|passport)/i;
    for (const file of walk(join(projectRoot, 'src'))) {
        const relativePath = relative(projectRoot, file);
        const source = readFileSync(file, 'utf8');
        const lines = source.split(/\r?\n/);

        lines.forEach((line, index) => {
            if (line.trim().startsWith('//')) return;

            if (line.includes('localStorage') && sensitiveStorage.test(line)) {
                errors.push(`${relativePath}:${index + 1} must not persist sensitive data in localStorage.`);
            }

            if (line.includes('document.cookie') && !allowedCookieFiles.has(relativePath)) {
                errors.push(`${relativePath}:${index + 1} must not access auth cookies outside approved helpers.`);
            }
        });
    }
}

function checkRedirectSafety() {
    const redirectSafety = readProjectFile('src/lib/auth/redirect-safety.ts');
    if (!redirectSafety.includes('BLOCKED_INTERNAL_DESTINATIONS')) {
        errors.push('redirect-safety.ts must block session-ending destinations.');
    }
    if (!redirectSafety.includes('allowed.has(targetUrl.origin)')) {
        errors.push('redirect-safety.ts must use exact-origin allowlisting.');
    }

    const testPath = join(projectRoot, 'test/auth/redirect-safety.test.ts');
    if (!existsSync(testPath)) {
        errors.push('test/auth/redirect-safety.test.ts is required.');
        return;
    }

    const tests = readFileSync(testPath, 'utf8');
    for (const marker of ['/logout', '.evil.test', 'javascript:alert(1)']) {
        if (!tests.includes(marker)) {
            errors.push(`redirect safety tests must cover ${marker}.`);
        }
    }
}

checkEnvExample();
checkDeployEnv();
checkGitignore();
checkNextSecurityHeaders();
checkWorkflowSecretScanning();
checkSourceBoundary();
checkRedirectSafety();

if (errors.length > 0) {
    console.error('Identity app security baseline failed:\n');
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
}

console.log('Identity app security baseline passed.');
