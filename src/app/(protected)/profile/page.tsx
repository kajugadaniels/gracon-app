/**
 * Compatibility redirect for the old profile route.
 */
import { redirect } from 'next/navigation';

/**
 * Sends existing profile links to the settings-owned profile page.
 */
export default function ProfileRedirectPage() {
    redirect('/settings/profile');
}
