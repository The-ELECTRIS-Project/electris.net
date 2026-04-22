import { getYoutubeData } from '$lib/utils/youtube.server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, platform, url, cookies }) => {
  const ignoreExcluded = cookies.get('devtools-ignore-excluded-suffixes') === 'true';
  const youtube = await getYoutubeData({ fetch, platform, url, ignoreExcluded });
  return { youtube };
};