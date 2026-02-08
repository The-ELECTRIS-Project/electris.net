import type { BlogPost, BlogMetadata } from '$lib/types/blog';

export async function loadBlogPosts(): Promise<BlogPost[]> {
  const modules = import.meta.glob('/src/routes/blog/thoughts/*.html', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
  const posts: BlogPost[] = [];

  for (const [path, content] of Object.entries(modules)) {
    const filename = path.split('/').pop() || '';
    const slug = filename.replace('.html', '');
    
    if (filename.startsWith('_')) {
      continue;
    }
    
    const metadata = extractMetadata(content);
    
    if (metadata) {
      posts.push({
        slug,
        ...metadata
      });
    }
  }

  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function extractMetadata(content: string): BlogMetadata | null {
  const metaMatch = content.match(/<metadata>([\s\S]*?)<\/metadata>/);
  if (!metaMatch) return null;

  try {
    const metadataText = metaMatch[1];
    const metadata: Partial<BlogMetadata> = {};

    const lines = metadataText.split('\n').filter(line => line.trim());
    for (const line of lines) {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length > 0) {
        const value = valueParts.join(':').trim();
        const cleanKey = key.trim() as keyof BlogMetadata;
        
        if (cleanKey === 'tags') {
          metadata[cleanKey] = value.split(',').map(tag => tag.trim());
        } else if (cleanKey === 'readTime') {
          metadata[cleanKey] = parseInt(value);
        } else if (cleanKey === 'featured') {
          metadata[cleanKey] = value.toLowerCase() === 'true';
        } else {
          (metadata as any)[cleanKey] = value;
        }
      }
    }

    return metadata as BlogMetadata;
  } catch (error) {
    console.error('Error parsing custom block metadata:', error);
    return null;
  }
}

export function filterPosts(posts: BlogPost[], searchQuery: string, selectedTag: string): BlogPost[] {
  return posts.filter(post => {
    const matchesSearch = !searchQuery || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTag = !selectedTag || post.tags.includes(selectedTag);
    
    return matchesSearch && matchesTag;
  });
}

export function getAllTags(posts: BlogPost[]): string[] {
  const tagSet = new Set<string>();
  posts.forEach(post => {
    post.tags.forEach(tag => tagSet.add(tag));
  });
  return Array.from(tagSet).sort();
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function estimateReadTime(content: string): number {
  const text = content.replace(/<[^>]*>/g, '');
  const wordCount = text.split(/\s+/).length;
  return Math.ceil(wordCount / 200);
}