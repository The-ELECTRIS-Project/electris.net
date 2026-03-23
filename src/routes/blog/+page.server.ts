import { loadBlogPosts } from '$lib/utils/blog.server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  try {
    const posts = await loadBlogPosts();
    return {
      posts
    };
  } catch (error) {
    console.error('Failed to load blog posts:', error);
    return {
      posts: []
    };
  }
};