import { error } from '@sveltejs/kit';
import { getRelatedPosts, loadBlogPost, loadBlogPosts } from '$lib/utils/blog.server';
import type { PageServerLoad } from './$types';

const isErrorWithStatus = (value: unknown): value is { status: number } => {
  return typeof value === 'object' &&
    value !== null &&
    'status' in value &&
    typeof (value as { status?: unknown }).status === 'number';
};

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
    const origin = url.origin;
    const canonicalUrl = new URL(url.pathname, origin).href;
    const embedCoverPath = getEmbedCoverPath(postData.post.coverImage);

    let coverImage: string | undefined;
    if (embedCoverPath) {
      const embedUrl = new URL(embedCoverPath, origin).href;
      try {
        const embedResponse = await fetch(embedUrl, {
          headers: { Range: 'bytes=0-0' }
        });
        if (embedResponse.ok || embedResponse.status === 206) {
          coverImage = embedUrl;
        }
      } catch (err) {
        console.warn('Failed to probe embed cover image:', err);
      }
    }

    if (!coverImage && postData.post.coverImage) {
      coverImage = new URL(postData.post.coverImage, origin).href;
    }

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
  } catch (err: unknown) {
    if (isErrorWithStatus(err) && err.status === 404) throw err;
    console.error('Error loading post:', err);
    throw error(404, 'Post not found');
  }
};
