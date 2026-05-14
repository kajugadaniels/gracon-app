'use client';

import { useEffect } from 'react';

const APP_TITLE_SUFFIX = 'Gracon 360';

export function formatPageTitle(title: string) {
    const trimmedTitle = title.trim();
    return trimmedTitle ? `${trimmedTitle} | ${APP_TITLE_SUFFIX}` : APP_TITLE_SUFFIX;
}

export function usePageTitle(title: string) {
    useEffect(() => {
        document.title = formatPageTitle(title);
    }, [title]);
}
