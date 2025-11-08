'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Stack,
  Title,
  Text,
  Button,
  Group,
  Card,
  TextInput,
  Select,
  Table,
  Avatar,
  Badge,
  ActionIcon,
  Center,
  ThemeIcon,
  Pagination,
  Modal,
  Switch,
  Loader,
} from '@mantine/core';
import {
  IconUsers,
  IconSearch,
  IconEdit,
  IconTrash,
  IconShield,
  IconFilter,
} from '@tabler/icons-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUsers, useUpdateUser, useDeleteUser } from '@/hooks/useUsers';
import { User } from '@/services/userApi';
import { notifications } from '@mantine/notifications';

export default function AdminUsersPage() {
  const { user: currentUser, isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();

  // State
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('');

  const itemsPerPage = 10;

  // Fetch users
  const { data, isLoading } = useUsers({
    page: currentPage,
    limit: itemsPerPage,
    role: roleFilter || undefined,
    search: searchTerm || undefined,
  });

  // Mutations
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  // Access control
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    } else if (!isAdmin) {
      notifications.show({
        title: 'Access Denied',
        message: 'You do not have permission to access this page',
        color: 'red',
      });
      router.push('/');
    }
  }, [isAuthenticated, isAdmin, router]);

  // Show loading while checking auth
  if (!isAuthenticated || !isAdmin) {
    return (
      <Center h="100vh">
        <Loader size="xl" color="wso2-orange" />
      </Center>
    );
  }

  const users = data?.users || [];
  const totalPages = data?.pagination.pages || 1;

  // Helper functions
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'red';
      case 'editor':
        return 'blue';
      case 'author':
        return 'orange';
      case 'reader':
        return 'green';
      default:
        return 'gray';
    }
  };

  const getAvatarColor = (index: number) => {
    const colors = ['wso2-orange', 'wso2-blue', 'wso2-green', 'wso2-purple'];
    return colors[index % colors.length];
  };

  // Modal handlers
  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setSelectedRole(user.role);
    setEditModalOpened(true);
  };

  const closeEditModal = () => {
    setEditModalOpened(false);
    setSelectedUser(null);
    setSelectedRole('');
  };

  const openDeleteModal = (user: User) => {
    setSelectedUser(user);
    setDeleteModalOpened(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpened(false);
    setSelectedUser(null);
  };

  // Action handlers
  const handleUpdateRole = async () => {
    if (!selectedUser) return;

    await updateUserMutation.mutateAsync({
      id: selectedUser.id,
      data: {
        firstName: selectedUser.first_name,
        lastName: selectedUser.last_name,
        role: selectedRole,
        isActive: selectedUser.is_active,
      },
    });

    closeEditModal();
  };

  const handleToggleStatus = async (user: User) => {
    if (user.id === currentUser?.id) {
      notifications.show({
        title: 'Warning',
        message: 'You cannot deactivate your own account',
        color: 'yellow',
      });
      return;
    }

    await updateUserMutation.mutateAsync({
      id: user.id,
      data: {
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        isActive: !user.is_active,
      },
    });
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    if (selectedUser.id === currentUser?.id) {
      notifications.show({
        title: 'Warning',
        message: 'You cannot delete your own account',
        color: 'yellow',
      });
      return;
    }

    await deleteUserMutation.mutateAsync(selectedUser.id);
    closeDeleteModal();
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <Stack align="center" gap="md" py="xl">
          <Center>
            <ThemeIcon
              size={80}
              radius="xl"
              variant="filled"
              style={{
                background: 'linear-gradient(135deg, #ff8c00 0%, #e67e00 100%)',
                color: 'white',
                boxShadow: '0 8px 32px rgba(255, 115, 0, 0.3)',
              }}
            >
              <IconUsers size={40} />
            </ThemeIcon>
          </Center>
          <Title order={1} size="3rem" ta="center" c="wso2-black.9">
            User Management
          </Title>
          <Text size="lg" ta="center" c="wso2-black.6" maw={600}>
            Manage users, assign roles, and control access permissions
          </Text>
        </Stack>

        {/* Search and Filter */}
        <Card withBorder shadow="sm" p="lg" radius="lg">
          <Stack gap="md">
            <Group justify="space-between" align="center">
              <Title order={3} c="wso2-black.9">
                <Group gap="xs">
                  <IconFilter size={24} />
                  Filter Users
                </Group>
              </Title>
              <Badge size="lg" variant="light" color="wso2-orange">
                {data?.pagination.total || 0} users
              </Badge>
            </Group>

            <Group grow>
              <TextInput
                placeholder="Search by name or email..."
                leftSection={<IconSearch size={16} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="md"
              />

              <Select
                placeholder="Filter by Role"
                data={[
                  { value: '', label: 'All Roles' },
                  { value: 'admin', label: 'Admin' },
                  { value: 'editor', label: 'Editor' },
                  { value: 'author', label: 'Author' },
                  { value: 'reader', label: 'Reader' },
                ]}
                value={roleFilter}
                onChange={(value) => setRoleFilter(value || '')}
                size="md"
                leftSection={<IconShield size={16} />}
                clearable
              />

              <Select
                placeholder="Filter by Status"
                data={[
                  { value: '', label: 'All Status' },
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                ]}
                value={statusFilter}
                onChange={(value) => setStatusFilter(value || '')}
                size="md"
                clearable
              />
            </Group>
          </Stack>
        </Card>

        {/* Users Table */}
        <Card withBorder shadow="sm" p="lg" radius="lg">
          {isLoading ? (
            <Center h={400}>
              <Loader size="lg" color="wso2-orange" />
            </Center>
          ) : users.length === 0 ? (
            <Center h={400}>
              <Stack align="center" gap="md">
                <IconUsers size={64} color="gray" />
                <Text size="lg" c="dimmed">
                  No users found
                </Text>
                <Text size="sm" c="dimmed">
                  Try adjusting your search or filters
                </Text>
              </Stack>
            </Center>
          ) : (
            <Table.ScrollContainer minWidth={800}>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>User</Table.Th>
                    <Table.Th>Email</Table.Th>
                    <Table.Th>Role</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {users.map((user, index) => (
                    <Table.Tr key={user.id}>
                      <Table.Td>
                        <Group gap="sm">
                          <Avatar
                            color={getAvatarColor(index)}
                            radius="xl"
                            size="md"
                          >
                            {getInitials(user.first_name, user.last_name)}
                          </Avatar>
                          <div>
                            <Text fw={500} size="sm">
                              {user.first_name} {user.last_name}
                            </Text>
                            {user.id === currentUser?.id && (
                              <Badge size="xs" color="blue" variant="light">
                                You
                              </Badge>
                            )}
                          </div>
                        </Group>
                      </Table.Td>

                      <Table.Td>
                        <Text size="sm" c="dimmed">
                          {user.email}
                        </Text>
                      </Table.Td>

                      <Table.Td>
                        <Badge
                          color={getRoleColor(user.role)}
                          variant="light"
                          size="md"
                        >
                          {user.role.toUpperCase()}
                        </Badge>
                      </Table.Td>

                      <Table.Td>
                        <Switch
                          checked={user.is_active}
                          onChange={() => handleToggleStatus(user)}
                          color="green"
                          disabled={user.id === currentUser?.id}
                          onLabel="Active"
                          offLabel="Inactive"
                        />
                      </Table.Td>

                      <Table.Td>
                        <Group gap="xs">
                          <ActionIcon
                            variant="light"
                            color="blue"
                            onClick={() => openEditModal(user)}
                            size="lg"
                          >
                            <IconEdit size={18} />
                          </ActionIcon>

                          <ActionIcon
                            variant="light"
                            color="red"
                            onClick={() => openDeleteModal(user)}
                            disabled={user.id === currentUser?.id}
                            size="lg"
                          >
                            <IconTrash size={18} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Center mt="xl">
              <Pagination
                total={totalPages}
                value={currentPage}
                onChange={setCurrentPage}
                color="wso2-orange"
                size="md"
              />
            </Center>
          )}
        </Card>
      </Stack>

      {/* Edit Role Modal */}
      <Modal
        opened={editModalOpened}
        onClose={closeEditModal}
        title={
          <Title order={3}>
            <Group gap="xs">
              <IconEdit size={24} />
              Edit User Role
            </Group>
          </Title>
        }
        size="md"
        centered
      >
        <Stack gap="lg">
          <Text size="sm" c="dimmed">
            Changing role for:{' '}
            <Text component="span" fw={600} c="dark">
              {selectedUser?.email}
            </Text>
          </Text>

          <Select
            label="User Role"
            description="Select the role for this user"
            data={[
              {
                value: 'reader',
                label: 'Reader - View and comment only',
              },
              {
                value: 'author',
                label: 'Author - Create and manage own posts',
              },
              { value: 'editor', label: 'Editor - Manage all content' },
              { value: 'admin', label: 'Admin - Full system access' },
            ]}
            value={selectedRole}
            onChange={(value) => setSelectedRole(value || 'reader')}
            size="md"
            required
          />

          <Group justify="flex-end" gap="md">
            <Button variant="subtle" onClick={closeEditModal}>
              Cancel
            </Button>
            <Button
              style={{
                background: 'linear-gradient(135deg, #ff8c00 0%, #e67e00 100%)',
              }}
              onClick={handleUpdateRole}
              loading={updateUserMutation.isLoading}
            >
              Save Changes
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        title={
          <Title order={3} c="red">
            <Group gap="xs">
              <IconTrash size={24} />
              Delete User
            </Group>
          </Title>
        }
        size="md"
        centered
      >
        <Stack gap="lg">
          <Text>
            Are you sure you want to delete user:{' '}
            <Text component="span" fw={600} c="red">
              {selectedUser?.email}
            </Text>
            ?
          </Text>

          <Card withBorder bg="red.0" p="md">
            <Text size="sm" c="red" fw={500}>
              ⚠️ Warning: This action cannot be undone
            </Text>
            <Text size="xs" c="dimmed" mt="xs">
              All user data will be permanently deleted from the system.
            </Text>
          </Card>

          <Group justify="flex-end" gap="md">
            <Button variant="subtle" onClick={closeDeleteModal}>
              Cancel
            </Button>
            <Button
              color="red"
              onClick={handleDeleteUser}
              loading={deleteUserMutation.isLoading}
            >
              Delete User
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
