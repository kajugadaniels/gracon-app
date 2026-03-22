'use client';

import { useRef, useState } from 'react';
import { PremiumLoader, toast } from '@/components/ui';
import { uploadProfileImageApi } from '@/api/users/upload-profile-image.api';

// ── Constants ──────────────────────────────────────────────────────────────

const MAX_SIZE_BYTES = 3 * 1024 * 1024; // 3 MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// ── Props ──────────────────────────────────────────────────────────────────

interface ProfileImageUploadProps {
    userId: string;
    imageUrl: string | null;
    initials: string;
    onUpload: (newUrl: string) => void;
}

// ── Component ──────────────────────────────────────────────────────────────

export function ProfileImageUpload({
    imageUrl,
    initials,
    onUpload,
}: ProfileImageUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [optimisticUrl, setOptimisticUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [hovered, setHovered] = useState(false);

    const displayUrl = optimisticUrl ?? imageUrl;

    const handleClick = () => {
        if (!uploading) fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!e.target) return;
        // Reset so the same file can be re-selected after a failure
        (e.target as HTMLInputElement).value = '';

        if (!file) return;

        // Client-side guards — server validates too, but fail fast
        if (!ACCEPTED_TYPES.includes(file.type)) {
            toast.error('Invalid file type. Please upload a JPEG, PNG, or WebP image.');
            return;
        }

        if (file.size > MAX_SIZE_BYTES) {
            toast.error('Image too large. Maximum size is 3 MB.');
            return;
        }

        // Optimistic preview — show the local object URL immediately
        const localUrl = URL.createObjectURL(file);
        setOptimisticUrl(localUrl);
        setUploading(true);

        try {
            const res = await uploadProfileImageApi(file);
            const newUrl = res.data.profileImageUrl;

            // Replace optimistic URL with the real presigned S3 URL
            URL.revokeObjectURL(localUrl);
            setOptimisticUrl(newUrl);
            onUpload(newUrl);
            toast.success('Profile photo updated');
        } catch {
            // Roll back the optimistic preview on failure
            URL.revokeObjectURL(localUrl);
            setOptimisticUrl(null);
            toast.error('Failed to upload photo. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div style={{ position: 'relative', display: 'inline-block' }}>
            {/* Avatar circle */}
            <div
                role="button"
                aria-label="Upload profile photo"
                tabIndex={0}
                onClick={handleClick}
                onKeyDown={(e) => e.key === 'Enter' && handleClick()}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                style={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: 'var(--color-primary-subtle)',
                    border: `2px solid ${hovered ? 'var(--color-primary)' : 'var(--color-border-primary)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 26,
                    fontWeight: 700,
                    color: 'var(--color-primary)',
                    cursor: uploading ? 'default' : 'pointer',
                    overflow: 'hidden',
                    position: 'relative',
                    transition: 'border-color 180ms ease, box-shadow 180ms ease',
                    boxShadow: hovered && !uploading
                        ? '0 0 0 4px rgba(91,35,255,0.12)'
                        : 'none',
                    flexShrink: 0,
                }}
            >
                {/* Photo or initials */}
                {displayUrl ? (
                    <img
                        src={displayUrl}
                        alt="Profile"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                ) : (
                    initials
                )}

                {/* Hover overlay — camera icon */}
                {hovered && !uploading && (
                    <div
                        className="animate-fade-in"
                        style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'rgba(22,16,58,0.52)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '50%',
                        }}
                    >
                        <svg
                            width="22" height="22" viewBox="0 0 24 24"
                            fill="none" stroke="white" strokeWidth="2"
                            strokeLinecap="round" strokeLinejoin="round"
                        >
                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                            <circle cx="12" cy="13" r="4" />
                        </svg>
                    </div>
                )}

                {/* Upload spinner overlay */}
                {uploading && (
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'rgba(22,16,58,0.60)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '50%',
                        }}
                    >
                        <PremiumLoader size={28} color="white" />
                    </div>
                )}
            </div>

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                aria-hidden="true"
            />
        </div>
    );
}
