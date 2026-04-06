import { error } from '@sveltejs/kit';
import { getRelatedPosts, loadBlogPost, loadBlogPosts } from '$lib/utils/blog.server';
import type { PageServerLoad } from './$types';

const SITE_ORIGIN = 'https://electris.net';

const getEmbedCoverPath = (coverImage?: string): string | undefined => {
  if (!coverImage) return undefined;
  const lastSlash = coverImage.lastIndexOf('/');
  if (lastSlash === -1) return coverImage;
  return `${coverImage.slice(0, lastSlash + 1)}cover-embed.jpg`;
};

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
    const embedCoverPath = getEmbedCoverPath(postData.post.coverImage);
    const coverImage = embedCoverPath
      ? new URL(embedCoverPath, SITE_ORIGIN).href
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
