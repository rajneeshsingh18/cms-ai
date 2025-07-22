'use client';

import { Button, buttonVariants } from '@/components/ui/button'; // Import buttonVariants
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
import {  updatePostAction, deletePostAction, uploadImageAction, generateMetaDescriptionAction, suggestTagsAction } from '../edit/[id]/actions';
import {createPostAction} from "./actions"
import { geminiService } from '@/lib/gemini-service';
import AffiliateHelper from '@/components/AffiliateHelper';
import { type Editor } from '@tiptap/react';
import { cn } from '@/lib/utils'; // Import cn utility

// Define the type for the post object, making it optional for 'create' mode
type PostWithTags = Post & {
  tags: Tag[];
};

interface PostFormProps {
  post?: PostWithTags; // Post is optional
}

const initialState = { message: '' };

// --- FIX #2: Update RetroButton to accept size and other Button props ---
type ButtonProps = React.ComponentProps<typeof Button>;

const RetroButton: React.FC<React.PropsWithChildren<ButtonProps>> = ({ className, children, ...props }) => (
    <Button 
      {...props} 
      className={cn(
        "bg-amber-100 border-2 border-foreground rounded-md shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all disabled:opacity-50 disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0 text-foreground",
        className
      )}
    >
      {children}
    </Button>
);


export default function PostForm({ post }: PostFormProps) {
  const isEditMode = !!post;

  const [state, formAction] = useActionState(isEditMode ? updatePostAction : createPostAction, initialState);

  // State for all form fields
  const [title, setTitle] = useState(post?.title || '');
  const [content, setContent] = useState(post?.content || '');
  const [tags, setTags] = useState(post?.tags.map(t => t.name).join(', ') || '');
  const [imageUrl, setImageUrl] = useState(post?.imageUrl || '');
  const [published, setPublished] = useState(post?.published || false);
  const [metaDescription, setMetaDescription] = useState(post?.metaDescription || '');
  
  // AI specific state
  const [productSpecs, setProductSpecs] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // UI state
  const [saveStatus, setSaveStatus] = useState('Saved');
  const [editorInstance, setEditorInstance] = useState<Editor | null>(null);

  const TiptapEditor = useMemo(() =>
    dynamic(() => import('@/components/TiptapEditor'), { ssr: false, loading: () => <p>Loading editor...</p> }),
  []);

  // Autosave Logic (only in edit mode)
  useEffect(() => {
    if (!isEditMode) return;

    setSaveStatus('Unsaved changes...');
    const debounceTimer = setTimeout(() => {
      setSaveStatus('Saving...');
      const formData = new FormData();
      formData.append('postId', post.id);
      formData.append('title', title);
      formData.append('content', content);
      formData.append('tags', tags);
      formData.append('imageUrl', imageUrl);
      formData.append('published', published.toString());
      formData.append('metaDescription', metaDescription);
      
      updatePostAction(null, formData).then((result) => {
        setSaveStatus(result?.message.includes('successfully') ? 'All changes saved' : 'Error saving!');
      });
    }, 2500);

    return () => clearTimeout(debounceTimer);
  }, [title, content, tags, imageUrl, published, metaDescription, post, isEditMode]);

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
        if (!isEditMode) return;
        toast.info('Deleting post...');
        await deletePostAction(post.id);
        toast.success('Post deleted successfully!');
    };

    const handlePreview = () => {
        const previewData = { title, content, imageUrl, tags: tags.split(',').map(name => ({ name })), createdAt: post?.createdAt || new Date() };
        localStorage.setItem('post-preview', JSON.stringify(previewData));
        window.open('/preview', '_blank');
    };
    
    const generateArticle = async () => {
        if (!title || !productSpecs) return toast.error('Please enter both title and product specs.');
        setIsGenerating(true);
        toast.info('Generating professional article...');
        try {
            const prompt = `Write a 1000-word SEO-optimized article about: ${title}. Product specifications: ${productSpecs}. Structure it with an outline, full content in Markdown, a pros/cons table, conclusion, and 5 FAQs. Use a conversational, human-like tone.`;
            const { html } = await geminiService.generateArticle(prompt);
            if (editorInstance) {
                editorInstance.commands.setContent(html);
            }
            setContent(html); 
            toast.success('Article generated!');
        } catch (error) {
            toast.error('Failed to generate article.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerateDescription = async () => {
        if (!content) return toast.error("Please add content first.");
        toast.info('Generating SEO description...');
        const result = await generateMetaDescriptionAction(content);
        if (result.description) {
            setMetaDescription(result.description);
            toast.success('Description generated!');
        } else toast.error('Failed to generate description.');
    };

    const handleSuggestTags = async () => {
        if (!content) return toast.error("Please add content first.");
        toast.info('Suggesting tags...');
        const result = await suggestTagsAction(content);
        if (result.tags) {
            const existingTags = tags.split(',').map(t => t.trim()).filter(Boolean);
            const newTags = result.tags.split(',').map(t => t.trim()).filter(t => !existingTags.includes(t));
            if (newTags.length > 0) setTags([...existingTags, ...newTags].join(', '));
            toast.success('Tags suggested!');
        } else toast.error('Failed to suggest tags.');
    };

  return (
    <form action={formAction} className="space-y-6">
      {isEditMode && <input type="hidden" name="postId" value={post.id} />}
      
      <div className="flex justify-between items-center">
        <h1 className="text-3xl md:text-4xl font-bold font-serif tracking-wide">{isEditMode ? 'Edit Post' : 'Create New Post'}</h1>
        <div className="flex items-center gap-4">
          {isEditMode && <p className="text-sm font-mono text-foreground/80">{saveStatus}</p>}
          <RetroButton type="button" onClick={handlePreview}>Preview</RetroButton>
          {isEditMode && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="destructive" className="rounded-md border-2 border-red-800 shadow-[2px_2px_0px_0px_rgba(127,29,29,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all">Delete</Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-amber-50 border-2 border-foreground">
                  <AlertDialogHeader><AlertDialogTitle className="font-serif">Are you sure?</AlertDialogTitle><AlertDialogDescription className="font-mono">This will permanently delete this post.</AlertDialogDescription></AlertDialogHeader>
                  <AlertDialogFooter><AlertDialogCancel asChild><RetroButton>Cancel</RetroButton></AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-red-600 text-white rounded-md">Continue</AlertDialogAction></AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button type="submit" className="bg-foreground text-amber-50 rounded-md shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
            {isEditMode ? 'Save & Close' : 'Save Post'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg">
            <CardHeader><CardTitle className="font-serif tracking-wide">Post Content</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="title" className="font-mono font-semibold">Title</Label>
                <Input id="title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} required className="font-mono" />
              </div>
              <div className="space-y-1">
                <Label className="font-mono font-semibold">Content</Label>
                {/* --- FIX #1: Add the 'name' prop --- */}
                <TiptapEditor 
                  name="content"
                  defaultValue={content} 
                  onChange={setContent} 
                  onEditorInstance={setEditorInstance} 
                />
                 <input type="hidden" name="content" value={content} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
            <Card className="bg-white border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg">
                <CardHeader><CardTitle className="font-serif tracking-wide">AI Article Generator</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-1">
                        <Label htmlFor="product-specs" className="font-mono font-semibold">Product Specifications</Label>
                        <Textarea id="product-specs" value={productSpecs} onChange={(e) => setProductSpecs(e.target.value)} placeholder="Paste details for the AI..." rows={6} className="font-mono" />
                    </div>
                    <Button type="button" onClick={generateArticle} disabled={isGenerating} className="w-full bg-foreground text-amber-50 rounded-md">
                        {isGenerating ? 'Generating...' : 'Generate Article'}
                    </Button>
                </CardContent>
            </Card>

            <Card className="bg-white border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg">
                <CardHeader><CardTitle className="font-serif tracking-wide">Details & SEO</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-1">
                        <Label htmlFor="image" className="font-mono font-semibold">Featured Image</Label>
                        <Input id="image" type="file" accept="image/*" onChange={handleImageUpload} className="font-mono" />
                        {imageUrl && <div className="mt-2 relative w-full h-40"><Image src={imageUrl} alt="Preview" fill className="object-cover rounded-md border-2 border-foreground" /></div>}
                        <input type="hidden" name="imageUrl" value={imageUrl} />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="tags" className="font-mono font-semibold">Tags</Label>
                        <div className="flex gap-2">
                          <Input id="tags" name="tags" value={tags} onChange={(e) => setTags(e.target.value)} className="font-mono flex-grow" />
                          <RetroButton type="button" size="sm" onClick={handleSuggestTags}>AI</RetroButton>
                        </div>
                    </div>
                     <div className="space-y-1">
                        <Label htmlFor="metaDescription" className="font-mono font-semibold">Meta Description</Label>
                        <div className="flex gap-2">
                           <Textarea id="metaDescription" name="metaDescription" value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} rows={3} className="font-mono flex-grow" />
                           <RetroButton type="button" size="sm" onClick={handleGenerateDescription}>AI</RetroButton>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 pt-2">
                        <input type="checkbox" id="published" name="published" checked={published} onChange={(e) => setPublished(e.target.checked)} className="h-4 w-4"/>
                        <Label htmlFor="published" className="font-mono">Publish</Label>
                    </div>
                </CardContent>
            </Card>
            
            <AffiliateHelper editor={editorInstance} />
        </div>
      </div>
    </form>
  );
}