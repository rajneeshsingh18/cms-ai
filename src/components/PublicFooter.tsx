export default function Footer() {
  return (
    <footer className="bg-amber-50 border-t-2 border-foreground">
      <div className="container mx-auto flex h-16 items-center justify-center px-4">
        <p className="text-sm text-foreground/80 font-mono">
          &copy; {new Date().getFullYear()} My AI Blog. All rights reserved.
        </p>
      </div>
    </footer>
  );
}