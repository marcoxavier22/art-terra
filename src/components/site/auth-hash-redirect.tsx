'use client';
import * as React from 'react';

/**
 * Supabase invite / recovery e-mails sent from the dashboard land on the Site URL with the
 * session in the hash (#access_token=…&type=invite). Forward them to the page that lets the
 * person choose a password, keeping the hash (it never reaches the server).
 */
export function AuthHashRedirect() {
  React.useEffect(() => {
    const hash = window.location.hash;
    if (!hash.includes('access_token=')) return;
    if (!/[#&]type=(invite|recovery|signup|magiclink)(&|$)/.test(hash)) return;
    window.location.replace(`/admin/nova-senha${hash}`);
  }, []);
  return null;
}
