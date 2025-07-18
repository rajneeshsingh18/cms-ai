'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { generateAffiliateContentAction } from '@/app/(admin)/posts/edit/[id]/actions';
import { type Editor } from '@tiptap/react';

interface AffiliateHelperProps {
  editor: Editor | null;
}

export default function AffiliateHelper({ editor }: AffiliateHelperProps) {
  const [productName, setProductName] = useState('');
  const [affiliateLink, setAffiliateLink] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!productName || !affiliateLink) {
      toast.error('Please provide both a product name and an affiliate link.');
      return;
    }
    if (!editor) {
      toast.error('Editor is not available. Please try again.');
      return;
    }

    setIsGenerating(true);
    toast.info('Generating affiliate content...');

    const result = await generateAffiliateContentAction(productName, affiliateLink);

    if (result.error) {
      toast.error('Failed to generate content', { description: result.error });
    } else if (result.htmlContent) {
      // Insert the generated HTML into the editor at the current cursor position
      editor.chain().focus().insertContent(result.htmlContent).run();
      toast.success('Affiliate content inserted!');
    }

    setIsGenerating(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Affiliate Helper</CardTitle>
        <CardDescription>Generate a product review section and insert it into your post.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="productName">Product Name</Label>
          <Input
            id="productName"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="e.g., iPhone 16 Pro"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="affiliateLink">Your Affiliate Link</Label>
          <Input
            id="affiliateLink"
            value={affiliateLink}
            onChange={(e) => setAffiliateLink(e.target.value)}
            placeholder="e.g., https://amazon.com/your-link"
          />
        </div>
        <Button onClick={handleGenerate} disabled={isGenerating} className="w-full">
          {isGenerating ? 'Generating...' : 'Generate & Insert Content'}
        </Button>
      </CardContent>
    </Card>
  );
}