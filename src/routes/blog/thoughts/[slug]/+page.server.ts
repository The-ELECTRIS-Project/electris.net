import { error } from '@sveltejs/kit';
import { getRelatedPosts, loadBlogPost, loadBlogPosts } from '$lib/utils/blog.server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, params, platform, url }) => {
  const { slug } = params;
  const context = { fetch, platform, url };

  try {
    const [postData, allPosts] = await Promise.all([loadBlogPost(slug, context), loadBlogPosts(context)]);

    if (!postData) {
      throw error(404, 'Post not found');
    }

    const relatedPosts = getRelatedPosts(allPosts, postData.post);

    return {
      post: postData.post,
      content: postData.content,
      relatedPosts
    };
  } catch (err) {
    if ((err as any).status === 404) throw err;
    console.error('Error loading post:', err);
    throw error(404, 'Post not found');
  }
};
