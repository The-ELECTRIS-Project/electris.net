import type { BlogIndexEntry, BlogMetadata, BlogPost, BlogVersion } from '$lib/types/blog';

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

const REVISION_ID = /^\d{4}-\d{2}-\d{2}(T\d{2}-\d{2})?$/;

export interface LoadedBlogPost {
  post: BlogPost;
  content: string;
  locale: string;
  locales: string[];
  /** Newest first. The motif on a version explains why it replaced the one after it. */
  versions: BlogVersion[];
  /** null when reading the live version. */
  currentRevision: string | null;
  isHistorical: boolean;
}

/*
 * Versions run oldest to newest as: revisions (by directory date) then the live files.
 * An edit's motif is stored with the version that edit produced, so in a newest-first list the
 * motif sits between the two versions it connects.
 */
function buildVersions(entry: BlogIndexEntry, current: BlogMetadata): BlogVersion[] {
  const older = [...entry.revisions]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((revision) => ({
      id: revision.id,
      date: revision.date,
      isCurrent: false,
      locales: revision.locales
    }));

  return [
    ...older,
    {
      id: null,
      date: current.updated ?? current.date,
      isCurrent: true,
      locales: entry.locales
    }
  ].reverse();
}

async function loadRevisionMetadata(
  slug: string,
  revisionId: string,
  locale: string,
  context: BlogLoadContext
): Promise<BlogMetadata | null> {
  const response = await fetchBlogAsset(
    `/data/blog/${slug}/revisions/${revisionId}/+metadata.${locale}.json`,
    context
  );

  return response.ok ? ((await response.json()) as BlogMetadata) : null;
}

export async function loadBlogPost(
  slug: string,
  context: BlogLoadContext,
  revisionId?: string
): Promise<LoadedBlogPost | null> {
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

  // Two independent gates, because revisionId arrives from a query string: the shape check stops
  // path traversal, the membership check stops enumerating anything that is not a real revision.
  const revision =
    revisionId && REVISION_ID.test(revisionId)
      ? entry.revisions.find((candidate) => candidate.id === revisionId)
      : undefined;

  if (revisionId && !revision) {
    return null;
  }

  const currentMetadata = entry.localizedMetadata[getBestLocale(entry.locales, context.locale)];

  // A revision resolves within its OWN locale set: we cannot invent a translation of text that was
  // never translated at the time.
  const bestLocale = getBestLocale(revision ? revision.locales : entry.locales, context.locale);

  const contentPath = revision
    ? `/data/blog/${slug}/revisions/${revision.id}/+post.${bestLocale}.html`
    : `/data/blog/${slug}/+post.${bestLocale}.html`;

  const contentResponse = await fetchBlogAsset(contentPath, context);

  if (!contentResponse.ok) {
    // If for some reason the file in index.json is missing on disk
    return null;
  }

  let metadata = entry.localizedMetadata[bestLocale] ?? currentMetadata;

  if (revision && revision.metadataLocales.includes(bestLocale)) {
    metadata = (await loadRevisionMetadata(slug, revision.id, bestLocale, context)) ?? metadata;
  }

  const versions = buildVersions(entry, currentMetadata);

  // Attach each version's motif from the metadata of the version that edit produced.
  await Promise.all(
    versions.map(async (version) => {
      if (version.isCurrent) {
        version.motif = currentMetadata?.editMotif;
        return;
      }

      const ref = entry.revisions.find((candidate) => candidate.id === version.id);
      if (!ref) return;

      const locale = getBestLocale(ref.metadataLocales, context.locale);
      if (!locale || !ref.metadataLocales.includes(locale)) return;

      const revisionMetadata = await loadRevisionMetadata(slug, ref.id, locale, context);
      version.motif = revisionMetadata?.editMotif;
    })
  );

  return {
    post: {
      slug,
      ...metadata
    },
    content: await contentResponse.text(),
    locale: bestLocale,
    locales: revision ? revision.locales : entry.locales,
    versions,
    currentRevision: revision ? revision.id : null,
    isHistorical: Boolean(revision)
  };
}
