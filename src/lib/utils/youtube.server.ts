import type { YoutubeVideo, YoutubeChannel, YoutubeData } from '$lib/types/youtube';
import { env } from '$env/dynamic/private';

const CHANNELS_PATH = '/api/youtube/channels.json';
const VIDEO_POLL_INTERVAL = 2 * 60 * 1000; // 2 minutes
const UPCOMING_POLL_INTERVAL = 60 * 60 * 1000; // 60 minutes

let videoCache: YoutubeData | null = null;
let upcomingCache: YoutubeData | null = null;
 
export interface YoutubeLoadContext {
  fetch: typeof fetch;
  platform?: App.Platform;
  url: URL;
}
 
interface AssetsBinding {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
}
 
function hasAssetsBinding(
  platform: App.Platform | undefined
): platform is App.Platform & { env: { ASSETS: AssetsBinding } } {
  return Boolean(platform?.env?.ASSETS && typeof platform.env.ASSETS.fetch === 'function');
}
 
async function fetchYoutubeAsset(assetPath: string, context: YoutubeLoadContext): Promise<Response> {
  const assetUrl = new URL(assetPath, context.url);
 
  if (hasAssetsBinding(context.platform)) {
    return context.platform.env.ASSETS.fetch(assetUrl);
  }
 
  return context.fetch(assetUrl);
}
 
async function youtubeFetch(url: string) {
  const referer = env.REFERRER;
  return fetch(url, {
    headers: {
      ...(referer ? { Referer: referer } : {}),
      Accept: 'application/json'
    }
  });
}
 
async function getChannels(context: YoutubeLoadContext): Promise<Record<string, YoutubeChannel>> {
  const response = await fetchYoutubeAsset(CHANNELS_PATH, context);
 
  if (response.status === 404) {
    console.warn(`Channels file not found at ${CHANNELS_PATH}`);
    return {};
  }
 
  if (!response.ok) {
    console.error(`Could not read channels from ${CHANNELS_PATH}: ${response.status} ${response.statusText}`);
    return {};
  }
 
  return response.json() as Promise<Record<string, YoutubeChannel>>;
}
 
async function fetchLatestVideos(channels: Record<string, YoutubeChannel>): Promise<YoutubeVideo[]> {
  const apiKey = env.YOUTUBE_DATA_API_V3_KEY;
  if (!apiKey) {
    console.error('YOUTUBE_DATA_API_V3_KEY is not set');
    return [];
  }
 
  const allVideos: YoutubeVideo[] = [];
 
  for (const [, channel] of Object.entries(channels)) {
    try {
      console.log(`[YouTube] Fetching latest videos for ${channel.channel_name}...`);
      const uploadPlaylistId = channel.channel_id.replace(/^UC/, 'UU');
 
      const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploadPlaylistId}&maxResults=5&key=${apiKey}`;
      const playlistResponse = await youtubeFetch(playlistUrl);
 
      if (!playlistResponse.ok) {
        const errorData = await playlistResponse.json().catch(() => ({}));
        console.error(
          `[YouTube] ${playlistResponse.status} for ${channel.channel_name}. Ensure the REFERRER env variable matches an allowed domain in Google Cloud Console.`,
          errorData
        );
        continue;
      }
 
      const playlistData = await playlistResponse.json();
      if (!playlistData.items || playlistData.items.length === 0) {
        console.log(`[YouTube] No videos found for ${channel.channel_name}`);
        continue;
      }
 
      const videoIds = playlistData.items.map((item: any) => item.contentDetails.videoId).join(',');
      const videosUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,liveStreamingDetails&id=${videoIds}&key=${apiKey}`;
      const videosResponse = await youtubeFetch(videosUrl);
 
      if (!videosResponse.ok) continue;
 
      const videosData = await videosResponse.json();
 
      for (const item of videosData.items) {
        const status = item.snippet.liveBroadcastContent;
        if (
          status !== 'none' &&
          !item.liveStreamingDetails?.actualStartTime &&
          !item.liveStreamingDetails?.scheduledStartTime
        ) continue;
        allVideos.push({
          id: item.id,
          title: item.snippet.title,
          publishedAt: item.snippet.publishedAt,
          thumbnail:
            item.snippet.thumbnails.maxres?.url ||
            item.snippet.thumbnails.high?.url ||
            item.snippet.thumbnails.default?.url,
          channelId: channel.channel_id,
          channelName: channel.channel_name,
          status: status === 'none' ? 'finished' : (status as 'live' | 'upcoming'),
          scheduledStartTime: item.liveStreamingDetails?.scheduledStartTime,
          actualStartTime: item.liveStreamingDetails?.actualStartTime
        });
      }
    } catch (error) {
      console.error(`[YouTube] Error for ${channel.channel_name}:`, error);
    }
  }
 
  return allVideos;
}
 
async function fetchUpcomingVideos(channels: Record<string, YoutubeChannel>): Promise<YoutubeVideo[]> {
  const apiKey = env.YOUTUBE_DATA_API_V3_KEY;
  if (!apiKey) return [];
 
  const allUpcoming: YoutubeVideo[] = [];
 
  for (const [, channel] of Object.entries(channels)) {
    try {
      console.log(`[YouTube] Searching for upcoming for ${channel.channel_name}...`);
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channel.channel_id}&eventType=upcoming&type=video&maxResults=5&key=${apiKey}`;
      const searchResponse = await youtubeFetch(searchUrl);
 
      if (!searchResponse.ok) continue;
 
      const searchData = await searchResponse.json();
      if (!searchData.items || searchData.items.length === 0) continue;
 
      const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');
      const videosUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,liveStreamingDetails&id=${videoIds}&key=${apiKey}`;
      const videosResponse = await youtubeFetch(videosUrl);
 
      if (!videosResponse.ok) continue;
 
      const videosData = await videosResponse.json();
 
      for (const item of videosData.items) {
        if (
          item.snippet.liveBroadcastContent !== 'upcoming' ||
          !item.liveStreamingDetails?.scheduledStartTime
        ) continue;
        allUpcoming.push({
          id: item.id,
          title: item.snippet.title,
          publishedAt: item.snippet.publishedAt,
          thumbnail:
            item.snippet.thumbnails.maxres?.url ||
            item.snippet.thumbnails.high?.url ||
            item.snippet.thumbnails.default?.url,
          channelId: channel.channel_id,
          channelName: channel.channel_name,
          status: 'upcoming',
          scheduledStartTime: item.liveStreamingDetails?.scheduledStartTime
        });
      }
    } catch (error) {
      console.error(`[YouTube] Error searching upcoming for ${channel.channel_name}:`, error);
    }
  }
 
  return allUpcoming;
}
 
export async function getYoutubeData(context: YoutubeLoadContext): Promise<YoutubeData> {
  const channels = await getChannels(context);
 
  if (Object.keys(channels).length === 0) return { videos: [], lastUpdated: Date.now() };
 
  const now = Date.now();
 
  if (!videoCache || now - videoCache.lastUpdated > VIDEO_POLL_INTERVAL) {
    const videos = await fetchLatestVideos(channels);
    videoCache = { videos, lastUpdated: now };
  }
 
  if (!upcomingCache || now - upcomingCache.lastUpdated > UPCOMING_POLL_INTERVAL) {
    const upcoming = await fetchUpcomingVideos(channels);
    upcomingCache = { videos: upcoming, lastUpdated: now };
  }
 
  const allVideosMap = new Map<string, YoutubeVideo>();
  if (upcomingCache?.videos) upcomingCache.videos.forEach((v) => allVideosMap.set(v.id, v));
  if (videoCache?.videos) videoCache.videos.forEach((v) => allVideosMap.set(v.id, v));
 
  const sortedVideos = Array.from(allVideosMap.values()).sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
 
  return {
    videos: sortedVideos,
    lastUpdated: Math.max(videoCache?.lastUpdated ?? 0, upcomingCache?.lastUpdated ?? 0)
  };
}