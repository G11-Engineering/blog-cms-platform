import { useQuery, useMutation, useQueryClient } from 'react-query';
import { commentApi } from '@/services/commentApi';
import { notifications } from '@mantine/notifications';

export function useComments(params: any = {}) {
  return useQuery(['comments', params], () => commentApi.getComments(params), {
    keepPreviousData: true,
  });
}

export function useComment(id: string) {
  return useQuery(['comment', id], () => commentApi.getComment(id), {
    enabled: !!id,
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation(commentApi.createComment, {
    onSuccess: () => {
      queryClient.invalidateQueries(['comments']);
      notifications.show({
        title: 'Success',
        message: 'Comment added successfully',
        color: 'green',
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.error?.message || 'Failed to add comment',
        color: 'red',
      });
    },
  });
}

export function useUpdateComment() {
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, data }: { id: string; data: any }) => commentApi.updateComment(id, data),
    {
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries(['comments']);
        queryClient.invalidateQueries(['comment', id]);
        notifications.show({
          title: 'Success',
          message: 'Comment updated successfully',
          color: 'green',
        });
      },
      onError: (error: any) => {
        notifications.show({
          title: 'Error',
          message: error.response?.data?.error?.message || 'Failed to update comment',
          color: 'red',
        });
      },
    }
  );
}

export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation(commentApi.deleteComment, {
    onSuccess: () => {
      queryClient.invalidateQueries(['comments']);
      notifications.show({
        title: 'Success',
        message: 'Comment deleted successfully',
        color: 'green',
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.error?.message || 'Failed to delete comment',
        color: 'red',
      });
    },
  });
}

export function useModerateComment() {
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, action, reason }: { id: string; action: string; reason?: string }) =>
      commentApi.moderateComment(id, action, reason),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['comments']);
        notifications.show({
          title: 'Success',
          message: 'Comment moderated successfully',
          color: 'green',
        });
      },
      onError: (error: any) => {
        notifications.show({
          title: 'Error',
          message: error.response?.data?.error?.message || 'Failed to moderate comment',
          color: 'red',
        });
      },
    }
  );
}

export function useLikeComment() {
  const queryClient = useQueryClient();

  return useMutation(commentApi.likeComment, {
    onSuccess: () => {
      queryClient.invalidateQueries(['comments']);
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.error?.message || 'Failed to like comment',
        color: 'red',
      });
    },
  });
}

export function useCommentLikes(id: string) {
  return useQuery(['comment-likes', id], () => commentApi.getCommentLikes(id), {
    enabled: !!id,
  });
}

export function useCommentModeration(id: string) {
  return useQuery(['comment-moderation', id], () => commentApi.getCommentModeration(id), {
    enabled: !!id,
  });
}
