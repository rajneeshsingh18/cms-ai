import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            About This Blog
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            A little bit about the author and the purpose of this site.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="md:w-1/3 flex-shrink-0">
            {/* You can replace this with a real image of yourself in the /public folder */}
            <div className="relative h-48 w-48 mx-auto rounded-full overflow-hidden border">
              <Image
                src="/placeholder-avatar.jpg" // Add a placeholder image to your /public folder
                alt="Author's photo"
                fill
                className="object-cover"
              />
            </div>
          </div>
          <div className="md:w-2/3">
            <div className="prose dark:prose-invert max-w-none">
              <h2>Hello, I'm [Your Name]!</h2>
              <p>
                Welcome to my blog! I started this site as a project to explore the power of AI in content creation, using the latest tools like Next.js, Prisma, and Google's Gemini API. 
              </p>
              <p>
                Here, I write about technology, web development, and the fascinating intersection of artificial intelligence and creativity. My goal is to share what I'm learning and provide helpful insights for fellow developers and tech enthusiasts.
              </p>
              <p>
                This entire CMS, from the rich text editor to the AI content generator, was built from the ground up. It's a testament to what's possible with modern web technologies. Thanks for stopping by!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}