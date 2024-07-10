import { VideoGatewayContext } from "@/context/video-gateway.context";
import { useContext } from "react";

export function useVideoGateway() {
  const context = useContext(VideoGatewayContext);

  if (!context) {
    throw new Error(
      "useVideoGateway must be used within a VideoGatewayProvider"
    );
  }

  return context;
}
