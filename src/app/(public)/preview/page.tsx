'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

// Define a type for the preview data
interface PreviewData {
  title: string;
  content: string;
  imageUrl: string | null;
  createdAt: Date; // Keep as Date for consistency, will be formatted on render
  tags: { name: string }[];
}

export default function PreviewPage() {
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This effect runs only in the browser to get data from localStorage
    const storedData = localStorage.getItem('post-preview');
    if (storedData) {
      // Parse data and convert date string back to a Date object
      const parsedData = JSON.parse(storedData);
      setPreviewData({
        ...parsedData,
        createdAt: new Date(parsedData.createdAt), 
      });
    }
    setIsLoading(false);
  }, []);

  // Themed container for all states
  const PageContainer = ({ children }: { children: React.ReactNode }) => (
    <div className="bg-amber-100 py-8 md:py-12">
        <div className="max-w-4xl mx-auto p-6 sm:p-8 md:p-10 bg-white border-2 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-lg">
            {children}
        </div>
    </div>
  );

  if (isLoading) {
    return (
      <PageContainer>
        <Skeleton className="h-72 md:h-96 w-full mb-8 border-2 border-foreground" />
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-6 w-1/2 mb-8" />
        <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
        </div>
      </PageContainer>
    );
  }

  if (!previewData) {
    return (
        <PageContainer>
            <div className="text-center py-20 font-mono">
                <h2 className="text-2xl font-bold font-serif mb-2">No Preview Data</h2>
                <p className="text-foreground/80">Please generate a preview from the post editor to see it here.</p>
            </div>
        </PageContainer>
    );
  }

  return (
    <PageContainer>
        <article>
            {/* Post Header */}
            <header className="border-b-2 border-foreground pb-6 mb-6">
                {previewData.imageUrl && (
                    <div className="relative h-72 md:h-96 w-full mb-8 border-2 border-foreground rounded-md overflow-hidden">
                        <Image
                            src={previewData.imageUrl}
                            alt={previewData.title}
                            fill
                            className="object-cover"
                        />
                    </div>
                )}
                <h1 className="text-4xl md:text-5xl font-extrabold font-serif tracking-tight mb-4">{previewData.title}</h1>
                <div className="flex items-center gap-4 text-sm font-mono text-foreground/80">
                    <span>Published on {new Date(previewData.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    <span className="text-foreground/50">|</span>
                    <div className="flex flex-wrap gap-2">
                        {previewData.tags.map(tag => (
                            <Badge 
                              key={tag.name} // Use name as key for preview
                              className="bg-amber-200 text-foreground border-2 border-foreground rounded-none font-mono text-xs px-2 py-0.5"
                            >
                              {tag.name}
                            </Badge>
                        ))}
                    </div>
                </div>
            </header>

            {/* Post Content */}
            <div
              className="prose prose-lg lg:prose-xl max-w-none
                         prose-headings:font-serif prose-headings:font-bold prose-headings:text-foreground
                         prose-p:text-foreground/90 prose-p:leading-relaxed
                         prose-a:text-blue-600 prose-a:font-semibold prose-a:underline hover:prose-a:text-blue-800
                         prose-blockquote:font-mono prose-blockquote:border-l-4 prose-blockquote:border-foreground prose-blockquote:bg-amber-50 prose-blockquote:p-4"
              dangerouslySetInnerHTML={{ __html: previewData.content }}
            />
        </article>
    </PageContainer>
  );
}