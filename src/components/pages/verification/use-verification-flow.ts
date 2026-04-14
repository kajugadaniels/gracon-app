'use client';

/**
 * Reducer-backed controller for the identity verification flow.
 *
 * This isolates step transitions, capture state, submit orchestration, and
 * retry reset logic from the page component so the same flow can later be
 * reused in other apps without copying page-local state handling.
 */

import { useCallback, useReducer, type Dispatch } from 'react';
import { toast } from '@/components/ui';
import {
    submitVerificationApi,
    type SubmitVerificationResponse,
    type VerificationResult,
} from '@/api/verification/submit-verification.api';
import { useApi } from '@/lib/hooks/useApi';
import { useAuthStore } from '@/lib/store/auth.store';

export type VerifyStep = 'nid' | 'id-card' | 'selfie' | 'result';

type VerificationFlowState = {
    step: VerifyStep;
    documentNumber: string;
    idCardFile: File | null;
    selfieFile: File | null;
    idCardPreview: string | null;
    selfiePreview: string | null;
    idCaptured: boolean;
    selfieCaptured: boolean;
    result: VerificationResult | null;
};

type VerificationFlowAction =
    | { type: 'CONFIRM_DOCUMENT_NUMBER'; documentNumber: string }
    | { type: 'CAPTURE_ID_CARD'; file: File; preview: string }
    | { type: 'CAPTURE_SELFIE'; file: File; preview: string }
    | { type: 'RETAKE_ID_CARD' }
    | { type: 'RETAKE_SELFIE' }
    | { type: 'SET_STEP'; step: VerifyStep }
    | { type: 'SET_RESULT'; result: VerificationResult }
    | { type: 'RESET_FOR_RETRY' };

const INITIAL_STATE: VerificationFlowState = {
    step: 'nid',
    documentNumber: '',
    idCardFile: null,
    selfieFile: null,
    idCardPreview: null,
    selfiePreview: null,
    idCaptured: false,
    selfieCaptured: false,
    result: null,
};

function verificationFlowReducer(
    state: VerificationFlowState,
    action: VerificationFlowAction,
): VerificationFlowState {
    switch (action.type) {
        case 'CONFIRM_DOCUMENT_NUMBER':
            return {
                ...state,
                documentNumber: action.documentNumber,
                step: 'id-card',
            };
        case 'CAPTURE_ID_CARD':
            return {
                ...state,
                idCardFile: action.file,
                idCardPreview: action.preview,
                idCaptured: true,
            };
        case 'CAPTURE_SELFIE':
            return {
                ...state,
                selfieFile: action.file,
                selfiePreview: action.preview,
                selfieCaptured: true,
            };
        case 'RETAKE_ID_CARD':
            return {
                ...state,
                idCardFile: null,
                idCardPreview: null,
                idCaptured: false,
            };
        case 'RETAKE_SELFIE':
            return {
                ...state,
                selfieFile: null,
                selfiePreview: null,
                selfieCaptured: false,
            };
        case 'SET_STEP':
            return {
                ...state,
                step: action.step,
            };
        case 'SET_RESULT':
            return {
                ...state,
                result: action.result,
                step: 'result',
            };
        case 'RESET_FOR_RETRY':
            return {
                ...INITIAL_STATE,
            };
        default:
            return state;
    }
}

function getSuccessDescription(
    result: VerificationResult,
    isInvitationChallenge: boolean,
) {
    return isInvitationChallenge
        ? `Score: ${Math.round(result.compositeScore)}% — invitation verification is complete.`
        : `Score: ${Math.round(result.compositeScore)}% — you can now access your dashboard.`;
}

function normalizeVerificationResult(
    response: SubmitVerificationResponse | VerificationResult,
) {
    return 'data' in response ? response.data : response;
}

function useVerificationSubmitController(
    isInvitationChallenge: boolean,
    state: VerificationFlowState,
    dispatch: Dispatch<VerificationFlowAction>,
) {
    const { user, setUser, setTokens } = useAuthStore();

    const handleVerificationSuccess = useCallback(
        (response: SubmitVerificationResponse) => {
            const result = normalizeVerificationResult(response);
            dispatch({ type: 'SET_RESULT', result });

            if (result.passed) {
                if (user) {
                    setUser({ ...user, isIdVerified: true });
                }
                if (result.upgradedTokens) {
                    setTokens(
                        result.upgradedTokens.accessToken,
                        result.upgradedTokens.refreshToken,
                    );
                }
                toast.success('Identity verified!', {
                    description: getSuccessDescription(
                        result,
                        isInvitationChallenge,
                    ),
                });
                return;
            }

            toast.error('Verification failed', {
                description:
                    result.failReason ??
                    'Please try again with better lighting.',
            });
        },
        [dispatch, isInvitationChallenge, setTokens, setUser, user],
    );

    const { execute: submit, loading } = useApi(submitVerificationApi, {
        showErrorToast: true,
        onSuccess: handleVerificationSuccess,
    });

    const submitVerification = useCallback(async () => {
        if (!state.idCardFile || !state.selfieFile) {
            toast.error('Missing photos', {
                description: 'Please capture both your ID card and selfie.',
            });
            return null;
        }

        return submit(
            state.documentNumber,
            state.idCardFile,
            state.selfieFile,
            isInvitationChallenge ? 'INVITATION' : undefined,
        );
    }, [
        isInvitationChallenge,
        state.documentNumber,
        state.idCardFile,
        state.selfieFile,
        submit,
    ]);

    return {
        loading,
        submitVerification,
    };
}

/**
 * Owns the verification flow state machine for the current page session.
 */
export function useVerificationFlow(isInvitationChallenge: boolean) {
    const [state, dispatch] = useReducer(
        verificationFlowReducer,
        INITIAL_STATE,
    );
    const { loading, submitVerification } = useVerificationSubmitController(
        isInvitationChallenge,
        state,
        dispatch,
    );

    const confirmDocumentNumber = useCallback((documentNumber: string) => {
        dispatch({ type: 'CONFIRM_DOCUMENT_NUMBER', documentNumber });
    }, []);

    const captureIdCard = useCallback((preview: string, file: File) => {
        dispatch({ type: 'CAPTURE_ID_CARD', preview, file });
    }, []);

    const captureSelfie = useCallback((preview: string, file: File) => {
        dispatch({ type: 'CAPTURE_SELFIE', preview, file });
    }, []);

    const retakeIdCard = useCallback(() => {
        dispatch({ type: 'RETAKE_ID_CARD' });
    }, []);

    const retakeSelfie = useCallback(() => {
        dispatch({ type: 'RETAKE_SELFIE' });
    }, []);

    const setStep = useCallback((step: VerifyStep) => {
        dispatch({ type: 'SET_STEP', step });
    }, []);

    const resetForRetry = useCallback(() => {
        dispatch({ type: 'RESET_FOR_RETRY' });
    }, []);

    return {
        ...state,
        loading,
        confirmDocumentNumber,
        captureIdCard,
        captureSelfie,
        retakeIdCard,
        retakeSelfie,
        setStep,
        resetForRetry,
        submitVerification,
    };
}
