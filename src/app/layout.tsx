"use client";

import { VideoGatewayProvider } from "@/context/video-gateway.context";
import { httpClientFactory } from "@/adapter/http/request-adapter";
import { Inter } from "next/font/google";

import { cn } from "@/lib/utils";
import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const httpClient = httpClientFactory();

  return (
    <html lang="en">
      <VideoGatewayProvider httpClient={httpClient}>
        <body
          className={cn(
            "min-h-screen bg-background font-sans antialiased",
            inter.variable
          )}
        >
          {children}
        </body>
      </VideoGatewayProvider>
    </html>
  );
}
