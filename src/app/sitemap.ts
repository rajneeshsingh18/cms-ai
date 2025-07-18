import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Use the environment variable for your website's public URL, with a fallback for local development.
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  // 1. Get all published posts
  const posts = await prisma.post.findMany({
    where: { published: true },
    select: { 
      slug: true,
      updatedAt: true 
    },
  });

  // 2. Get all tags that are actually used by published posts
  const tags = await prisma.tag.findMany({
    where: {
      posts: {
        some: { published: true }
      }
    },
    select: { name: true },
  });

  // 3. Create sitemap entries for your static pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/tags`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    // Add other static pages like '/about' here if you create them
  ];

  // 4. Create sitemap entries for each blog post
  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // 5. Create sitemap entries for each public tag page
  const tagRoutes: MetadataRoute.Sitemap = tags.map((tag) => ({
    url: `${baseUrl}/tags/${encodeURIComponent(tag.name)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  // 6. Combine all routes into a single sitemap
  return [...staticRoutes, ...postRoutes, ...tagRoutes];
}