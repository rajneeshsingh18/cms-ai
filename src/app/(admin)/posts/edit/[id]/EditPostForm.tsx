'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useActionState, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { type Post, type Tag } from '@prisma/client';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { updatePostAction, deletePostAction, uploadImageAction } from './actions'; 

type PostWithTags = Post & {
  tags: Tag[];
};

export default function EditPostForm({ post }: { post: PostWithTags }) {
  const [updateState, updateFormAction] = useActionState(updatePostAction, { message: '' });
  
  const [imageUrl, setImageUrl] = useState<string>(post.imageUrl || '');
  const initialTags = post.tags.map(tag => tag.name).join(', ');

  const TiptapEditor = useMemo(() => 
    dynamic(() => import('@/components/TiptapEditor'), { ssr: false, loading: () => <p>Loading editor...</p> }), 
  []);

  useEffect(() => {
    if (updateState?.message.includes('successfully')) {
      toast.success('Post Updated!', { description: updateState.message });
    } else if (updateState?.message) {
      toast.error('Error', { description: updateState.message });
    }
  }, [updateState]);

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
      // The action handles the redirect
    } catch (error) {
      toast.error('Failed to delete post.');
    }
  };

  return (
    <form action={updateFormAction} className="space-y-6">
        <input type="hidden" name="postId" value={post.id} />

        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight">Edit Post</h1>
            <div className="flex gap-2">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button type="button" variant="destructive">Delete</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete this post.</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <div><AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction></div>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                <Button type="submit">Save Changes</Button>
            </div>
        </div>

        <Card>
            <CardHeader><CardTitle>Post Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" name="title" placeholder="Your post title" defaultValue={post.title} required />
                </div>
                
                <div className="space-y-2">
                    <Label htmlFor="image">Featured Image</Label>
                    <Input id="image" name="image" type="file" accept="image/*" onChange={handleImageUpload} />
                    {imageUrl && (
                        <div className="mt-4 relative w-full h-64"><Image src={imageUrl} alt="Image preview" fill className="object-cover rounded-md" /></div>
                    )}
                    <input type="hidden" name="imageUrl" value={imageUrl} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input id="tags" name="tags" placeholder="e.g., tech, review" defaultValue={initialTags} />
                </div>

                <div className="space-y-2">
                    <Label>Content</Label>
                    <TiptapEditor name="content" defaultValue={post.content} />
                </div>

                <div className="flex items-center space-x-2">
                    <input type="checkbox" id="published" name="published" defaultChecked={post.published} className="h-4 w-4"/>
                    <Label htmlFor="published">Published</Label>
                </div>
            </CardContent>
        </Card>
    </form>
  );
}