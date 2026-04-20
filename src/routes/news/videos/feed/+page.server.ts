import { getYoutubeData } from '$lib/utils/youtube.server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, platform, url }) => {
  const youtube = await getYoutubeData({ fetch, platform, url });
  return { youtube };
};