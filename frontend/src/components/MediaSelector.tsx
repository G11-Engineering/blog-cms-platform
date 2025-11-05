'use client';

import { useState } from 'react';
import { Modal, Button, Grid, Image, Text, Group, TextInput, FileButton, Stack, Loader, Center, Badge, ActionIcon, Alert } from '@mantine/core';
import { useMediaFiles, useUploadMedia } from '@/hooks/useMedia';
import { IconUpload, IconX, IconPhoto, IconCheck } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

interface MediaSelectorProps {
  opened: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  title?: string;
}

export function MediaSelector({ opened, onClose, onSelect, title = 'Select Media' }: MediaSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const { data: mediaData, isLoading } = useMediaFiles({ 
    limit: 50,
    search: searchTerm || undefined,
  });
  const uploadMedia = useUploadMedia();

  const handleSelect = () => {
    if (selectedUrl) {
      onSelect(selectedUrl);
      setSelectedUrl(null);
      onClose();
    }
  };

  const handleFileUpload = async (file: File | null) => {
    if (!file) return;

    try {
      const result = await uploadMedia.mutateAsync({
        files: [file],
        isPublic: true,
      });

      if (result.files && result.files.length > 0) {
        const fileUrl = result.files[0].file_path || 
                       `${process.env.NEXT_PUBLIC_MEDIA_SERVICE_URL || 'http://localhost:3003'}/uploads/${result.files[0].filename}`;
        onSelect(fileUrl);
        setSelectedUrl(null);
        onClose();
        notifications.show({
          title: 'Success',
          message: 'Image uploaded and selected',
          color: 'green',
        });
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const mediaFiles = mediaData?.files || [];
  const imageFiles = mediaFiles.filter((file: any) => file.file_type === 'image');

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={title}
      size="xl"
    >
      <Stack gap="md">
        {/* Upload Section */}
        <Group>
          <FileButton
            onChange={handleFileUpload}
            accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
          >
            {(props) => (
              <Button
                {...props}
                leftSection={<IconUpload size={16} />}
                loading={uploadMedia.isLoading}
                variant="light"
              >
                Upload New Image
              </Button>
            )}
          </FileButton>
          <TextInput
            placeholder="Search images..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.currentTarget.value)}
            style={{ flex: 1 }}
          />
        </Group>

        {/* Image Grid */}
        {isLoading ? (
          <Center p="xl">
            <Loader size="lg" />
          </Center>
        ) : imageFiles.length === 0 ? (
          <Alert color="blue" title="No Images">
            No images found. Upload an image to get started.
          </Alert>
        ) : (
          <>
            <Grid>
              {imageFiles.map((file: any) => {
                const imageUrl = file.file_path || 
                               `${process.env.NEXT_PUBLIC_MEDIA_SERVICE_URL || 'http://localhost:3003'}/uploads/${file.filename}`;
                const isSelected = selectedUrl === imageUrl;

                return (
                  <Grid.Col key={file.id} span={4}>
                    <div
                      style={{
                        position: 'relative',
                        cursor: 'pointer',
                        border: isSelected ? '3px solid #ff8c00' : '2px solid #e0e0e0',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        transition: 'all 0.2s',
                      }}
                      onClick={() => setSelectedUrl(imageUrl)}
                    >
                      <Image
                        src={imageUrl}
                        alt={file.alt_text || file.original_filename}
                        height={150}
                        fit="cover"
                      />
                      {isSelected && (
                        <div
                          style={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            background: '#ff8c00',
                            borderRadius: '50%',
                            width: 32,
                            height: 32,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <IconCheck size={18} color="white" />
                        </div>
                      )}
                      <div
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                          padding: '8px',
                        }}
                      >
                        <Text size="xs" c="white" truncate>
                          {file.original_filename}
                        </Text>
                      </div>
                    </div>
                  </Grid.Col>
                );
              })}
            </Grid>

            <Group justify="flex-end">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleSelect}
                disabled={!selectedUrl}
                leftSection={<IconCheck size={16} />}
                color="wso2-orange"
              >
                Select Image
              </Button>
            </Group>
          </>
        )}
      </Stack>
    </Modal>
  );
}

