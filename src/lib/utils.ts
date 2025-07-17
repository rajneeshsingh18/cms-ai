import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/[\s]+/g, '-')   // Replace spaces with -
    .replace(/--+/g, '-')     // Replace multiple - with single
    .trim()
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
