/**
 * v0 by Vercel.
 * @see https://v0.dev/t/2ZbFnaA3G9U
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import { Button } from "@/components/ui/button";

import { VideoInfo } from "@/types/video-info";
import { useState } from "react";
import { Progress } from "./ui/progress";

interface VideoProps {
  video: VideoInfo;
}

interface DownloadProgress {
  qualityId: number;
  currentProgress: number;
  totalProgress: number;
  downloadSpeed: number;
}

interface ProgressBarProps {
  progress: DownloadProgress;
}

export default function Video({ video }: VideoProps) {
  const [progress, setProgress] = useState<DownloadProgress[]>();

  async function handleDownload(videoId: string, qualityId: number) {
    if (progress?.find((p) => p.qualityId === qualityId)) {
      alert(
        "O download deve vídeo na qualidade " +
          qualityId +
          " já está em andamento"
      );
      return;
    }

    setProgress((prev) => [
      ...(prev || []),
      {
        qualityId,
        currentProgress: 0,
        totalProgress: 100,
        downloadSpeed: 0,
      },
    ]);

    const response = await fetch(
      `/api/video/${videoId}/download?id=${qualityId}`
    );
    const total = parseInt(response.headers.get("content-length") || "0", 10);

    setProgress((prev) =>
      prev?.map((p) =>
        p.qualityId === qualityId
          ? {
              ...p,
              totalProgress: total,
            }
          : p
      )
    );

    if (!response.ok) {
      alert("Erro ao baixar o vídeo");
      setProgress((prev) => prev?.filter((p) => p.qualityId !== qualityId));
      return;
    }

    const fileName = response.headers
      .get("content-disposition")
      ?.split("=")[1]!;

    const reader = new Response(
      new ReadableStream({
        async start(controller) {
          const reader = response.body?.getReader();
          if (!reader) return;

          let receivedLength = 0;

          const buffer = []; // Store the size of chunks received
          let bufferSize = 0; // Total size of chunks in the buffer
          const bufferInterval = 5000; // 5 seconds
          const chunkTimes = []; // Store the timestamps of chunks received

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            if (!value) continue;

            receivedLength += value.length;
            const chunkSize = value.length;
            const now = Date.now();

            // Add chunk size and timestamp to the buffer
            buffer.push(chunkSize);
            chunkTimes.push(now);
            bufferSize += chunkSize;

            // Remove chunks from buffer that are older than 5 seconds
            while (
              chunkTimes.length > 0 &&
              now - chunkTimes[0] > bufferInterval
            ) {
              bufferSize -= buffer.shift()!;
              chunkTimes.shift();
            }

            const downloadSpeed = bufferSize / (bufferInterval / 1000); // Bytes per second

            setProgress((prev) =>
              prev?.map((p) =>
                p.qualityId === qualityId
                  ? {
                      ...p,
                      currentProgress: receivedLength,
                      downloadSpeed: downloadSpeed,
                    }
                  : p
              )
            );

            controller.enqueue(value);
          }

          controller.close();
        },
      })
    );

    const url = URL.createObjectURL(await reader.blob());
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    setProgress((prev) => prev?.filter((p) => p.qualityId !== qualityId));
  }

  return (
    <>
      <div className="max-w-4xl w-full px-4 md:px-6">
        <div className="aspect-video rounded-xl overflow-hidden">
          <iframe
            width="560"
            height="315"
            src={"https://www.youtube.com/embed/" + video.id + "?enablejsapi=1"}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="w-full h-full object-cover"
          ></iframe>
        </div>
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <img
              src={video.author.logoUrl}
              width={40}
              height={40}
              alt="Channel Avatar"
              className="rounded-full"
            />
            <div>
              <h2 className="text-lg font-semibold">
                {video.author.authorName}
              </h2>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {video.author.subscriptionCount} inscritos
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {video.videoDetails.viewCount} visualizações
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          {video.audioQualities.length && (
            <div className="bg-white rounded-lg shadow-md p-4 dark:bg-gray-800">
              <h3 className="text-lg font-semibold mb-2">Download Audio</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleDownload(video.id, video.audioQualities[0].id)
                  }
                >
                  MP3
                </Button>
              </div>
            </div>
          )}
          <div className="bg-white rounded-lg shadow-md p-4 dark:bg-gray-800">
            <h3 className="text-lg font-semibold mb-2">Download Video</h3>
            <div className="grid grid-cols-2 gap-2">
              {video.videoQualities.map((quality) => (
                <>
                  <Button
                    key={quality.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(video.id, quality.id)}
                  >
                    {quality.label} {quality.hasAudio ? " (Audio)" : ""}
                  </Button>
                  {progress?.find((p) => p.qualityId === quality.id) && (
                    <Progress
                      value={
                        (progress.find((p) => p.qualityId === quality.id)!
                          .currentProgress /
                          progress.find((p) => p.qualityId === quality.id)!
                            .totalProgress) *
                        100
                      }
                    />
                  )}
                </>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
