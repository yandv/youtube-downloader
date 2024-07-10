import { VideoInfo } from "@/types/video-info";
import { HttpClient } from "@/adapter/http/request-adapter";

export class VideoGateway {
  constructor(private readonly httpClient: HttpClient) {}

  async getVideoInfo(videoId: string): Promise<VideoInfo> {
    return new Promise((resolve, reject) => {
      this.httpClient
        .request<VideoInfo>({
          url: "api/video/" + videoId,
        })
        .then(({ data }) => resolve(data))
        .catch((error) => {
          reject(error);
        });
    });
  }
}
