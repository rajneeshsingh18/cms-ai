"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

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
      <Button
        asChild
        disabled={!hasPrevPage}
        className="decoration-black border-2 border-foreground rounded-md shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all disabled:opacity-50 disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
      >
        <Link href={`${basePath}?page=${currentPage - 1}`}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Link>
      </Button>

      <span className="font-mono text-sm">
        Page {currentPage}
      </span>

      <Button
        asChild
        disabled={!hasNextPage}
        className=" decoration-black border-2 border-foreground rounded-md shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all disabled:opacity-50 disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
      >
        <Link href={`${basePath}?page=${currentPage + 1}`}>
          Next
          <ArrowRight className="h-4 w-4 ml-2" />
        </Link>
      </Button>
    </div>
  );
}