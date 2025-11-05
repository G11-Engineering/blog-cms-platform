import { useQuery, useMutation, useQueryClient } from 'react-query';
import { blogSettingsApi } from '@/services/blogSettingsApi';
import { notifications } from '@mantine/notifications';

export function useBlogSettings() {
  return useQuery({
    queryKey: ['blogSettings'],
    queryFn: () => blogSettingsApi.getBlogSettings(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUpdateBlogSettings() {
  const queryClient = useQueryClient();
  
  return useMutation(
    (data: {
      blogTitle: string;
      blogDescription?: string;
      blogLogoUrl?: string;
      blogFaviconUrl?: string;
      contactEmail?: string;
      socialFacebook?: string;
      socialTwitter?: string;
      socialLinkedin?: string;
      socialGithub?: string;
      seoMetaTitle?: string;
      seoMetaDescription?: string;
      seoKeywords?: string;
      googleAnalyticsId?: string;
    }) => blogSettingsApi.updateBlogSettings(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['blogSettings']);
        notifications.show({
          title: 'Success',
          message: 'Blog settings updated successfully',
          color: 'green',
        });
      },
      onError: (error: any) => {
        notifications.show({
          title: 'Error',
          message: error.response?.data?.error?.message || 'Failed to update blog settings',
          color: 'red',
        });
      },
    }
  );
}

