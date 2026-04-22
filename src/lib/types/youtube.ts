export interface YoutubeVideo {
  id: string;
  title: string;
  description?: string;
  publishedAt: string;
  thumbnail: string;
  embedWidth?: number;
  embedHeight?: number;
  durationSeconds?: number;
  isShort?: boolean;
  isExcluded?: boolean;
  channelId: string;
  channelName: string;
  status: 'live' | 'upcoming' | 'finished';
  scheduledStartTime?: string;
  actualStartTime?: string;
}

export interface YoutubeChannel {
  channel_name: string;
  channel_id: string;
}

export interface YoutubeData {
  videos: YoutubeVideo[];
  lastUpdated: number;
}
