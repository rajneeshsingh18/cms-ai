'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createPost, uploadImageAction } from './actions';
import { useActionState, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import Image from 'next/image';

const initialState = { message: '' };

export default function NewPostPage() {
  const [state, formAction] = useActionState(createPost, initialState);
  const [imageUrl, setImageUrl] = useState<string>('');

  const TiptapEditor = useMemo(() => 
    dynamic(() => import('@/components/TiptapEditor'), { ssr: false, loading: () => <p>Loading editor...</p> }), 
  []);

  useEffect(() => {
    // This effect is mainly for showing errors now
    if (state?.message) {
      toast.error('Error', { description: state.message });
    }
  }, [state]);

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

  return (
    <form action={formAction} className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Create New Post</h1>
        <Button type="submit">Save Post</Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Post Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" placeholder="Your post title" required />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="image">Featured Image</Label>
            <Input id="image" type="file" onChange={handleImageUpload} accept="image/*" />
            {imageUrl && (
              <div className="mt-4 relative w-full h-64">
                <Image src={imageUrl} alt="Image preview" fill className="object-cover rounded-md" />
              </div>
            )}
            <input type="hidden" name="imageUrl" value={imageUrl} />
          </div>

          <div className="space-y-2">
            <Label>Content</Label>
            <TiptapEditor name="content" defaultValue="" />
          </div>

          <div className="flex items-center space-x-2">
            <input type="checkbox" id="published" name="published" defaultChecked={false} className="h-4 w-4"/>
            <Label htmlFor="published">Publish immediately</Label>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}