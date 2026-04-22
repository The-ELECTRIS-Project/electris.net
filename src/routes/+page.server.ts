import { loadBlogPosts } from '$lib/utils/blog.server';
import { getYoutubeData } from '$lib/utils/youtube.server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, platform, url, cookies }) => {
  try {
    const ignoreExcluded = cookies.get('devtools-ignore-excluded-suffixes') === 'true';
    const [posts, youtubeData] = await Promise.all([
      loadBlogPosts({ fetch, platform, url }),
      getYoutubeData({ fetch, platform, url, ignoreExcluded })
    ]);

    return {
      latestPost: posts[0] ?? null,
      youtube: youtubeData
    };
  } catch (error) {
    console.error('Failed to load landing page data:', error);

    return {
      latestPost: null,
      youtube: { videos: [], lastUpdated: 0 }
    };
  }
};