import { loadBlogPosts } from '$lib/utils/blog.server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, platform, url }) => {
  try {
    const posts = await loadBlogPosts({ fetch, platform, url });
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
