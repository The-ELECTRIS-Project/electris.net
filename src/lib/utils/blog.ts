import type { BlogInfoCardStyle, BlogLink, BlogLinkType, BlogPost } from '$lib/types/blog';

export interface ResolvedBlogLink {
  url: string;
  label?: string;
  type: Exclude<BlogLinkType, 'auto'>;
  youtubeEmbedUrl?: string;
  youtubeEmbedAspectRatio?: string;
  spotifyEmbedUrl?: string;
}

const YOUTUBE_VIDEO_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;
const SPOTIFY_RESOURCE_TYPES = new Set(['track', 'album', 'playlist', 'episode', 'show', 'artist']);

const stripWww = (hostname: string): string => hostname.toLowerCase().replace(/^www\./, '');

const sanitizeCssValue = (value: string): string => value.replace(/[;\n\r]/g, '').trim();

const normalizeLinkInput = (link: string | BlogLink | undefined): BlogLink | undefined => {
  if (!link) return undefined;
  if (typeof link === 'string') {
    return { url: link };
  }
  return link;
};

const normalizeBlogLinks = (post: BlogPost): BlogLink[] => {
  const normalized: BlogLink[] = [];

  if (Array.isArray(post.links)) {
    for (const linkEntry of post.links) {
      const normalizedEntry = normalizeLinkInput(linkEntry);
      if (normalizedEntry) {
        normalized.push(normalizedEntry);
      }
    }
  }

  const dedupedByKey = new Map<string, BlogLink>();

  for (const entry of normalized) {
    const normalizedUrl = entry.url.trim();
    if (!normalizedUrl) continue;

    const dedupeKey = `${entry.type ?? 'auto'}|${normalizedUrl}`;
    const normalizedEntry: BlogLink = {
      ...entry,
      url: normalizedUrl
    };

    const existing = dedupedByKey.get(dedupeKey);
    if (!existing) {
      dedupedByKey.set(dedupeKey, normalizedEntry);
      continue;
    }

    if (!existing.label && normalizedEntry.label) {
      dedupedByKey.set(dedupeKey, {
        ...existing,
        label: normalizedEntry.label
      });
    }
  }

  return Array.from(dedupedByKey.values());
};

const parseRawLink = (rawUrl: string): URL | null => {
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  const spotifyUriMatch = trimmed.match(/^spotify:(track|album|playlist|episode|show|artist):([a-zA-Z0-9]+)$/i);
  if (spotifyUriMatch) {
    const [, kind, id] = spotifyUriMatch;
    return new URL(`https://open.spotify.com/${kind.toLowerCase()}/${id}`);
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed;
    }
    return null;
  } catch {
    if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed)) {
      return null;
    }

    try {
      const parsed = new URL(`https://${trimmed}`);
      return parsed;
    } catch {
      return null;
    }
  }
};

const extractYoutubeVideoId = (linkUrl: URL): string | undefined => {
  const hostname = stripWww(linkUrl.hostname);

  if (hostname === 'youtu.be') {
    const id = linkUrl.pathname.split('/').filter(Boolean)[0];
    if (id && YOUTUBE_VIDEO_ID_PATTERN.test(id)) return id;
    return undefined;
  }

  if (hostname === 'youtube.com' || hostname.endsWith('.youtube.com')) {
    const pathSegments = linkUrl.pathname.split('/').filter(Boolean);
    if (!pathSegments.length) return undefined;

    if (pathSegments[0] === 'watch') {
      const id = linkUrl.searchParams.get('v');
      if (id && YOUTUBE_VIDEO_ID_PATTERN.test(id)) return id;
      return undefined;
    }

    if (['shorts', 'embed', 'live', 'v'].includes(pathSegments[0])) {
      const id = pathSegments[1];
      if (id && YOUTUBE_VIDEO_ID_PATTERN.test(id)) return id;
      return undefined;
    }
  }

  return undefined;
};

const getYoutubeEmbedUrl = (linkUrl: URL): string | undefined => {
  const videoId = extractYoutubeVideoId(linkUrl);
  if (!videoId) return undefined;
  return `https://www.youtube.com/embed/${videoId}`;
};

const getYoutubeEmbedAspectRatio = (linkUrl: URL): string => {
  const hostname = stripWww(linkUrl.hostname);
  if (hostname === 'youtube.com' || hostname.endsWith('.youtube.com')) {
    const pathSegments = linkUrl.pathname.split('/').filter(Boolean);
    if (pathSegments[0] === 'shorts') {
      return '9 / 16';
    }
  }

  return '16 / 9';
};

const getSpotifyEmbedUrl = (linkUrl: URL): string | undefined => {
  const hostname = stripWww(linkUrl.hostname);
  if (hostname !== 'open.spotify.com') return undefined;

  const pathSegments = linkUrl.pathname.split('/').filter(Boolean);
  if (pathSegments.length < 2) return undefined;

  let resourceType = pathSegments[0];
  let resourceId = pathSegments[1];

  if (resourceType.startsWith('intl-') && pathSegments.length >= 3) {
    resourceType = pathSegments[1];
    resourceId = pathSegments[2];
  }

  if (!SPOTIFY_RESOURCE_TYPES.has(resourceType) || !resourceId) return undefined;
  return `https://open.spotify.com/embed/${resourceType}/${resourceId}`;
};

const infoCardStyleToCssVarMap: Record<keyof BlogInfoCardStyle, string> = {
  background: '--post-info-bg',
  borderColor: '--post-info-border',
  titleColor: '--post-info-title',
  descriptionColor: '--post-info-description',
  metaColor: '--post-info-meta',
  metaFont: '--post-info-meta-font',
  tagFont: '--post-info-tag-font',
  linkFont: '--post-info-link-font',
  tagBackground: '--post-info-tag-bg',
  tagBorderColor: '--post-info-tag-border',
  tagTextColor: '--post-info-tag-text'
};

export function resolvePostTypographyStyle(post: Pick<BlogPost, 'titleFont' | 'descriptionFont'>): string | undefined {
  const declarations: string[] = [];

  if (typeof post.titleFont === 'string') {
    const titleFont = sanitizeCssValue(post.titleFont);
    if (titleFont) {
      declarations.push(`--post-title-font: ${titleFont}`);
    }
  }

  if (typeof post.descriptionFont === 'string') {
    const descriptionFont = sanitizeCssValue(post.descriptionFont);
    if (descriptionFont) {
      declarations.push(`--post-description-font: ${descriptionFont}`);
    }
  }

  return declarations.length ? declarations.join('; ') : undefined;
}

const resolveNormalizedBlogLink = (link: BlogLink): ResolvedBlogLink | null => {
  if (!link?.url) return null;

  const parsedUrl = parseRawLink(link.url);
  if (!parsedUrl) return null;

  const youtubeEmbedUrl = getYoutubeEmbedUrl(parsedUrl);
  const spotifyEmbedUrl = getSpotifyEmbedUrl(parsedUrl);
  const forcedType = link.type && link.type !== 'auto' ? link.type : null;

  let type: Exclude<BlogLinkType, 'auto'> = 'external';

  if (forcedType === 'youtube' && youtubeEmbedUrl) {
    type = 'youtube';
  } else if (forcedType === 'spotify' && spotifyEmbedUrl) {
    type = 'spotify';
  } else if (forcedType === 'external') {
    type = 'external';
  } else if (!forcedType) {
    if (youtubeEmbedUrl) {
      type = 'youtube';
    } else if (spotifyEmbedUrl) {
      type = 'spotify';
    }
  }

  const explicitLabel = link.label?.trim();

  return {
    url: parsedUrl.toString(),
    label: explicitLabel && explicitLabel.length ? explicitLabel : undefined,
    type,
    youtubeEmbedUrl: type === 'youtube' ? youtubeEmbedUrl : undefined,
    youtubeEmbedAspectRatio: type === 'youtube' ? getYoutubeEmbedAspectRatio(parsedUrl) : undefined,
    spotifyEmbedUrl: type === 'spotify' ? spotifyEmbedUrl : undefined
  };
};

export function resolveBlogLinks(post: BlogPost): ResolvedBlogLink[] {
  return normalizeBlogLinks(post)
    .map(resolveNormalizedBlogLink)
    .filter((resolvedLink): resolvedLink is ResolvedBlogLink => Boolean(resolvedLink));
}

export function resolveInfoCardStyle(infoCardStyle?: BlogInfoCardStyle): string | undefined {
  if (!infoCardStyle) return undefined;

  const declarations: string[] = [];

  for (const [styleKey, cssVariable] of Object.entries(infoCardStyleToCssVarMap) as [keyof BlogInfoCardStyle, string][]) {
    const rawValue = infoCardStyle[styleKey];
    if (typeof rawValue !== 'string') continue;

    const value = sanitizeCssValue(rawValue);
    if (!value) continue;

    declarations.push(`${cssVariable}: ${value}`);
  }

  return declarations.length ? declarations.join('; ') : undefined;
}

export function resolveCover(post: BlogPost, resolvedColorScheme: 'light' | 'dark' | 'midnight'): string | undefined {
  if (resolvedColorScheme === 'midnight' && post.coverMidnight) return post.coverMidnight;
  if ((resolvedColorScheme === 'dark' || resolvedColorScheme === 'midnight') && post.coverDark) return post.coverDark;
  if (resolvedColorScheme === 'light' && post.coverLight) return post.coverLight;
  return post.coverImage;
}

export function filterPosts(posts: BlogPost[], searchQuery: string, selectedTag: string): BlogPost[] {
  return posts.filter(post => {
    const matchesSearch = !searchQuery || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTag = !selectedTag || post.tags.includes(selectedTag);
    
    return matchesSearch && matchesTag;
  });
}

export function getAllTags(posts: BlogPost[]): string[] {
  const tagSet = new Set<string>();
  posts.forEach(post => {
    post.tags.forEach(tag => tagSet.add(tag));
  });
  return Array.from(tagSet).sort();
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function estimateReadTime(content: string): number {
  const text = content.replace(/<[^>]*>/g, '');
  const wordCount = text.split(/\s+/).length;
  return Math.ceil(wordCount / 200);
}
