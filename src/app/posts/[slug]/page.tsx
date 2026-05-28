import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getAllPosts, getPost } from "@/lib/posts";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { ArrowLeft } from "lucide-react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

const components: Components = {
  code({ className, children, ...props }) {
    const isInline = !className;
    if (isInline) {
      return (
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
          {children}
        </code>
      );
    }
    return (
      <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono my-4 border">
        <code className={className} {...props}>
          {children}
        </code>
      </pre>
    );
  },
  table({ children }) {
    return (
      <div className="overflow-x-auto my-4 border rounded-lg">
        <table className="w-full text-sm">{children}</table>
      </div>
    );
  },
  th({ children }) {
    return <th className="text-left p-3 bg-muted font-medium">{children}</th>;
  },
  td({ children }) {
    return <td className="p-3 border-t">{children}</td>;
  },
  a({ href, children }) {
    return (
      <a href={href} className="text-primary underline underline-offset-4 hover:text-primary/80" target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  },
};

export default async function PostPage(props: PageProps<"/posts/[slug]">) {
  const { slug } = await props.params;
  const post = getPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="max-w-3xl mx-auto px-6 py-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to writeups
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-10">
        <article>
          <header className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-3">
              {post.title}
            </h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <time>{post.date}</time>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-6">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="relative aspect-[2/1] rounded-lg overflow-hidden bg-muted">
              <Image
                src={post.image}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          </header>

          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <Markdown remarkPlugins={[remarkGfm]} components={components}>
              {post.content}
            </Markdown>
          </div>
        </article>
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">
          &larr; Back to all writeups
        </Link>
      </footer>
    </div>
  );
}
