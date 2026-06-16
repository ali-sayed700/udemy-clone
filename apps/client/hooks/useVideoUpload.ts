"use client";

import { useState, useCallback } from "react";
import { uploadVideo } from "@/lib/api/services/upload.service";

export type UploadStatus = "idle" | "uploading" | "success" | "error";

export interface VideoUploadItem {
  id: string;
  file: File;
  progress: number;
  status: UploadStatus;
  url: string | null;
  error: string | null;
  duration: number | null;
  durationLabel: string | null;
  durationError: string | null;
}

function formatDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.round(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  }

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

function readVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const objectUrl = URL.createObjectURL(file);

    const cleanup = () => {
      URL.revokeObjectURL(objectUrl);
      video.removeAttribute("src");
      video.load();
    };

    video.preload = "metadata";
    video.onloadedmetadata = () => {
      const duration = video.duration;
      cleanup();

      if (Number.isFinite(duration) && duration > 0) {
        resolve(duration);
        return;
      }

      reject(new Error("Could not read video duration"));
    };
    video.onerror = () => {
      cleanup();
      reject(new Error("Could not read video duration"));
    };
    video.src = objectUrl;
  });
}

export function useVideoUpload() {
  const [items, setItems] = useState<VideoUploadItem[]>([]);

  const updateItem = useCallback(
    (id: string, patch: Partial<VideoUploadItem>) => {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...patch } : item))
      );
    },
    []
  );

  const addFiles = useCallback((files: FileList | File[]) => {
    const newItems: VideoUploadItem[] = Array.from(files).map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file,
      progress: 0,
      status: "idle" as UploadStatus,
      url: null,
      error: null,
      duration: null,
      durationLabel: null,
      durationError: null,
    }));

    setItems((prev) => [...prev, ...newItems]);

    newItems.forEach((item) => {
      readVideoDuration(item.file)
        .then((duration) => {
          updateItem(item.id, {
            duration,
            durationLabel: formatDuration(duration),
            durationError: null,
          });
        })
        .catch((error) => {
          updateItem(item.id, {
            duration: null,
            durationLabel: null,
            durationError:
              error instanceof Error
                ? error.message
                : "Could not read video duration",
          });
        });
    });
  }, [updateItem]);

  const removeFile = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const uploadSingle = useCallback(
    async (item: VideoUploadItem) => {
      updateItem(item.id, { status: "uploading", progress: 0, error: null });

      try {
        const url = await uploadVideo(item.file, (percent) => {
          updateItem(item.id, { progress: percent });
        });
        updateItem(item.id, { status: "success", progress: 100, url });
        return url;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Upload failed";
        updateItem(item.id, { status: "error", error: message });
        return null;
      }
    },
    [updateItem]
  );

  const uploadAll = useCallback(async () => {
    const pending = items.filter((i) => i.status === "idle" || i.status === "error");
    const results = await Promise.allSettled(
      pending.map((item) => uploadSingle(item))
    );
    return results;
  }, [items, uploadSingle]);

  const reset = useCallback(() => {
    setItems([]);
  }, []);

  const hasIdle = items.some((i) => i.status === "idle" || i.status === "error");
  const allUploaded = items.length > 0 && items.every((i) => i.status === "success");
  const isUploading = items.some((i) => i.status === "uploading");

  return {
    items,
    addFiles,
    removeFile,
    uploadAll,
    uploadSingle,
    reset,
    hasIdle,
    allUploaded,
    isUploading,
  };
}
