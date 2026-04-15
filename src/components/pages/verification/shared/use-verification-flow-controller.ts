'use client';

/**
 * Headless reducer-backed controller for the multi-step verification flow.
 * Apps provide submission, notifications, and post-success side effects.
 */

import { useCallback, useReducer } from 'react';
import type {
    SubmitVerificationResponse,
    VerificationChallengeMode,
    VerificationResult,
    VerifyStep,
} from './types';

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
    loading: boolean;
};

type VerificationFlowAction =
    | { type: 'CONFIRM_DOCUMENT_NUMBER'; documentNumber: string }
    | { type: 'CAPTURE_ID_CARD'; file: File; preview: string }
    | { type: 'CAPTURE_SELFIE'; file: File; preview: string }
    | { type: 'RETAKE_ID_CARD' }
    | { type: 'RETAKE_SELFIE' }
    | { type: 'SET_STEP'; step: VerifyStep }
    | { type: 'START_SUBMIT' }
    | { type: 'SET_RESULT'; result: VerificationResult }
    | { type: 'FINISH_SUBMIT' }
    | { type: 'RESET_FOR_RETRY' };

export type VerificationSubmitResult =
    | VerificationResult
    | SubmitVerificationResponse;

export type VerificationSubmitter = (args: {
    documentNumber: string;
    idCardFile: File;
    selfieFile: File;
    challengeMode: VerificationChallengeMode;
}) => Promise<VerificationSubmitResult>;

type VerificationNotifications = {
    onSuccess: (description: string) => void;
    onFailure: (description: string) => void;
    onError: (description: string) => void;
    onMissingPhotos: (description: string) => void;
};

export type UseVerificationFlowControllerOptions = {
    challengeMode: VerificationChallengeMode;
    getSuccessDescription: (result: VerificationResult) => string;
    submitVerification: VerificationSubmitter;
    notifications: VerificationNotifications;
    normalizeErrorMessage?: (error: unknown, fallback: string) => string;
    onVerificationPassed?: (result: VerificationResult) => void;
};

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
    loading: false,
};

function reducer(
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
        case 'START_SUBMIT':
            return {
                ...state,
                loading: true,
            };
        case 'SET_RESULT':
            return {
                ...state,
                result: action.result,
                step: 'result',
                loading: false,
            };
        case 'FINISH_SUBMIT':
            return {
                ...state,
                loading: false,
            };
        case 'RESET_FOR_RETRY':
            return {
                ...INITIAL_STATE,
            };
        default:
            return state;
    }
}

function normalizeVerificationResult(
    response: VerificationSubmitResult,
): VerificationResult {
    return 'data' in response ? response.data : response;
}

/**
 * Provides the shared state machine used by both verification frontends.
 */
export function useVerificationFlowController(
    options: UseVerificationFlowControllerOptions,
) {
    const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

    const submitVerification = useCallback(async () => {
        if (!state.idCardFile || !state.selfieFile) {
            options.notifications.onMissingPhotos(
                'Please capture both your ID card and selfie.',
            );
            return null;
        }

        dispatch({ type: 'START_SUBMIT' });

        try {
            const response = await options.submitVerification({
                documentNumber: state.documentNumber,
                idCardFile: state.idCardFile,
                selfieFile: state.selfieFile,
                challengeMode: options.challengeMode,
            });
            const result = normalizeVerificationResult(response);

            dispatch({ type: 'SET_RESULT', result });

            if (result.passed) {
                options.onVerificationPassed?.(result);
                options.notifications.onSuccess(
                    options.getSuccessDescription(result),
                );
            } else {
                options.notifications.onFailure(
                    result.failReason ??
                        'Please try again with better lighting.',
                );
            }

            return result;
        } catch (error) {
            dispatch({ type: 'FINISH_SUBMIT' });
            const message = options.normalizeErrorMessage?.(
                error,
                'Unable to verify your identity right now.',
            );
            options.notifications.onError(
                message ?? 'Unable to verify your identity right now.',
            );
            return null;
        }
    }, [options, state.documentNumber, state.idCardFile, state.selfieFile]);

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

export type VerificationFlowController = ReturnType<
    typeof useVerificationFlowController
>;
