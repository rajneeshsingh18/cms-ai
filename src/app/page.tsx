import { prisma } from '@/lib/prisma';
import PostCard from '@/components/PostCard';

/**
 * Fetches all published posts from the database, including their tags.
 */
async function getPublishedPosts() {
  return await prisma.post.findMany({
    where: { published: true },
    include: { tags: true },
    orderBy: { createdAt: 'desc' },
  });
}

export default async function HomePage() {
  const posts = await getPublishedPosts();

  return (
    <main className="container mx-auto px-4 py-12 md:py-16">
      <header className="text-center mb-16 md:mb-20">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-foreground">
          Welcome to My Blog
        </h1>
        <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Thoughts, stories, and ideas from the tech world—explored and shared.
        </p>
      </header>

      {posts.length > 0 ? (
        <section className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard 
              key={post.id} 
              post={post} 
              
            />
          ))}
        </section>
      ) : (
        <section className="text-center py-16 space-y-4 bg-muted/50 rounded-xl border border-border">
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
            No posts yet
          </h2>
          <p className="mt-2 text-muted-foreground max-w-md mx-auto">
            Come back soon—we're cooking up something interesting.
          </p>
        </section>
      )}
    </main>
  );
}