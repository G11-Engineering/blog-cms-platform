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
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div>Loading...</div>;
    }

    return (
        <AuthProvider config={asgardeoConfig}>
            {children}
        </AuthProvider>
    );
}