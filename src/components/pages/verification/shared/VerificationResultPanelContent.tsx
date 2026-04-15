/**
 * Shared body layout for verification result panels.
 */

import type { ReactNode } from 'react';
import {
    VerificationBiometricSummary,
    VerificationIdentitySummary,
    VerificationResultPreviews,
} from './index';
import { getVerificationResultNotice } from './verification-feedback';
import type { VerificationResult } from './types';

export type VerificationResultActionLabels = {
    successActionLabel: string;
    retryActionLabel: string;
    dashboardActionLabel: string;
    lockedActionLabel: string;
};

export type VerificationResultActionHandlers = {
    onContinue: () => void;
    onRetry: () => void;
    onDashboard: () => void;
};

type VerificationResultPanelContentProps = {
    result: VerificationResult;
    idCardPreview: string | null;
    selfiePreview: string | null;
    actionLabels: VerificationResultActionLabels;
    actionHandlers: VerificationResultActionHandlers;
    renderStatusBadge: (passed: boolean) => ReactNode;
    renderActions: (args: {
        result: VerificationResult;
        labels: VerificationResultActionLabels;
        handlers: VerificationResultActionHandlers;
    }) => ReactNode;
};

/**
 * Renders the reusable verification result body while allowing apps to inject
 * their own badge and action-button primitives.
 */
export function VerificationResultPanelContent({
    result,
    idCardPreview,
    selfiePreview,
    actionLabels,
    actionHandlers,
    renderStatusBadge,
    renderActions,
}: VerificationResultPanelContentProps) {
    const notice = getVerificationResultNotice(result);

    return (
        <div
            className="animate-fade-up"
            style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
        >
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                {renderStatusBadge(result.passed)}
            </div>

            <VerificationResultPreviews
                idCardPreview={idCardPreview}
                selfiePreview={selfiePreview}
                documentMatch={result.documentMatch}
                faceScore={result.faceScore}
            />

            {result.idInfo && (
                <VerificationIdentitySummary
                    idInfo={result.idInfo}
                    documentMatch={result.documentMatch}
                />
            )}

            <VerificationBiometricSummary
                compositeScore={result.compositeScore}
                faceScore={result.faceScore}
                livenessScore={result.livenessScore}
                passed={result.passed}
            />

            {!result.passed && result.failReason && (
                <div
                    style={{
                        background: 'var(--color-error-subtle)',
                        border: '1px solid var(--color-error-border)',
                        borderRadius: 'var(--radius-md)',
                        padding: '11px 14px',
                        fontSize: 13,
                        color: 'var(--color-error)',
                        lineHeight: 1.6,
                    }}
                >
                    {result.failReason}
                </div>
            )}

            {notice?.kind === 'attempts' && (
                <p
                    style={{
                        fontSize: 12,
                        color: 'var(--color-text-muted)',
                        textAlign: 'center',
                        margin: 0,
                    }}
                >
                    {notice.message}
                </p>
            )}

            {notice?.kind === 'lockout' && (
                <p
                    style={{
                        fontSize: 12,
                        color: 'var(--color-text-muted)',
                        textAlign: 'center',
                        margin: 0,
                        lineHeight: 1.6,
                    }}
                >
                    {notice.message}
                </p>
            )}

            {renderActions({
                result,
                labels: actionLabels,
                handlers: actionHandlers,
            })}
        </div>
    );
}
