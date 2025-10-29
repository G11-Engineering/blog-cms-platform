import { useQuery, useMutation, useQueryClient } from 'react-query';
import { tagApi } from '@/services/tagApi';
import { notifications } from '@mantine/notifications';

interface UseTagsParams {
  search?: string;
  sortBy?: string;
  limit?: number;
}

export function useTags(params: UseTagsParams = {}) {
  return useQuery({
    queryKey: ['tags', params],
    queryFn: () => tagApi.getTags(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useTag(id: string) {
  return useQuery({
    queryKey: ['tag', id],
    queryFn: () => tagApi.getTag(id),
    enabled: !!id,
  });
}

export function usePopularTags(limit = 20) {
  return useQuery({
    queryKey: ['tags', 'popular', limit],
    queryFn: () => tagApi.getPopularTags(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();
  
  return useMutation(tagApi.createTag, {
    onSuccess: () => {
      queryClient.invalidateQueries(['tags']);
      notifications.show({
        title: 'Success',
        message: 'Tag created successfully',
        color: 'green',
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.error?.message || 'Failed to create tag',
        color: 'red',
      });
    },
  });
}

export function useUpdateTag() {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ id, data }: { id: string; data: any }) => tagApi.updateTag(id, data),
    {
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries(['tags']);
        queryClient.invalidateQueries(['tag', id]);
        notifications.show({
          title: 'Success',
          message: 'Tag updated successfully',
          color: 'green',
        });
      },
      onError: (error: any) => {
        notifications.show({
          title: 'Error',
          message: error.response?.data?.error?.message || 'Failed to update tag',
          color: 'red',
        });
      },
    }
  );
}

export function useDeleteTag() {
  const queryClient = useQueryClient();
  
  return useMutation(tagApi.deleteTag, {
    onSuccess: () => {
      queryClient.invalidateQueries(['tags']);
      notifications.show({
        title: 'Success',
        message: 'Tag deleted successfully',
        color: 'green',
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.error?.message || 'Failed to delete tag',
        color: 'red',
      });
    },
  });
}