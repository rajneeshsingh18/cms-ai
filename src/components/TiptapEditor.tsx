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
} from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';
import { useState, useEffect } from 'react';

// Props definition for the component
interface TiptapEditorProps {
  defaultValue: string;
  name: string;
  onChange: (value: string) => void;
}

// Toolbar Component
function EditorToolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;
  return (
    <div className="border border-input bg-transparent rounded-md p-1 flex items-center gap-1">
      <Toggle size="sm" pressed={editor.isActive('heading', { level: 2 })} onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 className="h-4 w-4" /></Toggle>
      <Toggle size="sm" pressed={editor.isActive('bold')} onPressedChange={() => editor.chain().focus().toggleBold().run()}><Bold className="h-4 w-4" /></Toggle>
      <Toggle size="sm" pressed={editor.isActive('italic')} onPressedChange={() => editor.chain().focus().toggleItalic().run()}><Italic className="h-4 w-4" /></Toggle>
      <Toggle size="sm" pressed={editor.isActive('strike')} onPressedChange={() => editor.chain().focus().toggleStrike().run()}><Strikethrough className="h-4 w-4" /></Toggle>
      <Toggle size="sm" pressed={editor.isActive('bulletList')} onPressedChange={() => editor.chain().focus().toggleBulletList().run()}><List className="h-4 w-4" /></Toggle>
      <Toggle size="sm" pressed={editor.isActive('orderedList')} onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered className="h-4 w-4" /></Toggle>
    </div>
  );
}

// Main Tiptap Editor Component
export default function TiptapEditor({
  defaultValue,
  name,
  onChange,
}: TiptapEditorProps) {
  const [htmlContent, setHtmlContent] = useState(defaultValue);

  const editor = useEditor({
    extensions: [StarterKit],
    content: defaultValue,
    // **THE FIX IS HERE:** This line directly solves the error.
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'rounded-md border min-h-[150px] border-input bg-background p-3 text-sm',
      },
    },
    onUpdate: ({ editor }) => {
      const newContent = editor.getHTML();
      setHtmlContent(newContent);
      onChange(newContent);
    },
  });

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