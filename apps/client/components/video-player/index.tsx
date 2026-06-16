"use client";

import dynamic from "next/dynamic";
import type React from "react";

const ReactPlayer = dynamic(() => import("react-player"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-sm text-white/70">
      Loading video...
    </div>
  ),
});

type VideoPlayerProps = {
  width?: string;
  height?: string;
  src: string | undefined;
  onPlay?: () => void;
  onProgress?: (state: {
    played: number;
    playedSeconds: number;
    loaded: number;
    loadedSeconds: number;
    duration: number;
  }) => void;
  onEnded?: () => void;
  controls?: boolean;
  className?: string;
};

const VideoPlayer = ({
  width = "100%",
  height = "100%",
  src,
  onPlay,
  onProgress,
  onEnded,
  controls = true,
  className = "",
}: VideoPlayerProps) => {
  const emitProgress = (
    event:
      | React.SyntheticEvent<HTMLVideoElement>
      | {
          played?: number;
          playedSeconds?: number;
          loaded?: number;
          loadedSeconds?: number;
          duration?: number;
        },
  ) => {
    if (!onProgress) return;

    if ("currentTarget" in event) {
      const video = event.currentTarget;
      const duration = Number.isFinite(video.duration) ? video.duration : 0;
      const playedSeconds = Number.isFinite(video.currentTime)
        ? video.currentTime
        : 0;
      const loadedSeconds =
        video.buffered.length > 0
          ? video.buffered.end(video.buffered.length - 1)
          : 0;

      onProgress({
        played: duration > 0 ? playedSeconds / duration : 0,
        playedSeconds,
        loaded: duration > 0 ? loadedSeconds / duration : 0,
        loadedSeconds,
        duration,
      });
      return;
    }

    onProgress({
      played: event.played || 0,
      playedSeconds: event.playedSeconds || 0,
      loaded: event.loaded || 0,
      loadedSeconds: event.loadedSeconds || 0,
      duration: event.duration || 0,
    });
  };

  return (
    <div
      className={`relative bg-gray-900 rounded-lg overflow-hidden shadow-2xl transition-all duration-300 ease-in-out w-full aspect-video ${className}`}
      style={{
        width: width === "100%" ? undefined : width,
        height: height === "100%" ? undefined : height,
        maxWidth: "100%",
        maxHeight: "80vh",
      }}
    >
      <ReactPlayer
        className="absolute top-0 left-0 w-full h-full"
        width="100%"
        height="100%"
        src={src}
        controls={controls}
        onPlay={onPlay}
        onProgress={emitProgress}
        onTimeUpdate={emitProgress}
        onEnded={onEnded}
      />
    </div>
  );
};

export default VideoPlayer;
