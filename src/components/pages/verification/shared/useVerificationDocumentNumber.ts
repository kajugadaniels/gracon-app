'use client';

/**
 * Shared document-number state and validation for verification entry steps.
 */

import { useState } from 'react';
import { getVerificationDocumentNumberError } from './verification-feedback';

export type UseVerificationDocumentNumberOptions = {
    onConfirm: (documentNumber: string) => void;
    onInvalidLength: (message: string) => void;
};

export type VerificationDocumentNumberState = {
    documentNumber: string;
    documentNumberError?: string;
    setDocumentNumber: (value: string) => void;
    submitDocumentNumber: () => void;
};

/**
 * Manages the verification document-number input and enforces the shared
 * 16-digit national-ID requirement.
 */
export function useVerificationDocumentNumber({
    onConfirm,
    onInvalidLength,
}: UseVerificationDocumentNumberOptions): VerificationDocumentNumberState {
    const [documentNumber, setDocumentNumberValue] = useState('');
    const [documentNumberError, setDocumentNumberError] = useState<string>();

    function setDocumentNumber(value: string) {
        setDocumentNumberValue(value);
        if (documentNumberError) {
            setDocumentNumberError(undefined);
        }
    }

    function submitDocumentNumber() {
        const message = getVerificationDocumentNumberError(documentNumber);
        if (message) {
            setDocumentNumberError(message);
            onInvalidLength(message);
            return;
        }

        setDocumentNumberError(undefined);
        onConfirm(documentNumber);
    }

    return {
        documentNumber,
        documentNumberError,
        setDocumentNumber,
        submitDocumentNumber,
    };
}
