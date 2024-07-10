"use client";

import { HttpClient } from "@/adapter/http/request-adapter";
import { VideoGateway } from "@/gateway/video.gateway";
import { createContext, useContext } from "react";

interface VideoGatewayContextProps {
  videoGateway: VideoGateway;
}

export const VideoGatewayContext = createContext<VideoGatewayContextProps>({
  videoGateway: null as any,
});

interface VideoGatewayProviderProps {
  children: React.ReactNode;
  httpClient: HttpClient;
}

export function VideoGatewayProvider({
  children,
  httpClient,
}: Readonly<VideoGatewayProviderProps>) {
  const videoGateway = new VideoGateway(httpClient);

  return (
    <VideoGatewayContext.Provider value={{ videoGateway }}>
      {children}
    </VideoGatewayContext.Provider>
  );
}
