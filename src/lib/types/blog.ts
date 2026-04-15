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

export interface BlogPost {
  slug: string;
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
}

export interface BlogIndexEntry {
  slug: string;
  metadata: BlogMetadata;
}
