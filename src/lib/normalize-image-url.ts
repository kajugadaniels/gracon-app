export function normalizeImageUrl(value: string | null | undefined): string | null {
    if (!value) return null;

    const trimmed = value.trim();
    if (!trimmed) return null;

    if (
        trimmed.startsWith('http://') ||
        trimmed.startsWith('https://') ||
        trimmed.startsWith('blob:') ||
        trimmed.startsWith('data:')
    ) {
        return trimmed;
    }

    return null;
}
