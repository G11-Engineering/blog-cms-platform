'use client';

import { useAuthContext } from '@asgardeo/auth-react';
import { Container, Title, Button, Text, Stack, Paper, Group } from '@mantine/core';
import { useEffect, useState } from 'react';

export default function AsgardeoBasicTest() {
    const { state, signIn, signOut, getBasicUserInfo, getDecodedIDToken, isAuthenticated } = useAuthContext();
    const [userInfo, setUserInfo] = useState<any>(null);
    const [decodedToken, setDecodedToken] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const authStatus = await isAuthenticated();
                setAuthenticated(authStatus);
                
                if (authStatus) {
                    const info = await getBasicUserInfo();
                    setUserInfo(info);
                    
                    // Get decoded ID token to access groups and other claims
                    try {
                        const token = await getDecodedIDToken();
                        setDecodedToken(token);
                    } catch (tokenError) {
                        console.error('Error fetching decoded token:', tokenError);
                    }
                }
            } catch (error) {
                console.error('Error fetching auth info:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserInfo();
    }, [isAuthenticated, getBasicUserInfo, getDecodedIDToken]);

    const handleSignIn = () => {
        signIn();
    };

    const handleSignOut = () => {
        signOut();
    };

    if (loading) {
        return (
            <Container py="xl">
                <Text>Loading...</Text>
            </Container>
        );
    }

    return (
        <Container py="xl">
            <Stack gap="lg">
                <Title>Asgardeo Basic Authentication Test</Title>
                
                <Paper p="md" withBorder>
                    <Stack gap="sm">
                        <Text size="lg" fw={600}>Authentication Status</Text>
                        <Text>
                            Status: {authenticated ? 'Authenticated ✅' : 'Not Authenticated ❌'}
                        </Text>
                        <Text>
                            Loading: {state?.isLoading ? 'Yes' : 'No'}
                        </Text>
                    </Stack>
                </Paper>

                {authenticated && userInfo && (
                    <Paper p="md" withBorder>
                        <Stack gap="sm">
                            <Text size="lg" fw={600}>User Information</Text>
                            <Text>Email: {userInfo.email}</Text>
                            <Text>Username: {userInfo.username}</Text>
                            <Text>Display Name: {userInfo.displayName}</Text>
                        </Stack>
                    </Paper>
                )}

                {authenticated && decodedToken && (
                    <Paper p="md" withBorder>
                        <Stack gap="sm">
                            <Text size="lg" fw={600}>Token Claims (Including Groups)</Text>
                            <Text>Subject: {decodedToken.sub}</Text>
                            <Text>Organization: {decodedToken.org_name || 'N/A'}</Text>
                            <Text>
                                Groups: {decodedToken.groups ? 
                                    Array.isArray(decodedToken.groups) 
                                        ? decodedToken.groups.join(', ') 
                                        : decodedToken.groups 
                                    : 'No groups found'}
                            </Text>
                            <Text size="xs" c="dimmed">
                                All Claims: {JSON.stringify(decodedToken, null, 2)}
                            </Text>
                        </Stack>
                    </Paper>
                )}

                <Group gap="md">
                    {!authenticated ? (
                        <Button onClick={handleSignIn} variant="filled">
                            Sign In with Asgardeo
                        </Button>
                    ) : (
                        <Button onClick={handleSignOut} variant="outline">
                            Sign Out
                        </Button>
                    )}
                </Group>

                <Paper p="md" withBorder>
                    <Stack gap="xs">
                        <Text size="sm" fw={600}>Debug Info</Text>
                        <Text size="xs" c="dimmed">
                            State: {JSON.stringify(state, null, 2)}
                        </Text>
                    </Stack>
                </Paper>
            </Stack>
        </Container>
    );
}