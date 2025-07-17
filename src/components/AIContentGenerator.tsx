'use client';

import { useState } from 'react';
import { geminiService } from '../lib/gemini-service';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export function AIContentGenerator() {
  const [prompt, setPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [tokenCount, setTokenCount] = useState<number | null>(null);
  const [streamedText, setStreamedText] = useState('');

  // Standard generation
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    toast.info('Generating content...');

    try {
      // Count tokens first
      const count = await geminiService.countTokens(prompt);
      setTokenCount(count);
      
      // Generate content
      const { text, html } = await geminiService.generateArticle(prompt);
      setGeneratedContent(html);
      toast.success('Content generated!');
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Failed to generate content');
    } finally {
      setIsGenerating(false);
    }
  };

  // Streamed generation
  const handleStream = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    setStreamedText('');
    toast.info('Streaming content...');

    try {
      const stream = await geminiService.generateContentStream(prompt);
      
      for await (const chunk of stream) {
        const chunkText = chunk.text;
        setStreamedText(prev => prev + chunkText);
      }
      
      toast.success('Streaming completed!');
    } catch (error) {
      console.error('Streaming error:', error);
      toast.error('Streaming failed');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="prompt">Your Prompt</Label>
        <Textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe what you want to generate..."
          rows={5}
        />
      </div>

      <div className="flex gap-2">
        <Button 
          onClick={handleGenerate}
          disabled={isGenerating}
        >
          {isGenerating ? 'Generating...' : 'Generate'}
        </Button>
        
        <Button
          variant="outline"
          onClick={handleStream}
          disabled={isGenerating}
        >
          {isGenerating ? 'Streaming...' : 'Stream Content'}
        </Button>
      </div>

      {tokenCount !== null && (
        <div className="text-sm text-muted-foreground">
          Token count: {tokenCount}
        </div>
      )}

      {generatedContent && (
        <div className="mt-6 space-y-2">
          <Label>Generated Content</Label>
          <div 
            className="prose dark:prose-invert p-4 border rounded-lg bg-muted/50"
            dangerouslySetInnerHTML={{ __html: generatedContent }}
          />
        </div>
      )}

      {streamedText && (
        <div className="mt-6 space-y-2">
          <Label>Streamed Content</Label>
          <div className="p-4 border rounded-lg bg-muted/50 whitespace-pre-wrap">
            {streamedText}
          </div>
        </div>
      )}
    </div>
  );
}