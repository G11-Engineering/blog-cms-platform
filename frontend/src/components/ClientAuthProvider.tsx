'use client';

import { useEffect, useState } from 'react';
import { AuthProvider } from '@asgardeo/auth-react';
import { asgardeoConfig } from '@/config/asgardeo';


interface ClientAuthProviderProps {
    children: React.ReactNode;
}

export default function ClientAuthProvider({ children }: ClientAuthProviderProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Only set mounted in browser environment
        setMounted(true);
    }, []);

    // During SSR, return children without Asgardeo provider
    // Asgardeo is only needed for client-side auth, which we're not actively using
    if (typeof window === 'undefined') {
        return <>{children}</>;
    }

    // If not mounted yet, return children (will mount on client)
    if (!mounted) {
        return <>{children}</>;
    }

    // Only wrap with Asgardeo provider if mounted and in browser
    // Note: We're using local auth primarily, so this is optional
    return (
        <AuthProvider config={asgardeoConfig}>
            {children}
        </AuthProvider>
    );
}