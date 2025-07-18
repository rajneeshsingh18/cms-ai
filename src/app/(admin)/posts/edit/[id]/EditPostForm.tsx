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

type PostWithTags = Post & {
  tags: Tag[];
};

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

    if (result.error) {
      toast.error('Image Upload Failed', { description: result.error });
    } else if (result.imageUrl) {
      setImageUrl(result.imageUrl);
      toast.success('Image Uploaded Successfully!');
    }
  };

  const handleDelete = async () => {
    toast.info('Deleting post...');
    try {
      await deletePostAction(post.id);
      toast.success('Post deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete post.');
    }
  };

  const handlePreview = () => {
    const previewData = {
      title,
      content,
      imageUrl,
      tags: tags.split(',').map(name => ({ name })),
      createdAt: post.createdAt,
    };
    localStorage.setItem('post-preview', JSON.stringify(previewData));
    window.open('/preview', '_blank');
  };

  const handleGenerateDescription = async () => {
    if (!content) {
        toast.error("Please add content before generating a description.");
        return;
    }
    toast.info('Generating SEO description with AI...');
    const result = await generateMetaDescriptionAction(content);
    if (result.error) {
      toast.error('Failed', { description: result.error });
    } else if (result.description) {
      setMetaDescription(result.description);
      toast.success('Description generated!');
    }
  };

  const handleSuggestTags = async () => {
    if (!content) {
        toast.error("Please add content before suggesting tags.");
        return;
    }
    toast.info('Suggesting tags with AI...');
    const result = await suggestTagsAction(content);
    if (result.error) {
      toast.error('Failed', { description: result.error });
    } else if (result.tags) {
      const existingTags = tags.split(',').map(t => t.trim()).filter(Boolean);
      const newTags = result.tags.split(',').map(t => t.trim()).filter(t => !existingTags.includes(t));
      if (newTags.length > 0) {
        setTags([...existingTags, ...newTags].join(', '));
      }
      toast.success('Tags suggested!');
    }
  };

  return (
    <form action={updateFormAction} className="space-y-6">
        <input type="hidden" name="postId" value={post.id} />
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight">Edit Post</h1>
            <div className="flex items-center gap-4">
                <p className="text-sm text-muted-foreground">{saveStatus}</p>
                <Button type="button" variant="outline" onClick={handlePreview}>Preview</Button>
                <AlertDialog>
                    <AlertDialogTrigger asChild><Button type="button" variant="destructive">Delete</Button></AlertDialogTrigger>
                    <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete this post.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><div><AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction></div></AlertDialogFooter></AlertDialogContent>
                </AlertDialog>
                <Button type="submit" name="intent" value="save-and-close">Save & Close</Button>
            </div>
        </div>

        <Card>
            <CardHeader><CardTitle>Post Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
                
                <div className="space-y-2">
                    <Label htmlFor="image">Featured Image</Label>
                    <Input id="image" name="image" type="file" accept="image/*" onChange={handleImageUpload} />
                    {imageUrl && <div className="mt-4 relative w-full h-64"><Image src={imageUrl} alt="Image preview" fill className="object-cover rounded-md" /></div>}
                    <input type="hidden" name="imageUrl" value={imageUrl} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="metaDescription">SEO Meta Description</Label>
                    <Textarea id="metaDescription" name="metaDescription" value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} placeholder="A concise summary for search engines (max 155 characters)." rows={3} />
                    <Button type="button" variant="outline" size="sm" onClick={handleGenerateDescription}>Generate with AI</Button>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input id="tags" name="tags" value={tags} onChange={(e) => setTags(e.target.value)} />
                    <Button type="button" variant="outline" size="sm" onClick={handleSuggestTags}>Suggest with AI</Button>
                </div>

                <div className="space-y-2">
                    <Label>Content</Label>
                    <TiptapEditor name="content" defaultValue={post.content} onChange={(newContent) => setContent(newContent)} />
                </div>

                <div className="flex items-center space-x-2">
                    <input type="checkbox" id="published" name="published" checked={published} onChange={(e) => setPublished(e.target.checked)} className="h-4 w-4"/>
                    <Label htmlFor="published">Published</Label>
                </div>
            </CardContent>
        </Card>
    </form>
  );
}