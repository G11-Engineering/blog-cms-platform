'use client';

import { AuthProvider } from '@asgardeo/auth-react';
import type { ReactNode } from 'react';

interface AsgardeoProviderProps {
    children: ReactNode;
}

const asgardeoConfig = {
    signInRedirectURL: "http://localhost:3000",
    signOutRedirectURL: "http://localhost:3000",
    clientID: "Y4Yrhdn2PcIxQRLfWYDdEycYTfUa",
    baseUrl: "https://api.asgardeo.io/t/g11engineering",
    scope: ["openid", "profile", "email", "groups"]
};

export default function AsgardeoProvider({ children }: AsgardeoProviderProps) {
    return (
        <AuthProvider config={asgardeoConfig}>
            {children}
        </AuthProvider>
    );
}
