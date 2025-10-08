import { useQuery, useMutation, useQueryClient } from 'react-query';
import { mediaApi } from '@/services/mediaApi';
import { notifications } from '@mantine/notifications';

export function useMediaFiles(params: any = {}) {
  return useQuery(['media', params], () => mediaApi.getMediaFiles(params), {
    keepPreviousData: true,
  });
}

export function useMediaFile(id: string) {
  return useQuery(['media-file', id], () => mediaApi.getMediaFile(id), {
    enabled: !!id,
  });
}

export function useUploadMedia() {
  const queryClient = useQueryClient();

  return useMutation(
    ({ files, altText, caption, isPublic }: {
      files: File[];
      altText?: string;
      caption?: string;
      isPublic?: boolean;
    }) => mediaApi.uploadMediaFiles(files, altText, caption, isPublic),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['media']);
        notifications.show({
          title: 'Success',
          message: 'Files uploaded successfully',
          color: 'green',
        });
      },
      onError: (error: any) => {
        notifications.show({
          title: 'Error',
          message: error.response?.data?.error?.message || 'Failed to upload files',
          color: 'red',
        });
      },
    }
  );
}

export function useUpdateMedia() {
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, data }: { id: string; data: any }) => mediaApi.updateMediaFile(id, data),
    {
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries(['media']);
        queryClient.invalidateQueries(['media-file', id]);
        notifications.show({
          title: 'Success',
          message: 'Media file updated successfully',
          color: 'green',
        });
      },
      onError: (error: any) => {
        notifications.show({
          title: 'Error',
          message: error.response?.data?.error?.message || 'Failed to update media file',
          color: 'red',
        });
      },
    }
  );
}

export function useDeleteMedia() {
  const queryClient = useQueryClient();

  return useMutation(mediaApi.deleteMediaFile, {
    onSuccess: () => {
      queryClient.invalidateQueries(['media']);
      notifications.show({
        title: 'Success',
        message: 'Media file deleted successfully',
        color: 'green',
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.error?.message || 'Failed to delete media file',
        color: 'red',
      });
    },
  });
}

export function useMediaThumbnails(id: string) {
  return useQuery(['media-thumbnails', id], () => mediaApi.getMediaThumbnails(id), {
    enabled: !!id,
  });
}

export function useGenerateThumbnails() {
  const queryClient = useQueryClient();

  return useMutation(mediaApi.generateThumbnails, {
    onSuccess: (_, id) => {
      queryClient.invalidateQueries(['media-thumbnails', id]);
      notifications.show({
        title: 'Success',
        message: 'Thumbnails generated successfully',
        color: 'green',
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.error?.message || 'Failed to generate thumbnails',
        color: 'red',
      });
    },
  });
}
