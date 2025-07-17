'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createPost, uploadImageAction } from './actions';
import { useActionState, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { geminiService } from '@/lib/gemini-service';

const initialState = { message: '' };

export default function NewPostPage() {
  const [state, formAction] = useActionState(createPost, initialState);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [editorContent, setEditorContent] = useState('');
  const [postTitle, setPostTitle] = useState('');
  const [productSpecs, setProductSpecs] = useState('');
  const router = useRouter();

  const TiptapEditor = useMemo(() =>
    dynamic(() => import('@/components/TiptapEditor'), { 
      ssr: false, 
      loading: () => <p>Loading editor...</p> 
    }),
  []);

  useEffect(() => {
    if (state?.message && state.message.includes('successfully')) {
      toast.success('Post Created', {
        description: state.message,
        onAutoClose: () => router.push('/posts'),
      });
    } else if (state?.message) {
      toast.error('Error', { description: state.message });
    }
  }, [state, router]);

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

  const generateArticle = async () => {
    if (!postTitle || !productSpecs) {
      toast.error('Please enter both title and product specifications');
      return;
    }

    setIsGenerating(true);
    toast.info('Generating professional article...');

    try {
      const prompt = `
        Write a 100-word SEO-optimized article in English about: ${postTitle}
        Focus keyword: ${aiPrompt}
        Product specifications: ${productSpecs}

        Requirements:
        - Use H1, H2, H3, H4 headings (15+ total)
        - Include tables for outline and article
        - Add pros/cons table
        - Include 5 unique FAQs
        - Write in conversational tone with humor
        - Add disclaimer about pricing variations
        - Include Amazon disclosure
      `;

      const { html } = await geminiService.generateArticle(prompt);
      setEditorContent(html);
      toast.success('Article generated successfully!');
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Failed to generate article');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Create New Post</h1>
        <Button form="post-form" type="submit">Save Post</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* AI Generation Panel */}
        <Card>
          <CardHeader>
            <CardTitle>AI Article Generator</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="post-title">Post Title</Label>
              <Input 
                id="post-title"
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                placeholder="Enter your post title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="focus-keyword">Focus Keyword (SEO)</Label>
              <Input 
                id="focus-keyword"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Enter focus keyword for SEO"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-specs">Product Specifications</Label>
              <Textarea
                id="product-specs"
                value={productSpecs}
                onChange={(e) => setProductSpecs(e.target.value)}
                placeholder="Paste product specifications here..."
                rows={8}
              />
            </div>

            <Button 
              onClick={generateArticle}
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? 'Generating...' : 'Generate Professional Article'}
            </Button>

            <div className="text-sm text-muted-foreground">
              Tip: Include all relevant product details for best results
            </div>
          </CardContent>
        </Card>

        {/* Post Form */}
        <form id="post-form" action={formAction} className="space-y-6">
          <input type="hidden" name="content" value={editorContent} />
          
          <Card>
            <CardHeader><CardTitle>Post Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input 
                  id="title" 
                  name="title" 
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="Your post title" 
                  required 
                />
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
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  name="tags"
                  placeholder="e.g., tech, review, apple"
                />
              </div>

              <div className="space-y-2">
                <Label>Content</Label>
                <TiptapEditor 
                  key={editorContent} // Force re-render when content changes
                  name="content" 
                  defaultValue={editorContent}
                  onChange={(content) => setEditorContent(content)}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input type="checkbox" id="published" name="published" defaultChecked={false} className="h-4 w-4"/>
                <Label htmlFor="published">Publish immediately</Label>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}