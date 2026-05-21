/**
 * Workspace settings page for cross-platform invitation defaults.
 */
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    getUserPreferencesApi,
    updateUserPreferencesApi,
    type UserInviteVerificationPreference,
    type UserPreferencesResponse,
} from '@/api/users';
import { AppLoadingState, Button, toast } from '@/components/ui';
import { useApi } from '@/lib/hooks/useApi';
import { usePageTitle } from '@/lib/hooks/usePageTitle';
import styles from './settings-page.module.css';

const NO_VERIFICATION: UserInviteVerificationPreference = 'NO_VERIFICATION';
const EMAIL_OTP: UserInviteVerificationPreference = 'EMAIL_OTP';
const IDENTITY_VERIFICATION: UserInviteVerificationPreference = 'IDENTITY_VERIFICATION';

const RECOMMENDED_DEFAULTS: UserPreferencesResponse = {
    defaultDocumentInviteVerifications: [NO_VERIFICATION],
    defaultMeetingInviteVerifications: [NO_VERIFICATION],
};

const VERIFICATION_OPTIONS: Array<{
    value: UserInviteVerificationPreference;
    label: string;
    description: string;
}> = [
    {
        value: NO_VERIFICATION,
        label: 'No extra verification',
        description: 'The recipient only needs to sign in with their Gracon account.',
    },
    {
        value: EMAIL_OTP,
        label: 'Email verification',
        description: 'Ask the recipient to confirm the invited email with a one-time code.',
    },
    {
        value: IDENTITY_VERIFICATION,
        label: 'Identity verification',
        description: 'Ask the recipient to pass the Gracon identity challenge before accepting.',
    },
];

/**
 * Renders user-owned defaults for document and meeting invitations.
 */
export default function SettingsPage() {
    usePageTitle('Settings');

    const [preferences, setPreferences] =
        useState<UserPreferencesResponse>(RECOMMENDED_DEFAULTS);
    const [savedPreferences, setSavedPreferences] =
        useState<UserPreferencesResponse>(RECOMMENDED_DEFAULTS);

    const { execute: fetchPreferences, loading: loadingPreferences } = useApi(
        getUserPreferencesApi,
        {
            onSuccess: (data) => {
                setPreferences(data);
                setSavedPreferences(data);
            },
        },
    );

    const { execute: savePreferences, loading: savingPreferences } = useApi(
        updateUserPreferencesApi,
        {
            showErrorToast: false,
            onSuccess: (data) => {
                setPreferences(data);
                setSavedPreferences(data);
                toast.success('Settings saved', {
                    description: 'Your invitation defaults will be used across Gracon workspaces.',
                });
            },
            onError: (message) => {
                toast.error('Unable to save settings', { description: message });
            },
        },
    );

    useEffect(() => { void fetchPreferences(); }, [fetchPreferences]);

    const hasChanges = useMemo(
        () => JSON.stringify(preferences) !== JSON.stringify(savedPreferences),
        [preferences, savedPreferences],
    );

    const updateGroup = useCallback((
        key: keyof UserPreferencesResponse,
        value: UserInviteVerificationPreference,
    ) => {
        setPreferences((current) => {
            const currentValues = current[key];
            if (value === NO_VERIFICATION) {
                const nextValues = currentValues.includes(NO_VERIFICATION)
                    ? [EMAIL_OTP]
                    : [NO_VERIFICATION];

                return { ...current, [key]: nextValues };
            }

            const activeValues = currentValues.filter((item) => item !== NO_VERIFICATION);
            const nextValues = activeValues.includes(value)
                ? activeValues.filter((item) => item !== value)
                : [...activeValues, value];

            return {
                ...current,
                [key]: nextValues.length > 0 ? normalizePreferenceOrder(nextValues) : [NO_VERIFICATION],
            };
        });
    }, []);

    const resetToRecommended = () => {
        setPreferences(RECOMMENDED_DEFAULTS);
    };

    const handleSave = () => {
        void savePreferences(preferences);
    };

    if (loadingPreferences) {
        return (
            <AppLoadingState
                variant="panel"
                minHeight="60vh"
                message="Loading settings..."
                detail="Preparing your invitation defaults"
            />
        );
    }

    return (
        <section className={styles.sectionPanel} aria-label="Workspace settings">
            <div className={styles.panelHero}>
                <div>
                    <p className={styles.eyebrow}>Workspace settings</p>
                    <h1>Choose the invitation defaults Gracon should remember.</h1>
                    <p>
                        These defaults preselect document and meeting invitation checks. Login is
                        always required, and each workspace still enforces its own access rules.
                    </p>
                </div>
                <div className={styles.savePanel}>
                    <span>{hasChanges ? 'Unsaved changes' : 'Settings are current'}</span>
                    <div className={styles.saveActions}>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={resetToRecommended}
                            disabled={savingPreferences}
                        >
                            Reset defaults
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            loading={savingPreferences}
                            loadingText="Saving..."
                            disabled={!hasChanges || savingPreferences}
                            onClick={handleSave}
                        >
                            Save settings
                        </Button>
                    </div>
                </div>
            </div>

            <section className={styles.preferenceGrid} aria-label="Invitation defaults">
                <PreferenceCard
                    title="Document invitations"
                    description="Used when you share a document from the document workspace."
                    values={preferences.defaultDocumentInviteVerifications}
                    onToggle={(value) => updateGroup('defaultDocumentInviteVerifications', value)}
                />
                <PreferenceCard
                    title="Meeting invitations"
                    description="Used when you invite people to live or scheduled meetings."
                    values={preferences.defaultMeetingInviteVerifications}
                    onToggle={(value) => updateGroup('defaultMeetingInviteVerifications', value)}
                />
            </section>

            <aside className={styles.note} aria-label="Settings behavior">
                <strong>How this works</strong>
                <p>
                    Selecting “No extra verification” disables email and identity checks for that
                    default. Selecting email or identity automatically turns “No extra verification”
                    off for that workspace.
                </p>
            </aside>
        </section>
    );
}

/**
 * Renders one invitation-default preference group.
 */
function PreferenceCard({
    title,
    description,
    values,
    onToggle,
}: {
    title: string;
    description: string;
    values: UserInviteVerificationPreference[];
    onToggle: (value: UserInviteVerificationPreference) => void;
}) {
    return (
        <article className={styles.card}>
            <div className={styles.cardHeader}>
                <div>
                    <h2>{title}</h2>
                    <p>{description}</p>
                </div>
                <span>{formatPreferenceSummary(values)}</span>
            </div>

            <div className={styles.optionList}>
                {VERIFICATION_OPTIONS.map((option) => {
                    const checked = values.includes(option.value);
                    const disabled = option.value !== NO_VERIFICATION && values.includes(NO_VERIFICATION);
                    return (
                        <label
                            key={option.value}
                            className={[
                                styles.option,
                                checked ? styles.optionChecked : '',
                                disabled ? styles.optionDisabled : '',
                            ].filter(Boolean).join(' ')}
                        >
                            <input
                                type="checkbox"
                                checked={checked}
                                disabled={disabled}
                                onChange={() => onToggle(option.value)}
                            />
                            <span className={styles.optionControl} aria-hidden="true" />
                            <span>
                                <strong>{option.label}</strong>
                                <small>{option.description}</small>
                            </span>
                        </label>
                    );
                })}
            </div>
        </article>
    );
}

/**
 * Keeps active verification gates in the same order across UI and API saves.
 */
function normalizePreferenceOrder(
    values: UserInviteVerificationPreference[],
): UserInviteVerificationPreference[] {
    return [EMAIL_OTP, IDENTITY_VERIFICATION].filter((item) => values.includes(item));
}

/**
 * Returns a compact summary for the current preference group.
 */
function formatPreferenceSummary(values: UserInviteVerificationPreference[]): string {
    if (values.includes(NO_VERIFICATION)) return 'No extra checks';
    if (values.length === 2) return 'Email + identity';
    if (values.includes(EMAIL_OTP)) return 'Email only';
    if (values.includes(IDENTITY_VERIFICATION)) return 'Identity only';
    return 'No extra checks';
}
