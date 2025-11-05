'use client';

import { useEffect, useState } from 'react';

interface ClientAuthProviderProps {
    children: React.ReactNode;
}

export default function ClientAuthProvider({ children }: ClientAuthProviderProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Only set mounted in browser environment
        if (typeof window !== 'undefined') {
            setMounted(true);
        }
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
    // Import Asgardeo only on client side to avoid SSR issues
    try {
        const { AuthProvider } = require('@asgardeo/auth-react');
        const { asgardeoConfig } = require('@/config/asgardeo');
        
        return (
            <AuthProvider config={asgardeoConfig}>
                {children}
            </AuthProvider>
        );
    } catch (error) {
        // If Asgardeo is not available, just return children
        // This allows the app to work without Asgardeo
        return <>{children}</>;
    }
}