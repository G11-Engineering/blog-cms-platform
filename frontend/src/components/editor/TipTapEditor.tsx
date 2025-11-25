'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import TextStyle from '@tiptap/extension-text-style';
import { Button, Group, Stack, TextInput, FileInput, Modal, Text, Paper, ActionIcon, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useState, useEffect } from 'react';
import { useUploadMedia } from '@/hooks/useMedia';
import { notifications } from '@mantine/notifications';
import { 
  IconBold, 
  IconItalic, 
  IconUnderline, 
  IconStrikethrough, 
  IconH1, 
  IconH2, 
  IconH3, 
  IconH4,
  IconList,
  IconListNumbers,
  IconQuote,
  IconMinus,
  IconAlignLeft,
  IconAlignCenter,
  IconAlignRight,
  IconLink,
  IconUnlink,
  IconPhoto,
  IconClearFormatting
} from '@tabler/icons-react';

interface TipTapEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  editable?: boolean;
}

export function TipTapEditor({ 
  content = '', 
  onChange, 
  placeholder = 'Start writing...',
  editable = true 
}: TipTapEditorProps) {
  const [imageModalOpened, { open: openImageModal, close: closeImageModal }] = useDisclosure(false);
  const [imageUrl, setImageUrl] = useState('');
  const uploadMedia = useUploadMedia();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: 'editor-image',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'editor-link',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      TextStyle,
    ],
    content,
    editable,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  // Update editor content when content prop changes (but not on user edits)
  useEffect(() => {
    if (editor && content !== undefined && content !== null) {
      const currentContent = editor.getHTML();
      // Only update if content is actually different to avoid unnecessary updates
      // Also check if the editor is empty or just has a placeholder paragraph
      const isEmpty = currentContent === '<p></p>' || currentContent.trim() === '';
      if (currentContent !== content && (isEmpty || content.length > currentContent.length)) {
        // Use setTimeout to avoid race conditions with editor initialization
        setTimeout(() => {
          editor.commands.setContent(content, false); // false = don't emit update event
        }, 0);
      }
    }
  }, [content, editor]);

  const handleImageUpload = async (file: File) => {
    try {
      const result = await uploadMedia.mutateAsync({
        files: [file],
        isPublic: true,
      });
      
      if (result.files && result.files.length > 0) {
        // Use file_path if available (for S3), otherwise construct URL
        const uploadedFile = result.files[0];
        const imageUrl = uploadedFile.file_path || 
                        `${process.env.NEXT_PUBLIC_MEDIA_SERVICE_URL || 'http://localhost:3003'}/uploads/${uploadedFile.filename}`;
        editor?.chain().focus().setImage({ src: imageUrl }).run();
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
      notifications.show({
        title: 'Upload Failed',
        message: 'Failed to upload image. Please try again.',
        color: 'red',
      });
    }
  };

  const handleImageUrl = () => {
    if (imageUrl) {
      editor?.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl('');
      closeImageModal();
    }
  };

  if (!editor) {
    return null;
  }

  return (
    <>
      <Paper withBorder radius="md" p="xs">
        {/* Toolbar */}
        <Group gap="xs" mb="md" wrap="wrap">
          {/* Text Formatting */}
          <Group gap="xs">
            <Tooltip label="Bold">
              <ActionIcon
                variant={editor.isActive('bold') ? 'filled' : 'subtle'}
                onClick={() => editor.chain().focus().toggleBold().run()}
              >
                <IconBold size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Italic">
              <ActionIcon
                variant={editor.isActive('italic') ? 'filled' : 'subtle'}
                onClick={() => editor.chain().focus().toggleItalic().run()}
              >
                <IconItalic size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Underline">
              <ActionIcon
                variant={editor.isActive('underline') ? 'filled' : 'subtle'}
                onClick={() => editor.chain().focus().toggleUnderline().run()}
              >
                <IconUnderline size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Strikethrough">
              <ActionIcon
                variant={editor.isActive('strike') ? 'filled' : 'subtle'}
                onClick={() => editor.chain().focus().toggleStrike().run()}
              >
                <IconStrikethrough size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Clear Formatting">
              <ActionIcon
                variant="subtle"
                onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
              >
                <IconClearFormatting size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>

          {/* Headings */}
          <Group gap="xs">
            <Tooltip label="Heading 1">
              <ActionIcon
                variant={editor.isActive('heading', { level: 1 }) ? 'filled' : 'subtle'}
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              >
                <IconH1 size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Heading 2">
              <ActionIcon
                variant={editor.isActive('heading', { level: 2 }) ? 'filled' : 'subtle'}
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              >
                <IconH2 size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Heading 3">
              <ActionIcon
                variant={editor.isActive('heading', { level: 3 }) ? 'filled' : 'subtle'}
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              >
                <IconH3 size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Heading 4">
              <ActionIcon
                variant={editor.isActive('heading', { level: 4 }) ? 'filled' : 'subtle'}
                onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
              >
                <IconH4 size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>

          {/* Lists and Blocks */}
          <Group gap="xs">
            <Tooltip label="Bullet List">
              <ActionIcon
                variant={editor.isActive('bulletList') ? 'filled' : 'subtle'}
                onClick={() => editor.chain().focus().toggleBulletList().run()}
              >
                <IconList size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Numbered List">
              <ActionIcon
                variant={editor.isActive('orderedList') ? 'filled' : 'subtle'}
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
              >
                <IconListNumbers size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Blockquote">
              <ActionIcon
                variant={editor.isActive('blockquote') ? 'filled' : 'subtle'}
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
              >
                <IconQuote size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Horizontal Rule">
              <ActionIcon
                variant="subtle"
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
              >
                <IconMinus size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>

          {/* Alignment */}
          <Group gap="xs">
            <Tooltip label="Align Left">
              <ActionIcon
                variant={editor.isActive({ textAlign: 'left' }) ? 'filled' : 'subtle'}
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
              >
                <IconAlignLeft size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Align Center">
              <ActionIcon
                variant={editor.isActive({ textAlign: 'center' }) ? 'filled' : 'subtle'}
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
              >
                <IconAlignCenter size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Align Right">
              <ActionIcon
                variant={editor.isActive({ textAlign: 'right' }) ? 'filled' : 'subtle'}
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
              >
                <IconAlignRight size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>

          {/* Links and Images */}
          <Group gap="xs">
            <Tooltip label="Add Link">
              <ActionIcon
                variant={editor.isActive('link') ? 'filled' : 'subtle'}
                onClick={() => {
                  const url = window.prompt('Enter URL:');
                  if (url) {
                    editor.chain().focus().setLink({ href: url }).run();
                  }
                }}
              >
                <IconLink size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Remove Link">
              <ActionIcon
                variant="subtle"
                onClick={() => editor.chain().focus().unsetLink().run()}
              >
                <IconUnlink size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Add Image">
              <ActionIcon
                variant="subtle"
                onClick={openImageModal}
              >
                <IconPhoto size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>

        {/* Editor Content */}
        <EditorContent 
          editor={editor} 
          style={{ 
            minHeight: '200px',
            border: '1px solid #e9ecef',
            borderRadius: '4px',
            padding: '12px'
          }}
        />
      </Paper>

      <Modal opened={imageModalOpened} onClose={closeImageModal} title="Add Image">
        <Stack gap="md">
          <TextInput
            label="Image URL"
            placeholder="Enter image URL"
            value={imageUrl}
            onChange={(event) => setImageUrl(event.currentTarget.value)}
          />
          
          <Text size="sm" c="dimmed">Or upload an image:</Text>
          
          <FileInput
            label="Upload Image"
            placeholder="Choose image file"
            accept="image/*"
            onChange={(file) => {
              if (file) {
                handleImageUpload(file);
                closeImageModal();
              }
            }}
          />
          
          <Group justify="flex-end">
            <Button variant="outline" onClick={closeImageModal}>
              Cancel
            </Button>
            <Button onClick={handleImageUrl} disabled={!imageUrl}>
              Add Image
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
