import fs from "fs";
import path from "path";
import matter from "gray-matter";

const contentDir = path.join(process.cwd(), "content");

export type Post = {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  image: string;
  content: string;
};

export function getAllPosts(): Post[] {
  const files = fs.readdirSync(contentDir);
  const posts = files
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const raw = fs.readFileSync(path.join(contentDir, f), "utf-8");
      const { data, content } = matter(raw);
      return {
        slug: data.slug,
        title: data.title,
        description: data.description,
        date: data.date,
        tags: data.tags ?? [],
        image: data.image,
        content,
      } as Post;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return posts;
}

export function getPost(slug: string): Post | null {
  const filePath = path.join(contentDir, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  return {
    slug: data.slug,
    title: data.title,
    description: data.description,
    date: data.date,
    tags: data.tags ?? [],
    image: data.image,
    content,
  } as Post;
}
