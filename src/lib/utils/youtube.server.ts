import type { YoutubeVideo, YoutubeChannel, YoutubeData } from '$lib/types/youtube';
import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';
import { isExcludedVideo } from '$lib/utils/youtube';

const CHANNELS_PATH = '/api/youtube/channels.json';
const VIDEO_POLL_INTERVAL = dev ? 15 * 1000 : 2 * 60 * 1000; // 15s in dev, 2m in prod
const UPCOMING_POLL_INTERVAL = dev ? 30 * 1000 : 60 * 60 * 1000; // 30s in dev, 60m in prod
const EMBED_MAX_DIMENSION = 2000;
const LATEST_UPLOAD_BATCH_SIZE = 10;
const LATEST_UPLOAD_LOOKAHEAD_PAGES = 4;
const YOUTUBE_SHORT_MAX_DURATION_SECONDS = 180;

let videoCache: YoutubeData | null = null;
let upcomingCache: YoutubeData | null = null;

let activeVideoFetch: Promise<YoutubeVideo[]> | null = null;
let activeUpcomingFetch: Promise<YoutubeVideo[]> | null = null;
 
export interface YoutubeLoadContext {
  fetch: typeof fetch;
  platform?: App.Platform;
  url: URL;
  ignoreExcluded?: boolean;
}
 
interface AssetsBinding {
  fetch: typeof fetch;
}

interface YoutubeThumbnail {
  url: string;
  width?: number;
  height?: number;
}

interface YoutubePlaylistItem {
  contentDetails: {
    videoId: string;
  };
}

interface YoutubeSearchItem {
  id: {
    videoId: string;
  };
}

interface YoutubeVideoDetailsItem {
  id: string;
  snippet: {
    title: string;
    description: string;
    publishedAt: string;
    liveBroadcastContent: 'none' | 'live' | 'upcoming';
    thumbnails?: Record<string, YoutubeThumbnail>;
  };
  contentDetails?: {
    duration?: string;
  };
  player?: {
    embedWidth?: number | string;
    embedHeight?: number | string;
  };
  liveStreamingDetails?: {
    scheduledStartTime?: string;
    actualStartTime?: string;
  };
}

interface YoutubePlaylistResponse {
  items?: YoutubePlaylistItem[];
  nextPageToken?: string;
}

interface YoutubeSearchResponse {
  items?: YoutubeSearchItem[];
}

interface YoutubeVideoDetailsResponse {
  items?: YoutubeVideoDetailsItem[];
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

function getBestThumbnail(thumbnails: Record<string, YoutubeThumbnail> | undefined): YoutubeThumbnail | null {
  if (!thumbnails) return null;

  return (
    thumbnails.maxres ||
    thumbnails.standard ||
    thumbnails.high ||
    thumbnails.medium ||
    thumbnails.default ||
    null
  );
}

function getEmbedDimensions(video: YoutubeVideoDetailsItem) {
  const width = video.player?.embedWidth;
  const height = video.player?.embedHeight;

  return {
    width: width ? Number(width) : undefined,
    height: height ? Number(height) : undefined
  };
}

function parseYoutubeDurationSeconds(duration: string | undefined) {
  if (!duration) return undefined;

  const match = duration.match(/^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/);
  if (!match) return undefined;

  const [, days = '0', hours = '0', minutes = '0', seconds = '0'] = match;

  return (
    Number(days) * 24 * 60 * 60 +
    Number(hours) * 60 * 60 +
    Number(minutes) * 60 +
    Number(seconds)
  );
}

function isYoutubeShort(video: YoutubeVideoDetailsItem, thumbnail: YoutubeThumbnail | null, durationSeconds: number | undefined) {
  if (!durationSeconds || durationSeconds > YOUTUBE_SHORT_MAX_DURATION_SECONDS) {
    return false;
  }

  const { width, height } = getEmbedDimensions(video);

  if (width && height) {
    return width <= height;
  }

  if (thumbnail?.width && thumbnail.height) {
    return thumbnail.width <= thumbnail.height;
  }

  return /(^|\s)#shorts?\b/i.test(video.snippet.title);
}

function createYoutubeVideo(
  video: YoutubeVideoDetailsItem,
  channel: YoutubeChannel,
  status: YoutubeVideo['status']
): YoutubeVideo | null {
  const thumbnail = getBestThumbnail(video.snippet.thumbnails);

  if (!thumbnail?.url) {
    return null;
  }

  const embedDimensions = getEmbedDimensions(video);
  const durationSeconds = parseYoutubeDurationSeconds(video.contentDetails?.duration);

  return {
    id: video.id,
    title: video.snippet.title,
    description: video.snippet.description,
    publishedAt: video.snippet.publishedAt,
    thumbnail: thumbnail.url,
    embedWidth: embedDimensions.width,
    embedHeight: embedDimensions.height,
    durationSeconds,
    isShort: isYoutubeShort(video, thumbnail, durationSeconds),
    isExcluded: isExcludedVideo({ title: video.snippet.title, status }),
    channelId: channel.channel_id,
    channelName: channel.channel_name,
    status,
    scheduledStartTime: video.liveStreamingDetails?.scheduledStartTime,
    actualStartTime: video.liveStreamingDetails?.actualStartTime
  };
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
      const channelVideos: YoutubeVideo[] = [];
      let pageToken: string | undefined;

      for (let pageIndex = 0; pageIndex < LATEST_UPLOAD_LOOKAHEAD_PAGES; pageIndex += 1) {
        const playlistParams = new URLSearchParams({
          part: 'snippet,contentDetails',
          playlistId: uploadPlaylistId,
          maxResults: String(LATEST_UPLOAD_BATCH_SIZE),
          key: apiKey
        });

        if (pageToken) {
          playlistParams.set('pageToken', pageToken);
        }

        const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?${playlistParams.toString()}`;
        const playlistResponse = await youtubeFetch(playlistUrl);

        if (!playlistResponse.ok) {
          const errorData = await playlistResponse.json().catch(() => ({}));
          console.error(
            `[YouTube] ${playlistResponse.status} for ${channel.channel_name}. Ensure the REFERRER env variable matches an allowed domain in Google Cloud Console.`,
            errorData
          );
          break;
        }

        const playlistData = await playlistResponse.json() as YoutubePlaylistResponse;
        if (!playlistData.items || playlistData.items.length === 0) {
          console.log(`[YouTube] No videos found for ${channel.channel_name}`);
          break;
        }

        const videoIds = playlistData.items.map((item) => item.contentDetails.videoId).join(',');
        const videosUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,liveStreamingDetails,player,contentDetails&id=${videoIds}&maxWidth=${EMBED_MAX_DIMENSION}&maxHeight=${EMBED_MAX_DIMENSION}&key=${apiKey}`;
        const videosResponse = await youtubeFetch(videosUrl);

        if (!videosResponse.ok) {
          break;
        }

        const videosData = await videosResponse.json() as YoutubeVideoDetailsResponse;

        for (const item of videosData.items ?? []) {
          const status = item.snippet.liveBroadcastContent;

          if (
            status !== 'none' &&
            !item.liveStreamingDetails?.actualStartTime &&
            !item.liveStreamingDetails?.scheduledStartTime
          ) {
            continue;
          }

          const video = createYoutubeVideo(
            item,
            channel,
            status === 'none' ? 'finished' : status
          );

          if (video) {
            channelVideos.push(video);
          }
        }

        const foundLatestLongForm = channelVideos.some(
          (video) => video.status === 'finished' && !video.isShort && !video.isExcluded
        );

        if (foundLatestLongForm || !playlistData.nextPageToken) {
          break;
        }

        pageToken = playlistData.nextPageToken;
      }

      allVideos.push(...channelVideos);
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
 
      const searchData = await searchResponse.json() as YoutubeSearchResponse;
      if (!searchData.items || searchData.items.length === 0) continue;
 
      const videoIds = searchData.items.map((item) => item.id.videoId).join(',');
      const videosUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,liveStreamingDetails,player,contentDetails&id=${videoIds}&maxWidth=${EMBED_MAX_DIMENSION}&maxHeight=${EMBED_MAX_DIMENSION}&key=${apiKey}`;
      const videosResponse = await youtubeFetch(videosUrl);
 
      if (!videosResponse.ok) continue;
 
      const videosData = await videosResponse.json() as YoutubeVideoDetailsResponse;

      for (const item of videosData.items ?? []) {
        if (
          item.snippet.liveBroadcastContent !== 'upcoming' ||
          !item.liveStreamingDetails?.scheduledStartTime
        ) continue;

        const video = createYoutubeVideo(item, channel, 'upcoming');

        if (video) {
          allUpcoming.push(video);
        }
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
    if (!activeVideoFetch) {
      activeVideoFetch = fetchLatestVideos(channels)
        .then((videos) => {
          videoCache = { videos, lastUpdated: Date.now() };
          activeVideoFetch = null;
          return videos;
        })
        .catch((error) => {
          activeVideoFetch = null;
          console.error('[YouTube] Video fetch failed:', error);
          return videoCache?.videos ?? [];
        });
    }

    if (!videoCache) {
      await activeVideoFetch;
    }
  }
 
  if (!upcomingCache || now - upcomingCache.lastUpdated > UPCOMING_POLL_INTERVAL) {
    if (!activeUpcomingFetch) {
      activeUpcomingFetch = fetchUpcomingVideos(channels)
        .then((upcoming) => {
          upcomingCache = { videos: upcoming, lastUpdated: Date.now() };
          activeUpcomingFetch = null;
          return upcoming;
        })
        .catch((error) => {
          activeUpcomingFetch = null;
          console.error('[YouTube] Upcoming fetch failed:', error);
          return upcomingCache?.videos ?? [];
        });
    }

    if (!upcomingCache) {
      await activeUpcomingFetch;
    }
  }
 
  const allVideosMap = new Map<string, YoutubeVideo>();
  if (upcomingCache?.videos) upcomingCache.videos.forEach((v) => allVideosMap.set(v.id, v));
  if (videoCache?.videos) videoCache.videos.forEach((v) => allVideosMap.set(v.id, v));
 
  const filteredVideos = Array.from(allVideosMap.values()).filter((v) => {
    if (v.status !== 'finished') return true;
    if (v.isShort) return false;
    if (v.isExcluded && !context.ignoreExcluded) return false;
    return true;
  });

  const sortedVideos = filteredVideos.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
 
  return {
    videos: sortedVideos,
    lastUpdated: Math.max(videoCache?.lastUpdated ?? 0, upcomingCache?.lastUpdated ?? 0)
  };
}
