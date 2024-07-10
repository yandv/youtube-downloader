"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Video from "@/components/video";
import { useVideoGateway } from "@/hooks/video-gateway.hook";
import { VideoInfo } from "@/types/video-info";
import { FormEvent, useState } from "react";

export default function Home() {
  const { videoGateway } = useVideoGateway();

  const [videoId, setVideoId] = useState<string>("htviVG5rKNU");

  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>();
  const [videoInfoError, setVideoInfoError] = useState<string | null>();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (!videoId) {
      setVideoInfoError("O id do vídeo é obrigatório");
      return;
    }

    let realVideoId = videoId;

    if (
      /(?:https?:\/\/)?(?:www\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([\w\-_]+)\&?/.test(
        videoId
      )
    ) {
      // parse v from url
      const url = new URL(videoId);
      const id = url.searchParams.get("v");

      if (!id) {
        setVideoInfoError("Id do vídeo inválido");
        return;
      }

      realVideoId = id;
    }

    videoGateway
      .getVideoInfo(realVideoId)
      .then((videoInfo) => {
        setVideoInfo(videoInfo);
        setVideoInfoError(null);
      })
      .catch((err) => {
        setVideoInfo(null);
        setVideoInfoError(err.message);
      });

    event.preventDefault();
  };

  const handleVideoIdChange = (event: FormEvent<HTMLInputElement>) => {
    setVideoId(event.currentTarget.value);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <form onSubmit={handleSubmit} className="flex items-center gap-2 mb-4">
        <Input
          type="text"
          placeholder="Enter a YouTube video URL"
          value={videoId}
          onChange={handleVideoIdChange}
          className="flex-1"
        />
        <Button type="submit">Pesquisar vídeo</Button>
      </form>
      {videoInfoError && <h2>{videoInfoError}</h2>}
      {videoInfo && <Video video={videoInfo} />}
    </div>
  );
}
