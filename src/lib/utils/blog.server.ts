import type { BlogIndexEntry, BlogMetadata, BlogPost } from '$lib/types/blog';

const BLOG_INDEX_PATH = '/data/blog/index.json';

export interface BlogLoadContext {
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
      .map(({ slug, metadata }) => ({
        slug,
        ...metadata
      }))
  );
}

export async function loadBlogPost(
  slug: string,
  context: BlogLoadContext
): Promise<{ post: BlogPost; content: string } | null> {
  if (slug.startsWith('_')) {
    return null;
  }

  const [metadataResponse, contentResponse] = await Promise.all([
    fetchBlogAsset(`/data/blog/${slug}/metadata.json`, context),
    fetchBlogAsset(`/data/blog/${slug}/post.html`, context)
  ]);

  if (metadataResponse.status === 404 || contentResponse.status === 404) {
    return null;
  }

  if (!metadataResponse.ok || !contentResponse.ok) {
    throw new Error(`Failed to load blog post "${slug}"`);
  }

  const metadata = (await metadataResponse.json()) as BlogMetadata;
  const content = await contentResponse.text();

  return {
    post: {
      slug,
      ...metadata
    },
    content
  };
}

export function getRelatedPosts(allPosts: BlogPost[], currentPost: BlogPost, limit = 3): BlogPost[] {
  return allPosts
    .filter(post => 
      post.slug !== currentPost.slug && 
      post.tags.some(tag => currentPost.tags.includes(tag))
    )
    .slice(0, limit);
}
