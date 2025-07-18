'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationControlsProps {
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  basePath: string;
}

export default function PaginationControls({
  currentPage,
  hasNextPage,
  hasPrevPage,
  basePath,
}: PaginationControlsProps) {
  return (
    <div className="flex justify-center items-center gap-4">
      <Button asChild variant="outline" disabled={!hasPrevPage}>
        <Link href={`${basePath}?page=${currentPage - 1}`}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Link>
      </Button>

      <span className="text-sm font-medium">
        Page {currentPage}
      </span>

      <Button asChild variant="outline" disabled={!hasNextPage}>
        <Link href={`${basePath}?page=${currentPage + 1}`}>
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Link>
      </Button>
    </div>
  );
}