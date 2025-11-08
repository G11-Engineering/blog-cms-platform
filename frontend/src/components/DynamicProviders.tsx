'use client';

import { AuthProvider as AsgardeoAuthProvider } from '@asgardeo/auth-react';
import { AuthProvider } from '@/contexts/AuthContext';
import type { ReactNode } from 'react';

interface DynamicProvidersProps {
    children: ReactNode;
}

const asgardeoConfig = {
    signInRedirectURL: "http://localhost:3000",
    signOutRedirectURL: "http://localhost:3000",
    clientID: "Y4Yrhdn2PcIxQRLfWYDdEycYTfUa",
    baseUrl: "https://api.asgardeo.io/t/g11engineering",
    scope: ["openid", "profile", "email", "groups"]
};

export default function DynamicProviders({ children }: DynamicProvidersProps) {
    return (
        <AsgardeoAuthProvider config={asgardeoConfig}>
            <AuthProvider>
                {children}
            </AuthProvider>
        </AsgardeoAuthProvider>
    );
}
