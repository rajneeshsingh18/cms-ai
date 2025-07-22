'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useActionState, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { type Post, type Tag } from '@prisma/client';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { updatePostAction, deletePostAction, uploadImageAction, generateMetaDescriptionAction, suggestTagsAction } from './actions';
import AffiliateHelper from '@/components/AffiliateHelper';
import { type Editor } from '@tiptap/react';

type PostWithTags = Post & {
  tags: Tag[];
};


import { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

const RetroButton = ({ children, ...props }: { children: ReactNode } & ButtonProps) => (
    <Button {...props} className="bg-amber-100 border-2 border-foreground rounded-md shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all disabled:opacity-50 disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0 text-foreground">
      {children}
    </Button>
);

export default function EditPostForm({ post }: { post: PostWithTags }) {
  const [updateState, updateFormAction] = useActionState(updatePostAction, { message: '' });

  // State for all form fields
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [tags, setTags] = useState(post.tags.map(t => t.name).join(', '));
  const [imageUrl, setImageUrl] = useState(post.imageUrl || '');
  const [published, setPublished] = useState(post.published);
  const [metaDescription, setMetaDescription] = useState(post.metaDescription || '');
  const [saveStatus, setSaveStatus] = useState('All changes saved');
  const [editorInstance, setEditorInstance] = useState<Editor | null>(null);

  const TiptapEditor = useMemo(() =>
    dynamic(() => import('@/components/TiptapEditor'), { ssr: false, loading: () => <p>Loading editor...</p> }),
  []);

  // Autosave Logic
  useEffect(() => {
    setSaveStatus('Unsaved changes...');
    const debounceTimer = setTimeout(() => {
      setSaveStatus('Saving...');
      const formData = new FormData();
      formData.append('postId', post.id);
      formData.append('title', title);
      formData.append('content', content);
      formData.append('tags', tags);
      formData.append('imageUrl', imageUrl);
      formData.append('published', published ? 'on' : 'off');
      formData.append('metaDescription', metaDescription);
      
      updatePostAction(null, formData).then((result) => {
        if (result?.message.includes('successfully')) {
          setSaveStatus('All changes saved');
        } else {
          setSaveStatus('Error saving!');
        }
      });
    }, 2500);

    return () => clearTimeout(debounceTimer);
  }, [title, content, tags, imageUrl, published, metaDescription, post.id]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    toast.info('Uploading image...');
    const result = await uploadImageAction(formData);
    if (result.error) toast.error('Image Upload Failed', { description: result.error });
    else if (result.imageUrl) {
      setImageUrl(result.imageUrl);
      toast.success('Image Uploaded Successfully!');
    }
  };

  const handleDelete = async () => {
    toast.info('Deleting post...');
    await deletePostAction(post.id);
    toast.success('Post deleted successfully!');
  };

  const handlePreview = () => {
    const previewData = { title, content, imageUrl, tags: tags.split(',').map(name => ({ name })), createdAt: post.createdAt };
    localStorage.setItem('post-preview', JSON.stringify(previewData));
    window.open('/preview', '_blank');
  };

  const handleGenerateDescription = async () => {
    if (!content) return toast.error("Please add content before generating a description.");
    toast.info('Generating SEO description with AI...');
    const result = await generateMetaDescriptionAction(content);
    if (result.error) toast.error('Failed', { description: result.error });
    else if (result.description) {
      setMetaDescription(result.description);
      toast.success('Description generated!');
    }
  };

  const handleSuggestTags = async () => {
    if (!content) return toast.error("Please add content before suggesting tags.");
    toast.info('Suggesting tags with AI...');
    const result = await suggestTagsAction(content);
    if (result.error) toast.error('Failed', { description: result.error });
    else if (result.tags) {
      const existingTags = tags.split(',').map(t => t.trim()).filter(Boolean);
      const newTags = result.tags.split(',').map(t => t.trim()).filter(t => !existingTags.includes(t));
      if (newTags.length > 0) setTags([...existingTags, ...newTags].join(', '));
      toast.success('Tags suggested!');
    }
  };

  return (
    <form action={updateFormAction} className="space-y-6">
      <input type="hidden" name="postId" value={post.id} />
      
      <div className="flex justify-between items-center">
        <h1 className="text-3xl md:text-4xl font-bold font-serif tracking-wide">Edit Post</h1>
        <div className="flex items-center gap-4">
          <p className="text-sm font-mono text-foreground/80">{saveStatus}</p>
          <RetroButton type="button" onClick={handlePreview}>Preview</RetroButton>
          <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button type="button" variant="destructive" className="rounded-md border-2 border-red-800 shadow-[2px_2px_0px_0px_rgba(127,29,29,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all">Delete</Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-amber-50 border-2 border-foreground">
                <AlertDialogHeader>
                    <AlertDialogTitle className="font-serif">Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription className="font-mono">This will permanently delete this post.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel asChild><RetroButton>Cancel</RetroButton></AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-red-600 text-white rounded-md">Continue</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button type="submit" name="intent" value="save-and-close" className="bg-foreground text-amber-50 rounded-md shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all">Save & Close</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-white border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg">
            <CardHeader><CardTitle className="font-serif tracking-wide">Post Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="title" className="font-mono font-semibold">Title</Label>
                <Input id="title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} required className="font-mono" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="image" className="font-mono font-semibold">Featured Image</Label>
                <Input id="image" name="image" type="file" accept="image/*" onChange={handleImageUpload} className="font-mono" />
                {imageUrl && <div className="mt-2 relative w-full h-64"><Image src={imageUrl} alt="Image preview" fill className="object-cover rounded-md border-2 border-foreground" /></div>}
                <input type="hidden" name="imageUrl" value={imageUrl} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="metaDescription" className="font-mono font-semibold">SEO Meta Description</Label>
                <div className="flex gap-2">
                    <Textarea id="metaDescription" name="metaDescription" value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} placeholder="A concise summary for search engines..." rows={3} className="font-mono flex-grow" />
                    <RetroButton type="button" onClick={handleGenerateDescription}>AI</RetroButton>
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="tags" className="font-mono font-semibold">Tags</Label>
                <div className="flex gap-2">
                    <Input id="tags" name="tags" value={tags} onChange={(e) => setTags(e.target.value)} className="font-mono flex-grow" />
                    <RetroButton type="button" onClick={handleSuggestTags}>AI</RetroButton>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="font-mono font-semibold">Content</Label>
                <TiptapEditor
                  name="content"
                  defaultValue={post.content}
                  onChange={(newContent) => setContent(newContent)}
                  onEditorInstance={setEditorInstance}
                />
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <input type="checkbox" id="published" name="published" checked={published} onChange={(e) => setPublished(e.target.checked)} className="h-4 w-4"/>
                <Label htmlFor="published" className="font-mono">Publish Immediately</Label>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1">
            {/* The AffiliateHelper will now also be implicitly styled by the layout's background. 
                If it's a Card, we can style it too. Assuming it's a Card-based component. */}
            <div className="bg-white border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg">
                <AffiliateHelper editor={editorInstance} />
            </div>
        </div>
      </div>
    </form>
  );
}