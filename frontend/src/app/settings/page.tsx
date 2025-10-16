'use client';

import { Container, Stack, Title, Text, Card, Switch, Select, NumberInput, Button, Group, TextInput, Grid, Paper, Badge, Alert } from '@mantine/core';
import { IconSettings, IconPalette, IconLayout, IconBell, IconShield, IconDatabase, IconDeviceFloppy, IconRefresh, IconMoon, IconSun, IconDeviceDesktop } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { notifications } from '@mantine/notifications';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    // Theme Settings
    theme: 'light',
    primaryColor: '#ff8c00',
    fontSize: 'medium',
    borderRadius: 'medium',
    
    // Layout Settings
    sidebarCollapsed: false,
    showBreadcrumbs: true,
    showSearchBar: true,
    compactMode: false,
    
    // Notification Settings
    emailNotifications: true,
    pushNotifications: false,
    weeklyDigest: true,
    commentNotifications: true,
    
    // Content Settings
    postsPerPage: 12,
    autoSave: true,
    showDraftCount: true,
    enableRichText: true,
    
    // Privacy Settings
    profileVisibility: 'public',
    showEmail: false,
    allowComments: true,
    showOnlineStatus: true,
  });

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('blog-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error parsing saved settings:', error);
      }
    }
  }, []);

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = () => {
    try {
      localStorage.setItem('blog-settings', JSON.stringify(settings));
      notifications.show({
        title: 'Settings Saved',
        message: 'Your settings have been saved successfully!',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to save settings. Please try again.',
        color: 'red',
      });
    }
  };

  const handleResetSettings = () => {
    const defaultSettings = {
      theme: 'light',
      primaryColor: '#ff8c00',
      fontSize: 'medium',
      borderRadius: 'medium',
      sidebarCollapsed: false,
      showBreadcrumbs: true,
      showSearchBar: true,
      compactMode: false,
      emailNotifications: true,
      pushNotifications: false,
      weeklyDigest: true,
      commentNotifications: true,
      postsPerPage: 12,
      autoSave: true,
      showDraftCount: true,
      enableRichText: true,
      profileVisibility: 'public',
      showEmail: false,
      allowComments: true,
      showOnlineStatus: true,
    };
    setSettings(defaultSettings);
    notifications.show({
      title: 'Settings Reset',
      message: 'Settings have been reset to default values.',
      color: 'blue',
    });
  };

  const handleExportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'blog-settings.json';
    link.click();
    URL.revokeObjectURL(url);
    notifications.show({
      title: 'Settings Exported',
      message: 'Your settings have been exported successfully!',
      color: 'green',
    });
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <Stack align="center" gap="md" py="xl">
          <IconSettings size={60} color="#ff8c00" />
          <Title order={1} size="3rem" ta="center" c="wso2-black.9">
            Settings
          </Title>
          <Text size="lg" ta="center" c="wso2-black.6" maw={600}>
            Customize your 02 Blog Platform experience
          </Text>
        </Stack>

        {/* Settings Sections */}
        <Grid>
          {/* Theme Settings */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card withBorder shadow="sm" p="lg" radius="lg">
              <Stack gap="md">
                <Group>
                  <IconPalette size={24} color="#ff8c00" />
                  <Title order={3} c="wso2-black.9">Theme & Appearance</Title>
                </Group>
                
                <Select
                  label="Theme"
                  description="Choose your preferred theme"
                  value={settings.theme}
                  onChange={(value) => handleSettingChange('theme', value)}
                  data={[
                    { value: 'light', label: 'Light' },
                    { value: 'dark', label: 'Dark' },
                    { value: 'auto', label: 'Auto (System)' },
                  ]}
                />

                <TextInput
                  label="Primary Color"
                  description="Customize the primary color (hex code)"
                  value={settings.primaryColor}
                  onChange={(event) => handleSettingChange('primaryColor', event.currentTarget.value)}
                  placeholder="#ff8c00"
                />

                <Select
                  label="Font Size"
                  description="Adjust the text size"
                  value={settings.fontSize}
                  onChange={(value) => handleSettingChange('fontSize', value)}
                  data={[
                    { value: 'small', label: 'Small' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'large', label: 'Large' },
                  ]}
                />

                <Select
                  label="Border Radius"
                  description="Adjust the border radius of elements"
                  value={settings.borderRadius}
                  onChange={(value) => handleSettingChange('borderRadius', value)}
                  data={[
                    { value: 'small', label: 'Small' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'large', label: 'Large' },
                  ]}
                />
              </Stack>
            </Card>
          </Grid.Col>

          {/* Layout Settings */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card withBorder shadow="sm" p="lg" radius="lg">
              <Stack gap="md">
                <Group>
                  <IconLayout size={24} color="#ff8c00" />
                  <Title order={3} c="wso2-black.9">Layout & Navigation</Title>
                </Group>
                
                <Switch
                  label="Collapse Sidebar"
                  description="Start with sidebar collapsed"
                  checked={settings.sidebarCollapsed}
                  onChange={(event) => handleSettingChange('sidebarCollapsed', event.currentTarget.checked)}
                />

                <Switch
                  label="Show Breadcrumbs"
                  description="Display navigation breadcrumbs"
                  checked={settings.showBreadcrumbs}
                  onChange={(event) => handleSettingChange('showBreadcrumbs', event.currentTarget.checked)}
                />

                <Switch
                  label="Show Search Bar"
                  description="Display search bar in header"
                  checked={settings.showSearchBar}
                  onChange={(event) => handleSettingChange('showSearchBar', event.currentTarget.checked)}
                />

                <Switch
                  label="Compact Mode"
                  description="Use compact spacing and smaller elements"
                  checked={settings.compactMode}
                  onChange={(event) => handleSettingChange('compactMode', event.currentTarget.checked)}
                />
              </Stack>
            </Card>
          </Grid.Col>

          {/* Notification Settings */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card withBorder shadow="sm" p="lg" radius="lg">
              <Stack gap="md">
                <Group>
                  <IconBell size={24} color="#ff8c00" />
                  <Title order={3} c="wso2-black.9">Notifications</Title>
                </Group>
                
                <Switch
                  label="Email Notifications"
                  description="Receive notifications via email"
                  checked={settings.emailNotifications}
                  onChange={(event) => handleSettingChange('emailNotifications', event.currentTarget.checked)}
                />

                <Switch
                  label="Push Notifications"
                  description="Receive browser push notifications"
                  checked={settings.pushNotifications}
                  onChange={(event) => handleSettingChange('pushNotifications', event.currentTarget.checked)}
                />

                <Switch
                  label="Weekly Digest"
                  description="Get weekly summary of activity"
                  checked={settings.weeklyDigest}
                  onChange={(event) => handleSettingChange('weeklyDigest', event.currentTarget.checked)}
                />

                <Switch
                  label="Comment Notifications"
                  description="Get notified about new comments"
                  checked={settings.commentNotifications}
                  onChange={(event) => handleSettingChange('commentNotifications', event.currentTarget.checked)}
                />
              </Stack>
            </Card>
          </Grid.Col>

          {/* Content Settings */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card withBorder shadow="sm" p="lg" radius="lg">
              <Stack gap="md">
                <Group>
                  <IconDatabase size={24} color="#ff8c00" />
                  <Title order={3} c="wso2-black.9">Content & Posts</Title>
                </Group>
                
                <NumberInput
                  label="Posts Per Page"
                  description="Number of posts to show per page"
                  value={settings.postsPerPage}
                  onChange={(value) => handleSettingChange('postsPerPage', value)}
                  min={5}
                  max={50}
                />

                <Switch
                  label="Auto Save"
                  description="Automatically save drafts"
                  checked={settings.autoSave}
                  onChange={(event) => handleSettingChange('autoSave', event.currentTarget.checked)}
                />

                <Switch
                  label="Show Draft Count"
                  description="Display draft count in navigation"
                  checked={settings.showDraftCount}
                  onChange={(event) => handleSettingChange('showDraftCount', event.currentTarget.checked)}
                />

                <Switch
                  label="Rich Text Editor"
                  description="Enable rich text editing for posts"
                  checked={settings.enableRichText}
                  onChange={(event) => handleSettingChange('enableRichText', event.currentTarget.checked)}
                />
              </Stack>
            </Card>
          </Grid.Col>

          {/* Privacy Settings */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card withBorder shadow="sm" p="lg" radius="lg">
              <Stack gap="md">
                <Group>
                  <IconShield size={24} color="#ff8c00" />
                  <Title order={3} c="wso2-black.9">Privacy & Security</Title>
                </Group>
                
                <Select
                  label="Profile Visibility"
                  description="Who can see your profile"
                  value={settings.profileVisibility}
                  onChange={(value) => handleSettingChange('profileVisibility', value)}
                  data={[
                    { value: 'public', label: 'Public' },
                    { value: 'followers', label: 'Followers Only' },
                    { value: 'private', label: 'Private' },
                  ]}
                />

                <Switch
                  label="Show Email"
                  description="Display email on profile"
                  checked={settings.showEmail}
                  onChange={(event) => handleSettingChange('showEmail', event.currentTarget.checked)}
                />

                <Switch
                  label="Allow Comments"
                  description="Allow others to comment on your posts"
                  checked={settings.allowComments}
                  onChange={(event) => handleSettingChange('allowComments', event.currentTarget.checked)}
                />

                <Switch
                  label="Show Online Status"
                  description="Display when you're online"
                  checked={settings.showOnlineStatus}
                  onChange={(event) => handleSettingChange('showOnlineStatus', event.currentTarget.checked)}
                />
              </Stack>
            </Card>
          </Grid.Col>

          {/* System Info */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card withBorder shadow="sm" p="lg" radius="lg">
              <Stack gap="md">
                <Title order={3} c="wso2-black.9">System Information</Title>
                
                <Paper p="md" withBorder>
                  <Stack gap="xs">
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">Platform</Text>
                      <Badge color="blue">02 Blog Platform</Badge>
                    </Group>
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">Version</Text>
                      <Badge color="green">v1.0.0</Badge>
                    </Group>
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">Theme</Text>
                      <Badge color="orange">Mantine UI</Badge>
                    </Group>
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">Framework</Text>
                      <Badge color="purple">Next.js 14</Badge>
                    </Group>
                  </Stack>
                </Paper>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Action Buttons */}
        <Card withBorder shadow="sm" p="lg" radius="lg">
          <Stack gap="md">
            <Title order={3} c="wso2-black.9">Actions</Title>
            
            <Alert color="blue" title="Settings Storage">
              Your settings are stored locally in your browser. To sync across devices, 
              you'll need to create an account and enable cloud sync.
            </Alert>

            <Group justify="center" gap="md" wrap="wrap">
              <Button
                leftSection={<IconDeviceFloppy size={16} />}
                onClick={handleSaveSettings}
                size="lg"
                color="wso2-orange"
              >
                Save Settings
              </Button>
              
              <Button
                leftSection={<IconRefresh size={16} />}
                onClick={handleResetSettings}
                variant="outline"
                size="lg"
                color="wso2-orange"
              >
                Reset to Default
              </Button>

              <Button
                onClick={handleExportSettings}
                variant="light"
                size="lg"
                color="wso2-orange"
              >
                Export Settings
              </Button>
            </Group>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}