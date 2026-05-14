'use client';

import type { CSSProperties } from 'react';
import { Button } from './Button';
import styles from './RouteRecoveryState.module.css';

type RouteRecoveryKind = 'error' | 'not-found';

interface RouteRecoveryAction {
    label: string;
    onClick?: () => void;
    href?: string;
    variant?: 'primary' | 'ghost';
}

interface RouteRecoveryStateProps {
    kind?: RouteRecoveryKind;
    eyebrow?: string;
    title: string;
    message: string;
    minHeight?: string;
    error?: Error & { digest?: string };
    actions?: RouteRecoveryAction[];
}

export function RouteRecoveryState({
    kind = 'error',
    eyebrow = kind === 'error' ? 'Recovery' : 'Not found',
    title,
    message,
    minHeight,
    error,
    actions = [],
}: RouteRecoveryStateProps) {
    const className = [
        styles.card,
        kind === 'error' ? styles.error : styles.notFound,
    ].join(' ');
    const shellStyle = minHeight ? { '--route-recovery-min-height': minHeight } as CSSProperties : undefined;

    return (
        <section className={styles.shell} style={shellStyle} aria-live="polite">
            <div className={className}>
                <div className={styles.badge} aria-hidden="true">
                    {kind === 'error' ? '!' : '?'}
                </div>
                <p className={styles.eyebrow}>{eyebrow}</p>
                <h1 className={styles.title}>{title}</h1>
                <p className={styles.message}>{message}</p>

                {actions.length > 0 ? (
                    <div className={styles.actions}>
                        {actions.map((action) => (
                            <Button
                                key={action.label}
                                type="button"
                                variant={action.variant ?? 'ghost'}
                                onClick={() => {
                                    if (action.onClick) {
                                        action.onClick();
                                        return;
                                    }
                                    if (action.href) {
                                        window.location.assign(action.href);
                                    }
                                }}
                            >
                                {action.label}
                            </Button>
                        ))}
                    </div>
                ) : null}

                {error?.digest ? (
                    <p className={styles.details}>Error reference: {error.digest}</p>
                ) : null}
            </div>
        </section>
    );
}
