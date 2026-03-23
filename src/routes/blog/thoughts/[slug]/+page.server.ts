import { error } from '@sveltejs/kit';
import fs from 'node:fs';
import path from 'node:path';
import { loadBlogPosts, getRelatedPosts } from '$lib/utils/blog.server';
import type { PageServerLoad } from './$types';
import type { BlogMetadata } from '$lib/types/blog';

export const load: PageServerLoad = async ({ params }) => {
  const { slug } = params;
  
  if (slug.startsWith('_')) {
    throw error(404, 'Post not found');
  }
  
  try {
    const blogDir = path.join(process.cwd(), 'static/data/blog');
    const postDir = path.join(blogDir, slug);
    const metadataPath = path.join(postDir, 'metadata.json');
    const contentPath = path.join(postDir, 'post.html');
    
    if (!fs.existsSync(metadataPath) || !fs.existsSync(contentPath)) {
      throw error(404, 'Post not found');
    }
    
    const metadataRaw = fs.readFileSync(metadataPath, 'utf-8');
    const metadata = JSON.parse(metadataRaw) as BlogMetadata;
    const content = fs.readFileSync(contentPath, 'utf-8');
    
    const allPosts = await loadBlogPosts();
    const currentPost = { slug, ...metadata };
    const relatedPosts = getRelatedPosts(allPosts, currentPost);
    
    return {
      post: currentPost,
      content,
      relatedPosts
    };
  } catch (err) {
    if ((err as any).status === 404) throw err;
    console.error('Error loading post:', err);
    throw error(404, 'Post not found');
  }
};