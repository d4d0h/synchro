'use client';

import { type ReactNode } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { GoogleAuthProvider } from '@/lib/googleAuth';

export function Providers({ children }: { children: ReactNode }) {
    // Hardcoded for testing branch accessibility
    const clientId = '960567403497-pvn3epqhkm80fdl3sfnlg6atk0hkns50.apps.googleusercontent.com';

    return (
        <GoogleOAuthProvider clientId={clientId}>
            <GoogleAuthProvider>
                {children}
            </GoogleAuthProvider>
        </GoogleOAuthProvider>
    );
}
