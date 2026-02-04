'use client';

import { useEffect, useState, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import CharacterCount from '@tiptap/extension-character-count';
import Placeholder from '@tiptap/extension-placeholder';
import UnderlineExtension from '@tiptap/extension-underline';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Undo,
  Redo,
  Image as ImageIcon,
  Table as TableIcon,
  Quote,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Minus,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { uploadImage } from '@/lib/api';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder = 'Enter description...' }: RichTextEditorProps) {
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        underline: false, // Disable underline in StarterKit since we're adding it separately
      }),
      Image.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            width: {
              default: null,
              renderHTML: attributes => {
                if (!attributes.width) {
                  return {};
                }
                return {
                  width: attributes.width,
                };
              },
              parseHTML: element => {
                return element.getAttribute('width');
              },
            },
            height: {
              default: null,
              renderHTML: attributes => {
                if (!attributes.height) {
                  return {};
                }
                return {
                  height: attributes.height,
                };
              },
              parseHTML: element => {
                return element.getAttribute('height');
              },
            },
            style: {
              default: null,
              renderHTML: attributes => {
                if (!attributes.width && !attributes.height) {
                  return {};
                }
                return {
                  style: `max-width: 100%; width: ${attributes.width || 'auto'}; height: ${attributes.height || 'auto'};`,
                };
              },
            },
          };
        },
      }).configure({
        inline: true,
        allowBase64: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
      UnderlineExtension,
      CharacterCount,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] px-4 py-3',
        'data-placeholder': placeholder,
      },
    },
  });

  // Make images resizable
  const makeImageResizable = (img: HTMLImageElement, editorInstance: any) => {
    // Remove existing handles
    const existingHandle = img.parentElement?.querySelector('.resize-handle');
    if (existingHandle) {
      existingHandle.remove();
    }

    // Create resize handle
    const handle = document.createElement('div');
    handle.className = 'resize-handle';
    handle.style.cssText = `
      position: absolute;
      width: 12px;
      height: 12px;
      background: #8B5CF6;
      border: 2px solid white;
      border-radius: 50%;
      cursor: nwse-resize;
      z-index: 1000;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      display: none;
    `;

    // Wrap image in container if not already wrapped
    let container = img.parentElement;
    if (!container || !container.classList.contains('image-container')) {
      container = document.createElement('span');
      container.className = 'image-container';
      container.style.cssText = 'position: relative; display: inline-block;';
      img.parentNode?.insertBefore(container, img);
      container.appendChild(img);
    }

    container.style.position = 'relative';
    container.style.display = 'inline-block';
    container.appendChild(handle);

    // Show handle on hover/select
    const showHandle = () => {
      const rect = img.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      handle.style.display = 'block';
      handle.style.bottom = '-6px';
      handle.style.right = '-6px';
    };

    const hideHandle = () => {
      // Only hide if image is not selected
      const isSelected = img.classList.contains('ProseMirror-selectednode') || 
                        container.classList.contains('ProseMirror-selectednode') ||
                        editorInstance.state.selection.$anchor.parent.type.name === 'image';
      if (!isSelected) {
        handle.style.display = 'none';
      }
    };

    // Show handle when image is clicked/selected
    const checkSelection = () => {
      const isSelected = img.classList.contains('ProseMirror-selectednode') || 
                        container.classList.contains('ProseMirror-selectednode');
      if (isSelected) {
        showHandle();
      }
    };

    img.addEventListener('mouseenter', showHandle);
    img.addEventListener('mouseleave', hideHandle);
    img.addEventListener('click', () => {
      // Select the image node when clicked
      editorInstance.state.doc.descendants((node: any, pos: number) => {
        if (node.type.name === 'image' && node.attrs.src === img.getAttribute('src')) {
          editorInstance.commands.setTextSelection(pos);
          editorInstance.commands.setNodeSelection(pos);
          showHandle();
          return false;
        }
      });
    });
    container.addEventListener('mouseenter', showHandle);
    container.addEventListener('mouseleave', hideHandle);
    
    // Check selection on editor updates
    const selectionObserver = () => {
      setTimeout(checkSelection, 50);
    };
    editorInstance.on('selectionUpdate', selectionObserver);
    editorInstance.on('update', selectionObserver);

    // Resize functionality
    let isResizing = false;
    let startX = 0;
    let startY = 0;
    let startWidth = 0;
    let startHeight = 0;

    const startResize = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      isResizing = true;
      startX = e.clientX;
      startY = e.clientY;
      startWidth = img.offsetWidth;
      startHeight = img.offsetHeight;
      document.addEventListener('mousemove', doResize);
      document.addEventListener('mouseup', stopResize);
    };

    const doResize = (e: MouseEvent) => {
      if (!isResizing) return;
      e.preventDefault();
      e.stopPropagation();
      
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      // Maintain aspect ratio by default (hold Shift to resize independently)
      const maintainAspect = !e.shiftKey;
      let newWidth = Math.max(50, startWidth + deltaX);
      let newHeight = maintainAspect 
        ? Math.max(50, (startHeight / startWidth) * newWidth)
        : Math.max(50, startHeight + deltaY);

      // Update image style directly for real-time feedback
      img.style.width = `${newWidth}px`;
      img.style.height = `${newHeight}px`;
      img.style.maxWidth = 'none';
      img.style.objectFit = 'contain';

      // Find and update the image node in the editor
      editorInstance.state.doc.descendants((node: any, pos: number) => {
        if (node.type.name === 'image' && node.attrs.src === img.getAttribute('src')) {
          editorInstance.commands.updateAttributes('image', {
            width: `${newWidth}px`,
            height: `${newHeight}px`,
          });
          return false;
        }
      });
    };

    const stopResize = () => {
      isResizing = false;
      document.removeEventListener('mousemove', doResize);
      document.removeEventListener('mouseup', stopResize);
    };

    handle.addEventListener('mousedown', startResize);
  };

  // Update editor content when value prop changes (for editing existing products)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      const currentContent = editor.getHTML();
      if (currentContent !== value) {
        editor.commands.setContent(value || '', false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Initialize resize on images after editor is ready
  useEffect(() => {
    if (!editor) return;

    const updateImages = () => {
      setTimeout(() => {
        const images = document.querySelectorAll('.ProseMirror img');
        images.forEach((img) => {
          if (!(img as HTMLElement).dataset.resizeListener) {
            (img as HTMLElement).dataset.resizeListener = 'true';
            makeImageResizable(img as HTMLImageElement, editor);
          }
        });
      }, 100);
    };

    // Also check on content changes and focus
    const checkSelection = () => {
      setTimeout(() => {
        const selectedImages = document.querySelectorAll('.ProseMirror img.ProseMirror-selectednode');
        selectedImages.forEach((img) => {
          const handle = (img.parentElement as HTMLElement)?.querySelector('.resize-handle') as HTMLElement;
          if (handle) {
            handle.style.display = 'block';
          }
        });
      }, 50);
    };

    editor.on('update', updateImages);
    editor.on('selectionUpdate', () => {
      updateImages();
      checkSelection();
    });
    editor.on('focus', updateImages);
    updateImages();

    // Use MutationObserver to catch dynamically added images
    const observer = new MutationObserver(() => {
      updateImages();
    });

    const editorElement = editor.view.dom;
    if (editorElement) {
      observer.observe(editorElement, {
        childList: true,
        subtree: true,
      });
    }

    return () => {
      editor.off('update', updateImages);
      editor.off('selectionUpdate', checkSelection);
      editor.off('focus', updateImages);
      observer.disconnect();
    };
  }, [editor]);

  // Handle editor focus when dialog is open
  useEffect(() => {
    if (!editor) return;

    if (showImageDialog) {
      // Blur the editor when dialog opens to prevent focus issues
      editor.commands.blur();
      // Remove focus from the editor element to prevent accessibility warnings
      const editorElement = editor.view.dom;
      if (editorElement && document.activeElement === editorElement) {
        (editorElement as HTMLElement).blur();
      }
    }
  }, [showImageDialog, editor]);

  if (!editor) {
    return null;
  }

  const addImage = () => {
    setShowImageDialog(true);
    setImageUrl('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const url = await uploadImage(file);
      setImageUrl(url);
      insertImage(url);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const insertImage = (url: string) => {
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
      setShowImageDialog(false);
      setImageUrl('');
    }
  };

  const handleImageUrlSubmit = () => {
    if (imageUrl.trim()) {
      insertImage(imageUrl.trim());
    }
  };

  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  return (
    <div className="border border-gray-300 rounded-md overflow-hidden">
      {/* Toolbar */}
      <div className="border-b border-gray-300 bg-gray-50 p-2 flex flex-wrap items-center gap-1">
        {/* Text Style */}
        <select
          value={editor.getAttributes('heading').level || 'paragraph'}
          onChange={(e) => {
            const level = e.target.value;
            if (level === 'paragraph') {
              editor.chain().focus().setParagraph().run();
            } else {
              editor.chain().focus().toggleHeading({ level: parseInt(level) as 1 | 2 | 3 }).run();
            }
          }}
          className="px-2 py-1 text-sm border border-gray-300 rounded bg-white"
        >
          <option value="paragraph">Paragraph</option>
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
          <option value="3">Heading 3</option>
        </select>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Basic Formatting */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-gray-200' : ''}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-gray-200' : ''}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive('underline') ? 'bg-gray-200' : ''}
          title="Underline"
        >
          <Underline className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive('strike') ? 'bg-gray-200' : ''}
          title="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Lists & Alignment */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'bg-gray-200' : ''}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'bg-gray-200' : ''}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive('blockquote') ? 'bg-gray-200' : ''}
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={editor.isActive('codeBlock') ? 'bg-gray-200' : ''}
          title="Code Block"
        >
          <Code className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Alignment */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : ''}
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : ''}
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : ''}
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          className={editor.isActive({ textAlign: 'justify' }) ? 'bg-gray-200' : ''}
          title="Justify"
        >
          <AlignJustify className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Indentation */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().liftListItem('listItem').run()}
          title="Decrease Indent"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().sinkListItem('listItem').run()}
          title="Increase Indent"
        >
          <Plus className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Color */}
        <input
          type="color"
          onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
          className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
          title="Text Color"
        />

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Media */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addImage}
          title="Insert Image"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addTable}
          title="Insert Table"
        >
          <TableIcon className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Undo/Redo */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Clear Formatting */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          title="Clear Formatting"
        >
          <span className="text-xs font-bold">T<sub>x</sub></span>
        </Button>
      </div>

      {/* Editor Content */}
      <div 
        className="bg-white"
        style={showImageDialog ? { pointerEvents: 'none', opacity: 0.6 } : {}}
        tabIndex={showImageDialog ? -1 : undefined}
      >
        <EditorContent editor={editor} />
      </div>

      {/* Status Bar */}
      <div className="border-t border-gray-300 bg-gray-50 px-4 py-1 flex items-center justify-between text-xs text-gray-600">
        <span>{editor.getAttributes('heading').level ? `H${editor.getAttributes('heading').level}` : 'P'}</span>
        <span>{editor.storage.characterCount?.words() || 0} WORDS</span>
      </div>

      {/* Image Upload Dialog */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Image</DialogTitle>
            <DialogDescription>
              Upload an image file or enter an image URL
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* File Upload */}
            <div className="space-y-2">
              <Label>Upload Image</Label>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileUpload}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                disabled={uploading}
              />
              {uploading && (
                <p className="text-sm text-gray-500">Uploading...</p>
              )}
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or</span>
              </div>
            </div>

            {/* URL Input */}
            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleImageUrlSubmit();
                  }
                }}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowImageDialog(false);
                  setImageUrl('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleImageUrlSubmit}
                disabled={!imageUrl.trim() || uploading}
              >
                Insert Image
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
