import { error } from '@sveltejs/kit';
import { extractMetadata } from '$lib/utils/blog';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const { slug } = params;
  
  if (slug.startsWith('_')) {
    throw error(404, 'Post not found');
  }
  
  try {
    const modules = import.meta.glob('/src/routes/blog/thoughts/*.html', { 
      query: '?raw',
      import: 'default',
      eager: true 
    }) as Record<string, string>;
    
    const filePath = `/src/routes/blog/thoughts/${slug}.html`;
    const content = modules[filePath];
    
    if (!content) {
      throw error(404, 'Post not found');
    }
    
    const metadata = extractMetadata(content);
    
    if (!metadata) {
      throw error(404, 'Post not found or invalid metadata');
    }
    
    const cleanContent = content.replace(/<metadata>[\s\S]*?<\/metadata>/g, '');
    
    return {
      post: {
        slug,
        ...metadata
      },
      content: cleanContent
    };
  } catch (err) {
    console.error('Error loading post:', err);
    throw error(404, 'Post not found');
  }
};