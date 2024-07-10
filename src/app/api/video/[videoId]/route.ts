import { Params } from "@/types/api-params";
import { VideoInfo } from "@/types/video-info";
import { NextRequest, NextResponse } from "next/server";
import ytdl from "ytdl-core";

export async function GET(
  request: NextRequest,
  { params }: Params<{ videoId: string }>
) {
  const { videoId } = params;

  return new Promise((resolve) => {
    ytdl
      .getBasicInfo(videoId)
      .then((info) => {
        const { videoDetails } = info;
        const { author } = videoDetails;

        console.log(author);

        const videoInfo: VideoInfo = {
          id: videoId,
          author: {
            authorId: author.id,
            authorName: author.name,
            channelUrl: author.channel_url,
            userUrl: author.user_url,
            verified: author.verified,
            subscriptionCount: author.subscriber_count ?? 0,
            logoUrl: author.thumbnails?.find((t) => t.url)?.url || "",
          },
          videoDetails: {
            title: videoDetails.title,
            description: videoDetails.description,
            thumbnail: videoDetails.thumbnails[0].url,
            published: new Date(videoDetails.publishDate),
            viewCount: Number(videoDetails.viewCount),
            videoSize: Number(videoDetails.lengthSeconds),
          },
          videoQualities: info.formats
            .filter((format) => format.mimeType?.includes("video"))
            .map((format) => ({
              id: format.itag,
              label: format.height + "p " + format.fps + "fps",
              bitrate: format.bitrate,
              url: format.url,
              type: "video",
              hasAudio:
                !!format.hasAudio ||
                !!format.audioQuality ||
                !!format.audioSampleRate,
              hasVideo: true,
            }))
            .sort((a, b) => b.bitrate! - a.bitrate!)
            .filter(
              (v, idx, arr) =>
                arr.findIndex(
                  (t) => t.label === v.label && t.hasAudio == v.hasAudio
                ) === idx
            ),
          audioQualities: info.formats
            .filter((format) => format.mimeType?.includes("audio"))
            .map((format) => ({
              id: format.itag,
              label: format.audioSampleRate || "Audio",
              bitrate: parseInt(format.audioSampleRate || "0"),
              type: "audio",
              url: format.url,
              hasAudio: true,
              hasVideo: false,
            }))
            .filter(
              (v, idx, arr) => arr.findIndex((t) => t.label === v.label) === idx
            ),
        };

        resolve(NextResponse.json(videoInfo));
      })
      .catch((err) => {
        resolve(
          NextResponse.json(
            {
              error: err.message,
            },
            { status: 404 }
          )
        );
      });
  });
}
