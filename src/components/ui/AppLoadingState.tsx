'use client';

import type { CSSProperties } from 'react';
import styles from './AppLoadingState.module.css';

type AppLoadingStateVariant = 'fullscreen' | 'panel';

interface AppLoadingStateProps {
    message?: string;
    detail?: string;
    variant?: AppLoadingStateVariant;
    size?: number;
    minHeight?: string;
    className?: string;
}

export function AppLoadingState({
    message = 'Preparing your workspace...',
    detail = 'Checking account and security state',
    variant = 'panel',
    size = 44,
    minHeight,
    className,
}: AppLoadingStateProps) {
    const style = {
        '--app-loading-size': `${size}px`,
        ...(minHeight ? { '--app-loading-min-height': minHeight } : {}),
    } as CSSProperties;
    const classNames = [
        styles.state,
        styles[variant],
        className,
    ].filter(Boolean).join(' ');

    return (
        <div className={classNames} style={style} role="status" aria-live="polite">
            <div className={styles.content}>
                <div className={styles.identityMark} aria-hidden="true">
                    <span className={styles.pulse} />
                    <span className={styles.shield} />
                </div>
                <div className={styles.textBlock}>
                    <p className={styles.message}>{message}</p>
                    {detail ? <p className={styles.detail}>{detail}</p> : null}
                </div>
                <span className={styles.progressTrack} aria-hidden="true">
                    <span className={styles.progressBar} />
                </span>
            </div>
        </div>
    );
}
