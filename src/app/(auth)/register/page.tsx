import type { Metadata } from 'next';
import { RegistrationForm } from '@/components/register';

export const metadata: Metadata = {
    title: 'Create Account — ID Verify',
    description: 'Register with your National ID to create a verified account',
};

export default function RegisterPage() {
    return <RegistrationForm />;
}