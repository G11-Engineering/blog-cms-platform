import { useQuery, useMutation, useQueryClient } from 'react-query';
import { userApi, User, UsersResponse, UpdateUserData } from '@/services/userApi';
import { notifications } from '@mantine/notifications';

// Fetch users with pagination and filters
export function useUsers(params?: {
  page?: number;
  limit?: number;
  role?: string;
  search?: string;
  status?: string;
}) {
  return useQuery<UsersResponse, Error>(
    ['users', params],
    () => userApi.getUsers(params),
    {
      keepPreviousData: true,
      staleTime: 30000, // 30 seconds
    }
  );
}

// Fetch single user by ID
export function useUser(id: string) {
  return useQuery<{ user: User }, Error>(
    ['user', id],
    () => userApi.getUserById(id),
    {
      enabled: !!id,
    }
  );
}

// Update user mutation
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation<
    { user: User },
    Error,
    { id: string; data: UpdateUserData }
  >(
    ({ id, data }) => userApi.updateUser(id, data),
    {
      onSuccess: () => {
        // Invalidate and refetch users list
        queryClient.invalidateQueries('users');

        notifications.show({
          title: 'Success',
          message: 'User updated successfully',
          color: 'green',
        });
      },
      onError: (error: any) => {
        notifications.show({
          title: 'Error',
          message: error.response?.data?.error?.message || 'Failed to update user',
          color: 'red',
        });
      },
    }
  );
}

// Delete user mutation
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, string>(
    (id) => userApi.deleteUser(id),
    {
      onSuccess: () => {
        // Invalidate and refetch users list
        queryClient.invalidateQueries('users');

        notifications.show({
          title: 'Success',
          message: 'User deleted successfully',
          color: 'green',
        });
      },
      onError: (error: any) => {
        notifications.show({
          title: 'Error',
          message: error.response?.data?.error?.message || 'Failed to delete user',
          color: 'red',
        });
      },
    }
  );
}
