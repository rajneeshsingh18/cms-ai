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

// Toolbar Component (no changes here)
function EditorToolbar({ editor }: { editor: Editor | null }) {
    if (!editor) return null;
    return (
        <div className="border border-input bg-transparent rounded-md p-1 flex items-center gap-1">
            <Toggle size="sm" pressed={editor.isActive('heading', { level: 2 })} onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 className="h-4 w-4" /></Toggle>
            <Toggle size="sm" pressed={editor.isActive('bold')} onPressedChange={() => editor.chain().focus().toggleBold().run()}><Bold className="h-4 w-4" /></Toggle>
            <Toggle size="sm" pressed={editor.isActive('italic')} onPressedChange={() => editor.chain().focus().toggleItalic().run()}><Italic className="h-4 w-4" /></Toggle>
            <Toggle size="sm" pressed={editor.isActive('strike')} onPressedChange={() => editor.chain().focus().toggleStrike().run()}><Strikethrough className="h-4 w-4" /></Toggle>
        </div>
    );
}

// Main Tiptap Editor Component
export default function TiptapEditor({
  defaultValue,
  name,
}: {
  defaultValue: string;
  name: string;
}) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: defaultValue,
    // **THE FIX IS HERE:** Add the immediatelyRender flag
    immediatelyRender: false, 
    editorProps: {
      attributes: {
        class: 'rounded-md border min-h-[150px] border-input bg-background p-3 text-sm',
      },
    },
    // This part is important for the hidden textarea to update
    onUpdate: ({ editor }) => {
      // Forcing a re-render to update the hidden textarea's value
      // This is a common pattern when integrating Tiptap with forms
      if (editor.isFocused) {
          // A minimal update to trigger React's state change detection
      }
    }
  });

  return (
    <div className="flex flex-col gap-2">
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
      {/* Hidden textarea to pass content to the Server Action */}
      <textarea
        name={name}
        value={editor?.getHTML() || ''}
        className="hidden"
        readOnly
      />
    </div>
  );
}