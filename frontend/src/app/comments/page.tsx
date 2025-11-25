'use client';

import { Container, Stack, Title, Text, Card, Table, Button, Group, Badge, TextInput, Select, Modal, ActionIcon, Alert, Pagination, Loader, Center, Textarea } from '@mantine/core';
import { IconMessageCircle, IconEdit, IconTrash, IconCheck, IconX, IconSearch, IconFilter } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { commentApi } from '@/services/commentApi';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
  id: string;
  post_id: string;
  author_name: string | null;
  author_email: string | null;
  content: string;
  status: 'pending' | 'approved' | 'rejected' | 'spam';
  like_count: number;
  created_at: string;
  updated_at: string;
}

export default function CommentsPage() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('approved');
  const [currentPage, setCurrentPage] = useState(1);
  const [editModalOpened, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const itemsPerPage = 20;

  // Fetch comments
  const { data: commentsData, isLoading } = useQuery({
    queryKey: ['comments', currentPage, searchTerm, selectedStatus],
    queryFn: async () => {
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
        status: selectedStatus,
      };
      
      if (searchTerm) {
        // Note: Comment service might not support search, but we'll try
        params.search = searchTerm;
      }

      return commentApi.getComments(params);
    },
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000,
  });

  // Update comment mutation
  const updateComment = useMutation({
    mutationFn: async ({ commentId, data }: { commentId: string; data: any }) => {
      return commentApi.updateComment(commentId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      closeEditModal();
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
  });

  // Delete comment mutation
  const deleteComment = useMutation({
    mutationFn: async (commentId: string) => {
      return commentApi.deleteComment(commentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
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

  // Moderate comment mutation
  const moderateComment = useMutation({
    mutationFn: async ({ commentId, action, reason }: { commentId: string; action: string; reason?: string }) => {
      return commentApi.moderateComment(commentId, action, reason);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      notifications.show({
        title: 'Success',
        message: `Comment ${variables.action}ed successfully`,
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
  });

  const editForm = useForm({
    initialValues: {
      content: '',
    },
    validate: {
      content: (value) => (!value || value.trim().length === 0 ? 'Content is required' : null),
    },
  });

  const handleEdit = (comment: Comment) => {
    setSelectedComment(comment);
    editForm.setValues({
      content: comment.content,
    });
    openEditModal();
  };

  const handleEditSubmit = (values: typeof editForm.values) => {
    if (!selectedComment) return;
    updateComment.mutate({
      commentId: selectedComment.id,
      data: { content: values.content },
    });
  };

  const handleDelete = (commentId: string) => {
    if (confirm('Are you sure you want to delete this comment? This action cannot be undone.')) {
      deleteComment.mutate(commentId);
    }
  };

  const handleModerate = (commentId: string, action: 'approve' | 'reject' | 'spam') => {
    moderateComment.mutate({ commentId, action });
  };

  if (!isAuthenticated) {
    return (
      <Container size="md" py="xl">
        <Alert color="yellow" title="Authentication Required">
          Please log in to manage comments.
        </Alert>
      </Container>
    );
  }

  const comments = commentsData?.comments || [];
  const totalPages = Math.ceil((commentsData?.pagination?.total || 0) / itemsPerPage);

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <Stack align="center" gap="md" py="xl">
          <Title order={1} size="3rem" ta="center" c="wso2-black.9">
            Comments Management
          </Title>
          <Text size="lg" ta="center" c="wso2-black.6" maw={600}>
            Manage and moderate comments across all posts.
          </Text>
        </Stack>

        {/* Filters */}
        <Card withBorder shadow="sm" p="lg" radius="md">
          <Group gap="md">
            <TextInput
              placeholder="Search comments..."
              leftSection={<IconSearch size={16} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.currentTarget.value)}
              style={{ flex: 1 }}
            />
            <Select
              placeholder="Filter by status"
              data={[
                { value: 'approved', label: 'Approved' },
                { value: 'pending', label: 'Pending' },
                { value: 'rejected', label: 'Rejected' },
                { value: 'spam', label: 'Spam' },
              ]}
              value={selectedStatus}
              onChange={(value) => setSelectedStatus(value || 'approved')}
              leftSection={<IconFilter size={16} />}
            />
          </Group>
        </Card>

        {/* Comments Table */}
        <Card withBorder shadow="sm" p="lg" radius="md">
          {isLoading ? (
            <Center p="xl">
              <Loader size="lg" />
            </Center>
          ) : comments.length === 0 ? (
            <Center p="xl">
              <Text c="dimmed">No comments found</Text>
            </Center>
          ) : (
            <>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Author</Table.Th>
                    <Table.Th>Content</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Likes</Table.Th>
                    <Table.Th>Created</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {comments.map((comment: Comment) => (
                    <Table.Tr key={comment.id}>
                      <Table.Td>
                        <Text size="sm" fw={500}>
                          {comment.author_name || 'Anonymous'}
                        </Text>
                        {comment.author_email && (
                          <Text size="xs" c="dimmed">
                            {comment.author_email}
                          </Text>
                        )}
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" lineClamp={2}>
                          {comment.content}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          color={
                            comment.status === 'approved'
                              ? 'green'
                              : comment.status === 'pending'
                              ? 'yellow'
                              : comment.status === 'rejected'
                              ? 'red'
                              : 'gray'
                          }
                        >
                          {comment.status}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <IconMessageCircle size={16} />
                          <Text size="sm">{comment.like_count || 0}</Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" c="dimmed">
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <ActionIcon
                            variant="subtle"
                            color="blue"
                            onClick={() => handleEdit(comment)}
                          >
                            <IconEdit size={16} />
                          </ActionIcon>
                          {['admin', 'editor'].includes(user?.role || '') && (
                            <>
                              {comment.status !== 'approved' && (
                                <ActionIcon
                                  variant="subtle"
                                  color="green"
                                  onClick={() => handleModerate(comment.id, 'approve')}
                                  loading={moderateComment.isLoading}
                                >
                                  <IconCheck size={16} />
                                </ActionIcon>
                              )}
                              {comment.status !== 'rejected' && (
                                <ActionIcon
                                  variant="subtle"
                                  color="red"
                                  onClick={() => handleModerate(comment.id, 'reject')}
                                  loading={moderateComment.isLoading}
                                >
                                  <IconX size={16} />
                                </ActionIcon>
                              )}
                            </>
                          )}
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            onClick={() => handleDelete(comment.id)}
                            loading={deleteComment.isLoading}
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
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

      {/* Edit Comment Modal */}
      <Modal
        opened={editModalOpened}
        onClose={closeEditModal}
        title="Edit Comment"
        size="md"
      >
        <form onSubmit={editForm.onSubmit(handleEditSubmit)}>
          <Stack gap="md">
            <Textarea
              label="Comment"
              required
              rows={6}
              {...editForm.getInputProps('content')}
            />
            <Group justify="flex-end" mt="md">
              <Button variant="outline" onClick={closeEditModal}>
                Cancel
              </Button>
              <Button type="submit" loading={updateComment.isLoading} color="wso2-orange">
                Save Changes
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
}

