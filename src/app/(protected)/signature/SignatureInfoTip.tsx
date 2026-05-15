import styles from './SignatureInfoTip.module.css';

export function SignatureInfoTip({ text }: { text: string }) {
    return (
        <span className={styles.infoTip} tabIndex={0} data-tooltip={text}>
            i
        </span>
    );
}
