export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  author: string;
  date: string;
  tags: string[];
  coverImage?: string;
  icon?: string;
  readTime?: number;
  featured?: boolean;
}

export interface BlogMetadata {
  title: string;
  description: string;
  author: string;
  date: string;
  tags: string[];
  coverImage?: string;
  icon?: string;
  readTime?: number;
  featured?: boolean;
}

export interface BlogIndexEntry {
  slug: string;
  metadata: BlogMetadata;
}
