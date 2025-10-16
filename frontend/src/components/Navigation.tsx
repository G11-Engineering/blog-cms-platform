'use client';

import { Container, Group, Button, Text, Box } from '@mantine/core';
import { useAuthContext } from '@asgardeo/auth-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export function Navigation() {
  const { signIn, signOut, isAuthenticated, getBasicUserInfo } = useAuthContext();
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authStatus = await isAuthenticated();
        setAuthenticated(authStatus);
        
        if (authStatus) {
          const userInfo = await getBasicUserInfo();
          setUser(userInfo);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      }
    };

    checkAuth();
  }, [isAuthenticated, getBasicUserInfo]);

  const handleLogout = () => {
    signOut();
    setAuthenticated(false);
    setUser(null);
  };

  return (
    <Box
      style={{
        background: 'linear-gradient(135deg, #ff8c00 0%, #e67e00 100%)', // Softer WSO2 Orange
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 2px 20px rgba(255, 140, 0, 0.08)', // Softer shadow
      }}
    >
      <Container size="xl" py="md">
        <Group justify="space-between">
          <Group gap="md">
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '18px',
              }}
            >
              W
            </div>
            <Box>
              <Text size="xl" fw={700} c="white" component={Link} href="/" style={{ textDecoration: 'none' }}>
                WSO2 Blog Platform
              </Text>
              <Text size="xs" c="white" opacity={0.8}>
                Enterprise Content & Stories
              </Text>
            </Box>
          </Group>
          
          <Group>
            <Button 
              component={Link} 
              href="/posts" 
              variant="subtle"
              c="white"
              style={{ color: 'white' }}
            >
              Posts
            </Button>
            <Button 
              component={Link} 
              href="/categories" 
              variant="subtle"
              c="white"
              style={{ color: 'white' }}
            >
              Categories
            </Button>
            <Button 
              component={Link} 
              href="/tags" 
              variant="subtle"
              c="white"
              style={{ color: 'white' }}
            >
              Tags
            </Button>
            
            {authenticated ? (
              <Group>
                <Button 
                  component={Link} 
                  href="/posts/create" 
                  variant="white"
                  color="wso2-orange"
                  style={{
                    background: 'white',
                    color: '#FF7300',
                    fontWeight: 600,
                  }}
                >
                  Write Post
                </Button>
                
                <Button 
                  variant="outline"
                  c="white"
                  onClick={handleLogout}
                  style={{
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    color: 'white',
                    background: 'rgba(255, 255, 255, 0.1)',
                  }}
                >
                  Logout
                </Button>
              </Group>
            ) : (
              <Group>
                <Button 
                  onClick={() => signIn()}
                  variant="outline"
                  c="white"
                  style={{
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    color: 'white',
                    background: 'rgba(255, 255, 255, 0.1)',
                  }}
                >
                  Login
                </Button>
                <Button 
                  component={Link} 
                  href="/auth/register" 
                  variant="white"
                  color="wso2-orange"
                  style={{
                    background: 'white',
                    color: '#FF7300',
                    fontWeight: 600,
                  }}
                >
                  Sign Up
                </Button>
              </Group>
            )}
          </Group>
        </Group>
      </Container>
    </Box>
  );
}