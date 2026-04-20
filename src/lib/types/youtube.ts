export interface YoutubeVideo {
  id: string;
  title: string;
  publishedAt: string;
  thumbnail: string;
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
