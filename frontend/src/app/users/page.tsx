'use client';

import { Container, Stack, Title, Text, Card, Table, Button, Group, Badge, TextInput, Select, Modal, Textarea, ActionIcon, Alert, Pagination, Loader, Center } from '@mantine/core';
import { IconUser, IconEdit, IconTrash, IconShield, IconSearch, IconUserPlus } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import { useState } from 'react';

interface User {
  id: string;
  email: string;
  username: string;
  first_name: string | null;
  last_name: string | null;
  role: 'reader' | 'author' | 'editor' | 'admin';
  is_active: boolean;
  created_at: string;
}

export default function UsersPage() {
  const { user: currentUser, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editModalOpened, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const itemsPerPage = 10;

  // Fetch users
  const { data: usersData, isLoading } = useQuery({
    queryKey: ['users', currentPage, searchTerm, selectedRole],
    queryFn: async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', itemsPerPage.toString());
      if (searchTerm) params.append('search', searchTerm);
      if (selectedRole) params.append('role', selectedRole);

      const response = await axios.get(`http://localhost:3001/api/users?${params.toString()}`, { headers });
      return response.data;
    },
    enabled: isAuthenticated && currentUser?.role === 'admin',
    staleTime: 5 * 60 * 1000,
  });

  // Update user mutation
  const updateUser = useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: any }) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await axios.put(`http://localhost:3001/api/users/${userId}`, data, { headers });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      closeEditModal();
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
  });

  // Delete user mutation
  const deleteUser = useMutation({
    mutationFn: async (userId: string) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: HeadersInit = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await axios.delete(`http://localhost:3001/api/users/${userId}`, { headers });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
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
  });

  const editForm = useForm({
    initialValues: {
      firstName: '',
      lastName: '',
      role: 'reader' as 'reader' | 'author' | 'editor' | 'admin',
      isActive: true,
    },
    validate: {
      firstName: (value) => (!value ? 'First name is required' : null),
      lastName: (value) => (!value ? 'Last name is required' : null),
    },
  });

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    editForm.setValues({
      firstName: user.first_name || '',
      lastName: user.last_name || '',
      role: user.role,
      isActive: user.is_active,
    });
    openEditModal();
  };

  const handleEditSubmit = (values: typeof editForm.values) => {
    if (!selectedUser) return;
    updateUser.mutate({
      userId: selectedUser.id,
      data: values,
    });
  };

  const handleDelete = (userId: string) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      deleteUser.mutate(userId);
    }
  };

  if (!isAuthenticated || currentUser?.role !== 'admin') {
    return (
      <Container size="md" py="xl">
        <Alert color="red" title="Access Denied">
          You must be an administrator to access this page.
        </Alert>
      </Container>
    );
  }

  const users = usersData?.users || [];
  const totalPages = Math.ceil((usersData?.pagination?.total || 0) / itemsPerPage);

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <Stack align="center" gap="md" py="xl">
          <Title order={1} size="3rem" ta="center" c="wso2-black.9">
            User Management
          </Title>
          <Text size="lg" ta="center" c="wso2-black.6" maw={600}>
            Manage users, assign roles, and control access to the platform.
          </Text>
        </Stack>

        {/* Filters */}
        <Card withBorder shadow="sm" p="lg" radius="md">
          <Group gap="md">
            <TextInput
              placeholder="Search users..."
              leftSection={<IconSearch size={16} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.currentTarget.value)}
              style={{ flex: 1 }}
            />
            <Select
              placeholder="Filter by role"
              data={[
                { value: '', label: 'All Roles' },
                { value: 'reader', label: 'Reader' },
                { value: 'author', label: 'Author' },
                { value: 'editor', label: 'Editor' },
                { value: 'admin', label: 'Admin' },
              ]}
              value={selectedRole}
              onChange={(value) => setSelectedRole(value || '')}
              clearable
            />
          </Group>
        </Card>

        {/* Users Table */}
        <Card withBorder shadow="sm" p="lg" radius="md">
          {isLoading ? (
            <Center p="xl">
              <Loader size="lg" />
            </Center>
          ) : users.length === 0 ? (
            <Center p="xl">
              <Text c="dimmed">No users found</Text>
            </Center>
          ) : (
            <>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>User</Table.Th>
                    <Table.Th>Email</Table.Th>
                    <Table.Th>Role</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Created</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {users.map((user: User) => (
                    <Table.Tr key={user.id}>
                      <Table.Td>
                        <Group gap="xs">
                          <IconUser size={20} />
                          <Text fw={500}>
                            {user.first_name || user.last_name
                              ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                              : user.username}
                          </Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>{user.email}</Table.Td>
                      <Table.Td>
                        <Badge
                          color={
                            user.role === 'admin'
                              ? 'red'
                              : user.role === 'editor'
                              ? 'orange'
                              : user.role === 'author'
                              ? 'blue'
                              : 'gray'
                          }
                        >
                          {user.role}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Badge color={user.is_active ? 'green' : 'red'}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" c="dimmed">
                          {new Date(user.created_at).toLocaleDateString()}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <ActionIcon
                            variant="subtle"
                            color="blue"
                            onClick={() => handleEdit(user)}
                          >
                            <IconEdit size={16} />
                          </ActionIcon>
                          {user.id !== currentUser?.id && (
                            <ActionIcon
                              variant="subtle"
                              color="red"
                              onClick={() => handleDelete(user.id)}
                              loading={deleteUser.isLoading}
                            >
                              <IconTrash size={16} />
                            </ActionIcon>
                          )}
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>

              {totalPages > 1 && (
                <Group justify="center" mt="xl">
                  <Pagination
                    value={currentPage}
                    onChange={setCurrentPage}
                    total={totalPages}
                  />
                </Group>
              )}
            </>
          )}
        </Card>
      </Stack>

      {/* Edit User Modal */}
      <Modal
        opened={editModalOpened}
        onClose={closeEditModal}
        title="Edit User"
        size="md"
      >
        <form onSubmit={editForm.onSubmit(handleEditSubmit)}>
          <Stack gap="md">
            <TextInput
              label="First Name"
              required
              {...editForm.getInputProps('firstName')}
            />
            <TextInput
              label="Last Name"
              required
              {...editForm.getInputProps('lastName')}
            />
            <Select
              label="Role"
              required
              data={[
                { value: 'reader', label: 'Reader' },
                { value: 'author', label: 'Author' },
                { value: 'editor', label: 'Editor' },
                { value: 'admin', label: 'Admin' },
              ]}
              {...editForm.getInputProps('role')}
            />
            <Select
              label="Status"
              required
              data={[
                { value: 'true', label: 'Active' },
                { value: 'false', label: 'Inactive' },
              ]}
              value={editForm.values.isActive.toString()}
              onChange={(value) => editForm.setFieldValue('isActive', value === 'true')}
            />
            <Group justify="flex-end" mt="md">
              <Button variant="outline" onClick={closeEditModal}>
                Cancel
              </Button>
              <Button type="submit" loading={updateUser.isLoading} color="wso2-orange">
                Save Changes
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
}

