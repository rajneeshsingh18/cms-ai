'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

// Define the props the component will accept
interface TagBubbleProps {
  name: string;
  slug: string;
  size: number; // Size will determine the bubble's diameter
  animationDelay: number; // To stagger the animations
}

/**
 * A client component that renders a single animated, interactive tag bubble.
 */
export default function TagBubble({ name, slug, size, animationDelay }: TagBubbleProps) {
  return (
    <motion.div
      // Animate the bubble floating up and down
      animate={{ y: [-3, 3, -3] }}
      transition={{
        duration: 2.5,
        ease: "easeInOut",
        repeat: Infinity,
        delay: animationDelay, // Stagger the start of each bubble's animation
      }}
    >
      <Link href={`/tags/${slug}`} passHref>
        <motion.div
          className="rounded-full flex items-center justify-center text-center p-2 cursor-pointer
                     bg-white/80 backdrop-blur-sm 
                     border-2 border-foreground 
                     hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                     transition-shadow duration-200"
          style={{
            width: `${size}px`,
            height: `${size}px`,
          }}
          // Animate the bubble scaling up on hover
          whileHover={{ scale: 1.15 }}
          transition={{ type: 'spring', stiffness: 300, damping: 10 }}
        >
          <span className="font-mono font-semibold text-sm text-foreground select-none">
            {name}
          </span>
        </motion.div>
      </Link>
    </motion.div>
  );
}