import { error } from '@sveltejs/kit';
import { getRelatedPosts, loadBlogPost, loadBlogPosts } from '$lib/utils/blog.server';
import type { PageServerLoad } from './$types';

const SITE_ORIGIN = 'https://electris.net';

export const load: PageServerLoad = async ({ fetch, params, platform, url }) => {
  const { slug } = params;
  const context = { fetch, platform, url };

  try {
    const [postData, allPosts] = await Promise.all([loadBlogPost(slug, context), loadBlogPosts(context)]);

    if (!postData) {
      throw error(404, 'Post not found');
    }

    const relatedPosts = getRelatedPosts(allPosts, postData.post);
    const pageTitle = `${postData.post.title} | ELECTRIS`;
    const canonicalUrl = new URL(url.pathname, SITE_ORIGIN).href;
    const coverImage = postData.post.coverImage
      ? new URL(postData.post.coverImage, SITE_ORIGIN).href
      : undefined;

    return {
      post: postData.post,
      content: postData.content,
      relatedPosts,
      meta: {
        title: pageTitle,
        description: postData.post.description,
        image: coverImage,
        url: canonicalUrl,
        type: 'article'
      }
    };
  } catch (err) {
    if ((err as any).status === 404) throw err;
    console.error('Error loading post:', err);
    throw error(404, 'Post not found');
  }
};
