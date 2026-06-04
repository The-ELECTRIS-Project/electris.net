import type { BlogIndexEntry, BlogPost } from '$lib/types/blog';

const BLOG_INDEX_PATH = '/data/blog/index.json';

export interface BlogLoadContext {
  fetch: typeof fetch;
  platform?: App.Platform;
  url: URL;
  locale?: string;
}

interface AssetsBinding {
  fetch: typeof fetch;
}

function hasAssetsBinding(
  platform: App.Platform | undefined
): platform is App.Platform & { env: { ASSETS: AssetsBinding } } {
  return Boolean(platform?.env?.ASSETS && typeof platform.env.ASSETS.fetch === 'function');
}

async function fetchBlogAsset(assetPath: string, context: BlogLoadContext): Promise<Response> {
  const assetUrl = new URL(assetPath, context.url);

  if (hasAssetsBinding(context.platform)) {
    return context.platform.env.ASSETS.fetch(assetUrl);
  }

  return context.fetch(assetUrl);
}

function sortPosts(posts: BlogPost[]): BlogPost[] {
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

const FALLBACK_LOCALES = ['en_GB', 'en_US'];

function getBestLocale(availableLocales: string[], requestedLocale?: string): string {
  if (requestedLocale) {
    const safeRequested = requestedLocale.replace('-', '_');
    if (availableLocales.includes(safeRequested)) {
      return safeRequested;
    }
  }

  for (const fallback of FALLBACK_LOCALES) {
    if (availableLocales.includes(fallback)) {
      return fallback;
    }
  }

  return availableLocales[0];
}

export async function loadBlogPosts(context: BlogLoadContext): Promise<BlogPost[]> {
  const response = await fetchBlogAsset(BLOG_INDEX_PATH, context);

  if (response.status === 404) {
    console.warn(`Blog index not found at ${BLOG_INDEX_PATH}`);
    return [];
  }

  if (!response.ok) {
    throw new Error(`Failed to load blog index: ${response.status} ${response.statusText}`);
  }

  const entries = (await response.json()) as BlogIndexEntry[];

  return sortPosts(
    entries
      .filter((entry) => !entry.slug.startsWith('_'))
      .map((entry) => {
        const bestLocale = getBestLocale(entry.locales, context.locale);
        const metadata = entry.localizedMetadata[bestLocale];
        
        return {
          slug: entry.slug,
          ...metadata
        };
      })
  );
}

export async function loadBlogPost(
  slug: string,
  context: BlogLoadContext
): Promise<{ post: BlogPost; content: string; locale: string; locales: string[] } | null> {
  if (slug.startsWith('_')) {
    return null;
  }

  const indexResponse = await fetchBlogAsset(BLOG_INDEX_PATH, context);
  if (!indexResponse.ok) {
    return null;
  }

  const entries = (await indexResponse.json()) as BlogIndexEntry[];
  const entry = entries.find((e) => e.slug === slug);

  if (!entry) {
    return null;
  }

  const bestLocale = getBestLocale(entry.locales, context.locale);
  const metadata = entry.localizedMetadata[bestLocale];

  const contentResponse = await fetchBlogAsset(`/data/blog/${slug}/+post.${bestLocale}.html`, context);

  if (!contentResponse.ok) {
    // If for some reason the file in index.json is missing on disk
    return null;
  }

  const content = await contentResponse.text();

  return {
    post: {
      slug,
      ...metadata
    },
    content,
    locale: bestLocale,
    locales: entry.locales
  };
}
