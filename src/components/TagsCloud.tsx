import { prisma } from '@/lib/prisma';
import TagBubble from './TagBubble'; // Import our new bubble component

/**
 * Fetches all unique tags from the database.
 * For a real "popular" cloud, you might count posts per tag here.
 */
async function getAllTags() {
  const tags = await prisma.tag.findMany({
    orderBy: { name: 'asc' },
    // You could add a post count here in the future:
    // include: { _count: { select: { posts: true } } }
  });
  return tags;
}

/**
 * A server component that fetches tags and arranges them in a bubble cloud.
 */
export default async function TagsCloud() {
  const allTags = await getAllTags();

  if (allTags.length === 0) {
    return null;
  }

  return (
    <section className="mt-16 md:mt-20 text-center">
      <h2 
        className="text-3xl font-bold font-serif text-foreground mb-12"
        style={{ textShadow: '2px 2px 2px rgba(0,0,0,1)' }}
      >
        Explore by Topic
      </h2>
      <div className="flex flex-wrap gap-x-6 gap-y-8 justify-center items-center max-w-4xl mx-auto">
        {allTags.map((tag, index) => {
          // Calculate a variable size for visual interest.
          // This could be based on post count in the future.
          const size = 100 + (tag.name.length % 4) * 15;
          const slug = encodeURIComponent(tag.name);
          
          return (
            <TagBubble
              key={tag.id}
              name={tag.name}
              slug={slug}
              size={size}
              // Stagger the animation start time for a more organic feel
              animationDelay={index * 0.15} 
            />
          );
        })}
      </div>
    </section>
  );
}  