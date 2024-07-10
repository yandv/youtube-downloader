export interface VideoInfo {
  id: string;
  author: {
    authorId: string;
    authorName: string;
    channelUrl: string;
    userUrl?: string;
    verified: boolean;
    subscriptionCount: number;
    logoUrl: string;
  };
  videoDetails: {
    title: string;
    description: string | null;
    thumbnail: string;
    published: Date;
    viewCount: number;
    videoSize: number;
  };
  videoQualities: Quality[];
  audioQualities: Quality[];
}

interface Quality {
  id: number;
  bitrate?: number;
  label: string;

  url: string;
  type: string;

  hasAudio: boolean;
  hasVideo: boolean;
}
