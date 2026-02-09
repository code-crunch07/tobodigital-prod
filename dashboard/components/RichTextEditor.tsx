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
  Link as LinkIcon,
  Maximize2,
  Move,
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

// Custom Image extension with resize handles
const ResizableImage = Image.extend({
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
          const width = element.getAttribute('width');
          return width ? parseInt(width, 10) : null;
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
          const height = element.getAttribute('height');
          return height ? parseInt(height, 10) : null;
        },
      },
      style: {
        default: null,
        renderHTML: attributes => {
          if (!attributes.width && !attributes.height) {
            return {};
          }
          const styles: string[] = [];
          if (attributes.width) {
            styles.push(`width: ${attributes.width}px`);
          }
          if (attributes.height) {
            styles.push(`height: ${attributes.height}px`);
          }
          styles.push('max-width: 100%');
          styles.push('height: auto');
          return {
            style: styles.join('; '),
          };
        },
      },
      align: {
        default: 'left',
        renderHTML: attributes => {
          if (!attributes.align || attributes.align === 'left') {
            return {};
          }
          return {
            style: `display: block; margin-left: ${attributes.align === 'center' ? 'auto' : '0'}; margin-right: ${attributes.align === 'right' ? 'auto' : '0'};`,
          };
        },
        parseHTML: element => {
          const style = element.getAttribute('style') || '';
          if (style.includes('margin-left: auto') && style.includes('margin-right: auto')) {
            return 'center';
          }
          if (style.includes('margin-right: auto')) {
            return 'right';
          }
          return 'left';
        },
      },
    };
  },

  addNodeView() {
    return ({ node, HTMLAttributes, getPos, editor }) => {
      const dom = document.createElement('div');
      dom.className = 'image-wrapper relative inline-block group';
      dom.style.display = 'inline-block';
      dom.style.maxWidth = '100%';

      const img = document.createElement('img');
      Object.entries(HTMLAttributes).forEach(([key, value]) => {
        if (key === 'style') {
          img.setAttribute('style', value as string);
        } else {
          img.setAttribute(key, value as string);
        }
      });

      if (node.attrs.src) {
        img.src = node.attrs.src;
      }
      if (node.attrs.alt) {
        img.alt = node.attrs.alt;
      }
      if (node.attrs.width) {
        img.width = node.attrs.width;
        img.style.width = `${node.attrs.width}px`;
      }
      if (node.attrs.height) {
        img.height = node.attrs.height;
        img.style.height = `${node.attrs.height}px`;
      }
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
      img.style.display = 'block';
      img.draggable = false;

      // Add resize handles
      const createHandle = (position: string) => {
        const handle = document.createElement('div');
        handle.className = `resize-handle resize-handle-${position}`;
        handle.style.cssText = `
          position: absolute;
          background: #3b82f6;
          border: 2px solid white;
          border-radius: 50%;
          width: 12px;
          height: 12px;
          cursor: ${position.includes('e') ? 'ew-resize' : position.includes('s') ? 'ns-resize' : 'nwse-resize'};
          opacity: 0;
          transition: opacity 0.2s;
          z-index: 10;
        `;
        
        if (position.includes('n')) handle.style.top = '-6px';
        if (position.includes('s')) handle.style.bottom = '-6px';
        if (position.includes('e')) handle.style.right = '-6px';
        if (position.includes('w')) handle.style.left = '-6px';
        if (position === 'se') {
          handle.style.bottom = '-6px';
          handle.style.right = '-6px';
        }

        let isResizing = false;
        let startX = 0;
        let startY = 0;
        let startWidth = 0;
        let startHeight = 0;

        handle.addEventListener('mousedown', (e) => {
          e.preventDefault();
          e.stopPropagation();
          isResizing = true;
          startX = e.clientX;
          startY = e.clientY;
          startWidth = img.offsetWidth;
          startHeight = img.offsetHeight;

          const onMouseMove = (e: MouseEvent) => {
            if (!isResizing) return;
            const diffX = e.clientX - startX;
            const diffY = e.clientY - startY;
            
            let newWidth = startWidth;
            let newHeight = startHeight;

            if (position.includes('e')) {
              newWidth = Math.max(50, startWidth + diffX);
            }
            if (position.includes('w')) {
              newWidth = Math.max(50, startWidth - diffX);
            }
            if (position.includes('s')) {
              newHeight = Math.max(50, startHeight + diffY);
            }
            if (position.includes('n')) {
              newHeight = Math.max(50, startHeight - diffY);
            }

            // Maintain aspect ratio for corner handles
            if (position === 'se' || position === 'ne' || position === 'sw' || position === 'nw') {
              const aspectRatio = startWidth / startHeight;
              if (position.includes('e') || position.includes('w')) {
                newHeight = newWidth / aspectRatio;
              } else {
                newWidth = newHeight * aspectRatio;
              }
            }

            img.style.width = `${newWidth}px`;
            img.style.height = `${newHeight}px`;
          };

          const onMouseUp = () => {
            isResizing = false;
            const pos = getPos();
            if (typeof pos === 'number') {
              editor.commands.updateAttributes('image', {
                width: parseInt(img.style.width),
                height: parseInt(img.style.height),
              });
            }
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
          };

          document.addEventListener('mousemove', onMouseMove);
          document.addEventListener('mouseup', onMouseUp);
        });

        return handle;
      };

      // Show handles on hover
      dom.addEventListener('mouseenter', () => {
        dom.querySelectorAll('.resize-handle').forEach((h: any) => {
          h.style.opacity = '1';
        });
      });

      dom.addEventListener('mouseleave', () => {
        dom.querySelectorAll('.resize-handle').forEach((h: any) => {
          h.style.opacity = '0';
        });
      });

      dom.appendChild(img);
      dom.appendChild(createHandle('se')); // Bottom-right corner
      dom.appendChild(createHandle('e')); // Right edge
      dom.appendChild(createHandle('s')); // Bottom edge

      return {
        dom,
        contentDOM: null,
      };
    };
  },
}).configure({
  inline: false,
  allowBase64: true,
});

export default function RichTextEditor({ value, onChange, placeholder = 'Enter description...' }: RichTextEditorProps) {
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const skipNextSyncRef = useRef(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        underline: false,
        paragraph: {
          HTMLAttributes: {
            class: 'my-2',
          },
        },
      }),
      ResizableImage,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({
        types: ['heading', 'paragraph', 'image'],
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
      skipNextSyncRef.current = true;
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] px-4 py-3',
        'data-placeholder': placeholder,
      },
    },
  });

  // Update editor content when value prop changes
  useEffect(() => {
    if (!editor) return;
    if (skipNextSyncRef.current) {
      skipNextSyncRef.current = false;
      return;
    }
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value || '', { emitUpdate: false });
    }
  }, [value, editor]);

  // Handle editor focus when dialog is open
  useEffect(() => {
    if (!editor) return;
    if (showImageDialog || showLinkDialog) {
      editor.commands.blur();
      const editorElement = editor.view.dom;
      if (editorElement && document.activeElement === editorElement) {
        (editorElement as HTMLElement).blur();
      }
    }
  }, [showImageDialog, showLinkDialog, editor]);

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
    if (!url || !editor) return;
    const { from } = editor.state.selection;
    editor
      .chain()
      .focus()
      .insertContentAt(from, { type: 'image', attrs: { src: url } })
      .setTextSelection(from + 1)
      .run();
    setShowImageDialog(false);
    setImageUrl('');
  };

  const handleImageUrlSubmit = () => {
    if (imageUrl.trim()) {
      insertImage(imageUrl.trim());
    }
  };

  const addLink = () => {
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to);
    setLinkText(selectedText);
    setLinkUrl('');
    setShowLinkDialog(true);
  };

  const insertLink = () => {
    if (!linkUrl.trim()) return;
    editor
      .chain()
      .focus()
      .insertContent(`<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkText || linkUrl}</a>`)
      .run();
    setShowLinkDialog(false);
    setLinkUrl('');
    setLinkText('');
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
          onClick={addLink}
          title="Insert Link"
        >
          <LinkIcon className="h-4 w-4" />
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
        style={showImageDialog || showLinkDialog ? { pointerEvents: 'none', opacity: 0.6 } : {}}
        tabIndex={showImageDialog || showLinkDialog ? -1 : undefined}
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
              Upload an image file or enter an image URL. You can resize images after inserting by hovering over them.
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

      {/* Link Dialog */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Link</DialogTitle>
            <DialogDescription>
              Add a link to your content
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Link URL</Label>
              <Input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    insertLink();
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>Link Text (optional)</Label>
              <Input
                type="text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="Click here"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowLinkDialog(false);
                  setLinkUrl('');
                  setLinkText('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={insertLink}
                disabled={!linkUrl.trim()}
              >
                Insert Link
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
