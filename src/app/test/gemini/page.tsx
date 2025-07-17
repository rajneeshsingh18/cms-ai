'use client';

import { geminiService } from '@/lib/gemini-service';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function GeminiTestPage() {
  const [prompt, setPrompt] = useState('Explain quantum computing in simple terms');
  const [output, setOutput] = useState('');
  const [testResults, setTestResults] = useState<Record<string, boolean | string>>({});
  const [isTesting, setIsTesting] = useState(false);

  const runTests = async () => {
    setIsTesting(true);
    const results: Record<string, boolean | string> = {};

    try {
      // Test 1: Basic content generation
      const { text, html } = await geminiService.generateArticle(prompt);
      results['Content Generation'] = !!text && !!html;
      setOutput(html);

      // Test 2: Token counting
      const tokenCount = await geminiService.countTokens(prompt);
      results['Token Counting'] = tokenCount > 0;

      // Test 3: Streaming
      let streamedText = '';
      const stream = await geminiService.generateContentStream(prompt);
      for await (const chunk of stream) {
        streamedText += chunk.text;
      }
      results['Streaming'] = streamedText.length > 0;

      // Test 4: Markdown conversion
      const md = "## Heading\n**Bold** and _italic_ text";
      const htmlConverted = (geminiService as any).convertMarkdownToHtml(md);
      results['Markdown Conversion'] = htmlConverted.includes('<h2>') && 
                                    htmlConverted.includes('<strong>');

    } catch (error: any) {
      results['Error'] = error.message;
    } finally {
      setIsTesting(false);
      setTestResults(results);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Gemini Service Tests</h1>
      
      <div className="space-y-2">
        <Label>Test Prompt</Label>
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
        />
      </div>

      <Button onClick={runTests} disabled={isTesting}>
        {isTesting ? 'Testing...' : 'Run All Tests'}
      </Button>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Test Results</h2>
        <div className="space-y-2">
          {Object.entries(testResults).map(([test, result]) => (
            <div key={test} className="flex items-center">
              <span className="w-48 font-medium">{test}:</span>
              {typeof result === 'boolean' ? (
                <span className={result ? 'text-green-500' : 'text-red-500'}>
                  {result ? '✓ Passed' : '✗ Failed'}
                </span>
              ) : (
                <span className="text-red-500">{result}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Generated Output</h2>
        <div 
          className="p-4 border rounded bg-gray-50 dark:bg-gray-800"
          dangerouslySetInnerHTML={{ __html: output }}
        />
      </div>
    </div>
  );
}