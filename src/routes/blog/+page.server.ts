import { loadBlogPosts } from '$lib/utils/blog.server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, platform, url, cookies, request }) => {
  const locale = cookies.get('preferred-locale') || request.headers.get('accept-language')?.split(',')[0] || 'en-GB';

  try {
    const posts = await loadBlogPosts({ fetch, platform, url, locale });
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
