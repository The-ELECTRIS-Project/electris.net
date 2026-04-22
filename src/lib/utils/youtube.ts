import type { YoutubeVideo } from '$lib/types/youtube';

export type YoutubeAspect = 'portrait' | 'square' | 'landscape';

export const EXCLUDED_VIDEO_SUFFIXES = ['| LIVE'];

export function isExcludedVideo(video: { title: string; status: string }) {
  if (video.status !== 'finished') return false;
  return EXCLUDED_VIDEO_SUFFIXES.some((suffix) => video.title.endsWith(suffix));
}

export function getYoutubeWatchUrl(videoId: string) {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

export function getYoutubeEmbedUrl(videoId: string) {
  return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1`;
}

function isLikelyShort(video: Pick<YoutubeVideo, 'title'>) {
  return /(^|\s)#shorts?\b/i.test(video.title);
}

export function getYoutubeAspectRatio(video: Pick<YoutubeVideo, 'embedWidth' | 'embedHeight' | 'title'>) {
  if (video.embedWidth && video.embedHeight) {
    return video.embedWidth / video.embedHeight;
  }

  if (isLikelyShort(video)) {
    return 9 / 16;
  }

  return 16 / 9;
}

export function getYoutubeAspect(video: Pick<YoutubeVideo, 'embedWidth' | 'embedHeight' | 'title'>): YoutubeAspect {
  const ratio = getYoutubeAspectRatio(video);

  if (ratio < 0.9) return 'portrait';
  if (ratio < 1.35) return 'square';
  return 'landscape';
}

export function getYoutubeMediaDimensions(video: Pick<YoutubeVideo, 'embedWidth' | 'embedHeight' | 'title'>) {
  if (video.embedWidth && video.embedHeight) {
    return {
      width: video.embedWidth,
      height: video.embedHeight
    };
  }

  if (isLikelyShort(video)) {
    return {
      width: 9,
      height: 16
    };
  }

  return {
    width: 16,
    height: 9
  };
}

export function formatYoutubeDate(dateString: string, locale?: string) {
  return new Intl.DateTimeFormat(locale || undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(dateString));
}

export function formatYoutubeDateTime(dateString: string, locale?: string) {
  return new Intl.DateTimeFormat(locale || undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(new Date(dateString));
}
