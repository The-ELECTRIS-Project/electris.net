import { loadBlogPosts } from '$lib/utils/blog.server';
import { getYoutubeData } from '$lib/utils/youtube.server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, platform, url, cookies, request }) => {
  const locale = cookies.get('preferred-locale') || request.headers.get('accept-language')?.split(',')[0] || 'en-GB';

  try {
    const posts = await loadBlogPosts({ fetch, platform, url, locale });
    const youtubeDataPromise = getYoutubeData({ fetch, platform, url });

    return {
      latestPost: posts[0] ?? null,
      streamed: {
        youtube: youtubeDataPromise
      }
    };
  } catch (error) {
    console.error('Failed to load landing page data:', error);

    return {
      latestPost: null,
      streamed: {
        youtube: Promise.resolve({ videos: [], lastUpdated: 0 })
      }
    };
  }
};
