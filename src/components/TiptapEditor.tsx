'use client';

import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  Bold,
  Strikethrough,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Heading1,
  Heading3,
  Heading4,
  Underline as UnderlineIcon,
  Image as ImageIcon,
  Link2,
} from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';
import { useState, useEffect } from 'react';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';

interface TiptapEditorProps {
  defaultValue: string;
  name: string;
  onChange: (value: string) => void;
}

function EditorToolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;
  
  return (
    <div className="border border-input bg-transparent rounded-md p-1 flex flex-wrap items-center gap-1">
      {/* Headings */}
      <Toggle size="sm" pressed={editor.isActive('heading', { level: 1 })} onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
        <Heading1 className="h-4 w-4" />
      </Toggle>
      <Toggle size="sm" pressed={editor.isActive('heading', { level: 2 })} onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        <Heading2 className="h-4 w-4" />
      </Toggle>
      <Toggle size="sm" pressed={editor.isActive('heading', { level: 3 })} onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        <Heading3 className="h-4 w-4" />
      </Toggle>
      <Toggle size="sm" pressed={editor.isActive('heading', { level: 4 })} onPressedChange={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}>
        <Heading4 className="h-4 w-4" />
      </Toggle>

      {/* Text formatting */}
      <Toggle size="sm" pressed={editor.isActive('bold')} onPressedChange={() => editor.chain().focus().toggleBold().run()}>
        <Bold className="h-4 w-4" />
      </Toggle>
      <Toggle size="sm" pressed={editor.isActive('italic')} onPressedChange={() => editor.chain().focus().toggleItalic().run()}>
        <Italic className="h-4 w-4" />
      </Toggle>
      <Toggle size="sm" pressed={editor.isActive('underline')} onPressedChange={() => editor.chain().focus().toggleUnderline().run()}>
        <UnderlineIcon className="h-4 w-4" />
      </Toggle>
      <Toggle size="sm" pressed={editor.isActive('strike')} onPressedChange={() => editor.chain().focus().toggleStrike().run()}>
        <Strikethrough className="h-4 w-4" />
      </Toggle>

      {/* Lists */}
      <Toggle size="sm" pressed={editor.isActive('bulletList')} onPressedChange={() => editor.chain().focus().toggleBulletList().run()}>
        <List className="h-4 w-4" />
      </Toggle>
      <Toggle size="sm" pressed={editor.isActive('orderedList')} onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}>
        <ListOrdered className="h-4 w-4" />
      </Toggle>

      {/* Links */}
      <Toggle size="sm" onPressedChange={() => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);
        if (url === null) return;
        if (url === '') {
          editor.chain().focus().extendMarkRange('link').unsetLink().run();
          return;
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
      }}>
        <Link2 className="h-4 w-4" />
      </Toggle>

      {/* Images */}
      <Toggle size="sm" onPressedChange={() => {
        const url = window.prompt('Enter the URL of the image:');
        if (url) {
          editor.chain().focus().setImage({ src: url }).run();
        }
      }}>
        <ImageIcon className="h-4 w-4" />
      </Toggle>
    </div>
  );
}

export default function TiptapEditor({
  defaultValue,
  name,
  onChange,
}: TiptapEditorProps) {
  const [htmlContent, setHtmlContent] = useState(defaultValue);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      Image,
    ],
    content: defaultValue,
    editorProps: {
      attributes: {
        class: 'rounded-md border min-h-[150px] border-input bg-background p-3 text-sm prose max-w-none',
      },
    },
    onUpdate: ({ editor }) => {
      const newContent = editor.getHTML();
      setHtmlContent(newContent);
      onChange(newContent);
    },
    // Explicitly disable SSR
    immediatelyRender: false,
  });

  if (!mounted) {
    return (
      <div className="rounded-md border min-h-[150px] border-input bg-background p-3 text-sm">
        Loading editor...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
      <textarea
        name={name}
        value={htmlContent}
        className="hidden"
        readOnly
      />
    </div>
  );
}