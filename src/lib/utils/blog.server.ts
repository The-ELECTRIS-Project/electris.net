import fs from 'node:fs';
import path from 'node:path';
import type { BlogPost, BlogMetadata } from '$lib/types/blog';

export async function loadBlogPosts(): Promise<BlogPost[]> {
  const blogDir = path.join(process.cwd(), 'static/data/blog');
  
  if (!fs.existsSync(blogDir)) {
    console.warn(`Blog directory not found at ${blogDir}`);
    return [];
  }

  const entries = fs.readdirSync(blogDir, { withFileTypes: true });
  const posts: BlogPost[] = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const slug = entry.name;
      
      // Skip hidden posts (starting with _)
      if (slug.startsWith('_')) {
        continue;
      }

      const postDir = path.join(blogDir, slug);
      const metadataPath = path.join(postDir, 'metadata.json');

      if (fs.existsSync(metadataPath)) {
        try {
          const metadataRaw = fs.readFileSync(metadataPath, 'utf-8');
          const metadata = JSON.parse(metadataRaw) as BlogMetadata;
          
          posts.push({
            slug,
            ...metadata
          });
        } catch (error) {
          console.error(`Error parsing metadata for post ${slug}:`, error);
        }
      }
    }
  }

  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getRelatedPosts(allPosts: BlogPost[], currentPost: BlogPost, limit = 3): BlogPost[] {
  return allPosts
    .filter(post => 
      post.slug !== currentPost.slug && 
      post.tags.some(tag => currentPost.tags.includes(tag))
    )
    .slice(0, limit);
}
