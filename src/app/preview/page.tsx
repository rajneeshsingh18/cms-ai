'use client';

import PostDisplay from '@/components/PostDisplay';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';

// Define a type for the preview data
interface PreviewData {
  title: string;
  content: string;
  imageUrl: string | null;
  createdAt: Date;
  tags: { name: string }[];
}

export default function PreviewPage() {
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This effect runs only in the browser
    const storedData = localStorage.getItem('post-preview');
    if (storedData) {
      setPreviewData(JSON.parse(storedData));
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <div className="max-w-3xl mx-auto py-8 px-4"><Skeleton className="h-96 w-full" /></div>;
  }

  if (!previewData) {
    return <div className="text-center py-10">No preview data found. Please generate a preview from the editor.</div>;
  }

  return <PostDisplay post={previewData} />;
}