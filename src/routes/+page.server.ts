import { loadBlogPosts } from '$lib/utils/blog.server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  try {
    const posts = await loadBlogPosts();

    return {
      latestPost: posts[0] ?? null
    };
  } catch (error) {
    console.error('Failed to load landing page data:', error);

    return {
      latestPost: null
    };
  }
};
