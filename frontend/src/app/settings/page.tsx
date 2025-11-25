'use client';

import { Container, Stack, Title, Text, Card, Switch, Select, NumberInput, Button, Group, TextInput, Grid, Paper, Badge, Alert, Textarea, Loader } from '@mantine/core';
import { IconSettings, IconPalette, IconLayout, IconBell, IconShield, IconDatabase, IconDeviceFloppy, IconRefresh, IconMoon, IconSun, IconDeviceDesktop, IconEdit } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { notifications } from '@mantine/notifications';
import { useBlogSettings, useUpdateBlogSettings } from '@/hooks/useBlogSettings';
import { useForm } from '@mantine/form';
import { useAuth } from '@/contexts/AuthContext';

export default function SettingsPage() {
  const { isAuthenticated } = useAuth();
  const { data: blogSettingsData, isLoading: isLoadingBlogSettings } = useBlogSettings();
  const updateBlogSettings = useUpdateBlogSettings();
  
  const blogSettingsForm = useForm({
    initialValues: {
      blogTitle: '',
      blogDescription: '',
      blogLogoUrl: '',
      blogFaviconUrl: '',
      contactEmail: '',
      socialFacebook: '',
      socialTwitter: '',
      socialLinkedin: '',
      socialGithub: '',
      seoMetaTitle: '',
      seoMetaDescription: '',
      seoKeywords: '',
      googleAnalyticsId: '',
    },
    validate: {
      blogTitle: (value) => (!value || value.trim().length === 0 ? 'Blog title is required' : null),
      contactEmail: (value) => (value && !/^\S+@\S+$/.test(value) ? 'Invalid email format' : null),
    },
  });

  // Update form when blog settings are loaded
  useEffect(() => {
    if (blogSettingsData?.settings) {
      const settings = blogSettingsData.settings;
      blogSettingsForm.setValues({
        blogTitle: settings.blog_title || '',
        blogDescription: settings.blog_description || '',
        blogLogoUrl: settings.blog_logo_url || '',
        blogFaviconUrl: settings.blog_favicon_url || '',
        contactEmail: settings.contact_email || '',
        socialFacebook: settings.social_facebook || '',
        socialTwitter: settings.social_twitter || '',
        socialLinkedin: settings.social_linkedin || '',
        socialGithub: settings.social_github || '',
        seoMetaTitle: settings.seo_meta_title || '',
        seoMetaDescription: settings.seo_meta_description || '',
        seoKeywords: settings.seo_keywords || '',
        googleAnalyticsId: settings.google_analytics_id || '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blogSettingsData]);

  const handleBlogSettingsSubmit = async (values: typeof blogSettingsForm.values) => {
    if (!isAuthenticated) {
      notifications.show({
        title: 'Authentication Required',
        message: 'Please log in to update blog settings',
        color: 'red',
      });
      return;
    }

    try {
      await updateBlogSettings.mutateAsync({
        blogTitle: values.blogTitle,
        blogDescription: values.blogDescription,
        blogLogoUrl: values.blogLogoUrl,
        blogFaviconUrl: values.blogFaviconUrl,
        contactEmail: values.contactEmail,
        socialFacebook: values.socialFacebook,
        socialTwitter: values.socialTwitter,
        socialLinkedin: values.socialLinkedin,
        socialGithub: values.socialGithub,
        seoMetaTitle: values.seoMetaTitle,
        seoMetaDescription: values.seoMetaDescription,
        seoKeywords: values.seoKeywords,
        googleAnalyticsId: values.googleAnalyticsId,
      });
    } catch (error) {
      // Error is handled by the mutation
    }
  };

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
          {/* Blog Settings */}
          <Grid.Col span={12}>
            <Card withBorder shadow="sm" p="lg" radius="lg">
              <Stack gap="md">
                <Group>
                  <IconEdit size={24} color="#ff8c00" />
                  <Title order={3} c="wso2-black.9">Blog Settings</Title>
                </Group>
                
                {isLoadingBlogSettings ? (
                  <Group justify="center" p="xl">
                    <Loader size="md" />
                  </Group>
                ) : (
                  <form onSubmit={blogSettingsForm.onSubmit(handleBlogSettingsSubmit)}>
                    <Stack gap="md">
                      <TextInput
                        label="Blog Title"
                        description="The title of your blog (displayed in the header and meta tags)"
                        placeholder="My Awesome Blog"
                        required
                        maxLength={200}
                        {...blogSettingsForm.getInputProps('blogTitle')}
                      />
                      
                      <Textarea
                        label="Blog Description"
                        description="A brief description of your blog (used in meta tags and about sections)"
                        placeholder="Welcome to my blog where I share my thoughts..."
                        rows={4}
                        maxLength={1000}
                        {...blogSettingsForm.getInputProps('blogDescription')}
                      />
                      
                      <TextInput
                        label="Blog Logo URL"
                        description="URL to your blog logo (displayed in header)"
                        placeholder="https://example.com/logo.png"
                        {...blogSettingsForm.getInputProps('blogLogoUrl')}
                      />
                      
                      <TextInput
                        label="Favicon URL"
                        description="URL to your blog favicon (displayed in browser tab)"
                        placeholder="https://example.com/favicon.ico"
                        {...blogSettingsForm.getInputProps('blogFaviconUrl')}
                      />
                      
                      <TextInput
                        label="Contact Email"
                        description="Email address for contact and inquiries"
                        placeholder="contact@example.com"
                        {...blogSettingsForm.getInputProps('contactEmail')}
                      />
                      
                      <Group justify="flex-end">
                        <Button
                          type="submit"
                          leftSection={<IconDeviceFloppy size={16} />}
                          loading={updateBlogSettings.isLoading}
                          disabled={!isAuthenticated}
                          color="wso2-orange"
                        >
                          Save Blog Settings
                        </Button>
                      </Group>
                      
                      {!isAuthenticated && (
                        <Alert color="yellow" title="Authentication Required">
                          You need to be logged in to update blog settings.
                        </Alert>
                      )}
                    </Stack>
                  </form>
                )}
              </Stack>
            </Card>
          </Grid.Col>

          {/* Social Media Settings */}
          <Grid.Col span={12}>
            <Card withBorder shadow="sm" p="lg" radius="lg">
              <Stack gap="md">
                <Group>
                  <IconSettings size={24} color="#ff8c00" />
                  <Title order={3} c="wso2-black.9">Social Media</Title>
                </Group>
                
                <Grid>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <TextInput
                      label="Facebook URL"
                      placeholder="https://facebook.com/yourpage"
                      {...blogSettingsForm.getInputProps('socialFacebook')}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <TextInput
                      label="Twitter URL"
                      placeholder="https://twitter.com/yourhandle"
                      {...blogSettingsForm.getInputProps('socialTwitter')}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <TextInput
                      label="LinkedIn URL"
                      placeholder="https://linkedin.com/company/yourcompany"
                      {...blogSettingsForm.getInputProps('socialLinkedin')}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <TextInput
                      label="GitHub URL"
                      placeholder="https://github.com/yourusername"
                      {...blogSettingsForm.getInputProps('socialGithub')}
                    />
                  </Grid.Col>
                </Grid>
              </Stack>
            </Card>
          </Grid.Col>

          {/* SEO Settings */}
          <Grid.Col span={12}>
            <Card withBorder shadow="sm" p="lg" radius="lg">
              <Stack gap="md">
                <Group>
                  <IconSettings size={24} color="#ff8c00" />
                  <Title order={3} c="wso2-black.9">SEO Settings</Title>
                </Group>
                
                <TextInput
                  label="SEO Meta Title"
                  description="Default meta title for search engines (if not specified, blog title will be used)"
                  placeholder="My Awesome Blog - Best Content Platform"
                  maxLength={200}
                  {...blogSettingsForm.getInputProps('seoMetaTitle')}
                />
                
                <Textarea
                  label="SEO Meta Description"
                  description="Default meta description for search engines"
                  placeholder="A brief description of your blog for search engines..."
                  rows={3}
                  maxLength={500}
                  {...blogSettingsForm.getInputProps('seoMetaDescription')}
                />
                
                <TextInput
                  label="SEO Keywords"
                  description="Comma-separated keywords for SEO"
                  placeholder="blog, content, articles, news"
                  maxLength={500}
                  {...blogSettingsForm.getInputProps('seoKeywords')}
                />
                
                <TextInput
                  label="Google Analytics ID"
                  description="Your Google Analytics tracking ID (e.g., G-XXXXXXXXXX)"
                  placeholder="G-XXXXXXXXXX"
                  maxLength={100}
                  {...blogSettingsForm.getInputProps('googleAnalyticsId')}
                />
              </Stack>
            </Card>
          </Grid.Col>

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