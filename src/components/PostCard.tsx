"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { type Post, type Tag } from '@prisma/client';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useRef } from 'react';

// Define the type for the post props
type PostWithTags = Post & {
  tags: Tag[];
};

// Animation settings remain the same
const springValues = {
  damping: 30,
  stiffness: 100,
  mass: 1.5,
};

export default function PostCard({ post }: { post: PostWithTags }) {
  const excerpt = post.content.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...';
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useMotionValue(0), springValues);
  const rotateY = useSpring(useMotionValue(0), springValues);
  const scale = useSpring(1, springValues);

  function handleMouse(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;
    const rotationX = (offsetY / (rect.height / 2)) * -10;
    const rotationY = (offsetX / (rect.width / 2)) * 10;
    rotateX.set(rotationX);
    rotateY.set(rotationY);
    x.set(e.clientX - rect.left);
    y.set(e.clientY - rect.top);
  }

  function handleMouseEnter() {
    scale.set(1.05);
  }

  function handleMouseLeave() {
    scale.set(1);
    rotateX.set(0);
    rotateY.set(0);
  }

  return (
    <Link href={`/blog/${post.slug}`} className="block group h-full">
      <motion.div
        ref={ref}
        className="h-full [perspective:900px]"
        onMouseMove={handleMouse}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <motion.div
          className="h-full [transform-style:preserve-3d]"
          style={{
            rotateX,
            rotateY,
            scale,
          }}
        >
          {/* --- The Merged Retro-Glass Card --- */}
          <Card 
            className="h-full flex flex-col overflow-hidden rounded-2xl 
                       border-2 border-white/30 
                       bg-white/20 backdrop-blur-lg 
                       shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] 
                       transition-shadow duration-300 group-hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,0.5)]"
          >
            {/* Image Section - The solid part of the card */}
            {post.imageUrl ? (
              <div className="relative h-52 w-full border-b-2 border-white/30">
                <Image
                  src={post.imageUrl}
                  alt={post.title}
                  fill
                  className="object-cover group-hover: transition-all duration-300 rounded-t-xl"
                />
              </div>
            ) : (
              <div className="h-52 w-full bg-amber-100/80 border-b-2 border-white/30 flex items-center justify-center rounded-t-xl">
                <span className="text-4xl" role="img" aria-label="Article icon">📰</span>
              </div>
            )}
            
            {/* --- Transparent Content Area --- */}
            <div className="p-4 flex flex-col flex-grow">
                {/* Title and Tags */}
                <CardHeader className="p-0">
                  <CardTitle className="text-xl font-bold font-serif tracking-wide text-foreground">
                    {post.title}
                  </CardTitle>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {post.tags.map(tag => (
                      <Badge 
                        key={tag.id} 
                        className="bg-amber-100 text-foreground border border-foreground rounded-none font-mono text-xs px-2 py-0.5"
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>

                {/* Excerpt */}
                <CardContent className="p-0 pt-4 flex-grow">
                  <p className="text-sm text-foreground/90 font-mono leading-relaxed">
                    {excerpt}
                  </p>
                </CardContent>

                {/* Read More Footer */}
                <CardFooter className="p-0 pt-4 mt-auto">
                  <span className="inline-block bg-foreground text-amber-50 px-3 py-1 text-xs font-bold w-full text-center group-hover:bg-primary transition-colors duration-300 rounded-sm">
                    READ MORE →
                  </span>
                </CardFooter>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </Link>
  );
}