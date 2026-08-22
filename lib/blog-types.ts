export type PostFrontmatter = {
  title: string;
  description: string;
  date: string;
  tags?: string[];
  published: boolean;
  translationOf?: string;
  cover?: string;
};

export type Post = {
  slug: string;
  locale: string;
  frontmatter: PostFrontmatter;
  content: string;
  html: string;
  readingTime: number;
};