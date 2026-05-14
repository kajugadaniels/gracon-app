import { VerifyForm } from '@/components/pages/verify';
import styles from './verify-page.module.css';

export const metadata = {
    title: 'Verify Signature',
    description: 'Verify the authenticity of a digitally signed document. No account required.',
};

export default function VerifyPage() {
    return (
        <div className={styles.page}>
            {/* Minimal header — no nav required, this page is public */}
            <div className={styles.header}>
                <div className={styles.brand}>
                    <div className={styles.brandMark}>
                        G
                    </div>
                    <span className={styles.brandName}>
                        Gracon 360
                    </span>
                </div>
                <p className={styles.tagline}>
                    Digital Trust Infrastructure Platform
                </p>
            </div>

            <VerifyForm />

            <p className={styles.assurance}>
                This verification is performed mathematically — no trust in any person or institution is required. The result is either valid or it is not.
            </p>
        </div>
    );
}
