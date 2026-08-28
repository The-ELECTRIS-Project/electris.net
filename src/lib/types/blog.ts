export type BlogLinkType = 'auto' | 'youtube' | 'spotify' | 'external';

export interface BlogLink {
  url: string;
  label?: string;
  type?: BlogLinkType;
}

export interface BlogInfoCardStyle {
  background?: string;
  borderColor?: string;
  titleColor?: string;
  descriptionColor?: string;
  metaColor?: string;
  metaFont?: string;
  tagFont?: string;
  linkFont?: string;
  tagBackground?: string;
  tagBorderColor?: string;
  tagTextColor?: string;
}

export interface BlogMetadata {
  title: string;
  description: string;
  author: string;
  date: string;
  tags: string[];
  titleFont?: string;
  descriptionFont?: string;
  coverImage?: string;
  coverLight?: string;
  coverDark?: string;
  coverMidnight?: string;
  icon?: string;
  readTime?: number;
  featured?: boolean;
  hidden?: boolean;
  links?: Array<string | BlogLink>;
  infoCardStyle?: BlogInfoCardStyle;

  /** Date this version of the text went live. Absent means the post has never been edited. */
  updated?: string;
  /** Why the edit that produced THIS version was made. The oldest version has none. */
  editMotif?: string;
}

export interface BlogPost extends BlogMetadata {
  slug: string;
}

/** One superseded version on disk, under revisions/<id>/. */
export interface BlogRevisionRef {
  /** Directory name, also the ?v= value. */
  id: string;
  date: string;
  locales: string[];
  metadataLocales: string[];
}

/** A version as the reader sees it, newest first. */
export interface BlogVersion {
  id: string | null;
  date: string;
  isCurrent: boolean;
  locales: string[];
  /** Why this version replaced the one below it in the list. */
  motif?: string;
}

export interface BlogIndexEntry {
  slug: string;
  locales: string[];
  localizedMetadata: Record<string, BlogMetadata>;
  revisions: BlogRevisionRef[];
}
