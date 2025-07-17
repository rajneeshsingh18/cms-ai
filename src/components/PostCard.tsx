"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type Post, type Tag } from '@prisma/client';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useRef, useState } from 'react';

type PostCardProps = Post & {
  tags: Tag[];
};

const springValues = {
  damping: 30,
  stiffness: 100,
  mass: 2,
};

export default function PostCard({ post }: { post: PostCardProps }) {
  const excerpt = post.content.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...';
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useMotionValue(0), springValues);
  const rotateY = useSpring(useMotionValue(0), springValues);
  const scale = useSpring(1, springValues);
  const [lastY, setLastY] = useState(0);

  function handleMouse(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;

    const rotationX = (offsetY / (rect.height / 2)) * -8;
    const rotationY = (offsetX / (rect.width / 2)) * 8;

    rotateX.set(rotationX);
    rotateY.set(rotationY);
    x.set(e.clientX - rect.left);
    y.set(e.clientY - rect.top);
    setLastY(offsetY);
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
    <Link href={`/blog/${post.slug}`} className="block group">
      <motion.div
        ref={ref}
        className="h-full [perspective:800px]"
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
          <Card className="h-full overflow-hidden bg-amber-50 border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            {post.imageUrl ? (
              <div className="relative h-52 w-full border-b-2 border-foreground">
                <Image
                  src={post.imageUrl}
                  alt={post.title}
                  fill
                  className="object-cover grayscale group-hover:grayscale-0 transition-all"
                  style={{ filter: 'sepia(0.3)' }}
                />
              </div>
            ) : (
              <div className="h-52 w-full bg-amber-100 border-b-2 border-foreground flex items-center justify-center">
                <span className="text-4xl">📰</span>
              </div>
            )}
            <CardHeader className="bg-amber-50 p-4">
              <CardTitle className="text-xl font-bold font-serif tracking-wide">
                {post.title}
              </CardTitle>
              <div className="flex flex-wrap gap-2 pt-2">
                {post.tags.map(tag => (
                  <Badge 
                    key={tag.id} 
                    className="bg-amber-200 text-foreground border border-foreground rounded-none font-mono text-xs px-2 py-0.5"
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </CardHeader>
            <CardContent className="bg-white p-4 border-t-2 border-foreground">
              <p className="text-sm text-foreground font-mono leading-relaxed">
                {excerpt}
              </p>
              <div className="mt-3 text-right">
                <span className="inline-block bg-foreground text-amber-50 px-2 py-1 text-xs font-bold">
                  READ MORE →
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </Link>
  );
}