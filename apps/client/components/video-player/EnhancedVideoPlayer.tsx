/**
 * Enhanced Video Player with Course Progress Tracking
 * Handles auto-marking as viewed/completed and navigation to next video
 */

import { useEffect, useRef, useState } from "react";
import { ChevronRight } from "lucide-react";
import VideoPlayer from "@/components/video-player";
import { Button } from "@/components/ui/button";
import type { Lecture } from "@/types/course.types";
import type { CourseProgress } from "@/types/enrollment.types";

interface EnhancedVideoPlayerProps {
  lecture: Lecture;
  progress?: CourseProgress;
  onViewed?: (lectureId: string) => Promise<void>;
  onCompleted?: (lectureId: string) => Promise<void>;
  onNextVideo?: () => void;
  nextLecture?: Lecture | null;
  autoMarkViewedDelay?: number; // milliseconds before marking as viewed
  autoMarkCompletedDelay?: number; // milliseconds before marking as completed (from end)
}

export function EnhancedVideoPlayer({
  lecture,
  progress,
  onViewed,
  onCompleted,
  onNextVideo,
  nextLecture,
  autoMarkViewedDelay = 5000, // 5 seconds
  autoMarkCompletedDelay = 3000, // 3 seconds from end
}: EnhancedVideoPlayerProps) {
  const [hasViewed, setHasViewed] = useState(!!progress?.viewed);
  const [hasCompleted, setHasCompleted] = useState(!!progress?.completed);
  const viewedTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const completedTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Mark as viewed after viewing for N seconds
  const handleVideoPlay = () => {
    if (hasViewed) return;

    // Debounce: wait N seconds before marking
    if (viewedTimeoutRef.current) clearTimeout(viewedTimeoutRef.current);

    viewedTimeoutRef.current = setTimeout(async () => {
      if (!hasViewed && onViewed && lecture._id) {
        await onViewed(lecture._id);
        setHasViewed(true);
      }
    }, autoMarkViewedDelay);
  };

  // Mark as completed when video gets near the end
  const handleVideoProgress = (state: {
    played: number;
    playedSeconds: number;
    loaded: number;
    loadedSeconds: number;
    duration: number;
  }) => {
    if (hasCompleted) return;

    const duration = state.duration;
    if (!duration) return;

    const secondsFromEnd = duration - state.playedSeconds;

    // If within N seconds of the end, mark as completed
    if (secondsFromEnd <= autoMarkCompletedDelay / 1000) {
      if (completedTimeoutRef.current)
        clearTimeout(completedTimeoutRef.current);

      completedTimeoutRef.current = setTimeout(async () => {
        if (!hasCompleted && onCompleted && lecture._id) {
          await onCompleted(lecture._id);
          setHasCompleted(true);
        }
      }, autoMarkCompletedDelay);
    }
  };

  const handleVideoEnd = async () => {
    // Mark as completed immediately on video end
    if (!hasCompleted && onCompleted && lecture._id) {
      await onCompleted(lecture._id);
      setHasCompleted(true);
    }

    // Auto-navigate to next video after 2 seconds
    if (nextLecture && onNextVideo) {
      setTimeout(() => {
        onNextVideo();
      }, 2000);
    }
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (viewedTimeoutRef.current) clearTimeout(viewedTimeoutRef.current);
      if (completedTimeoutRef.current)
        clearTimeout(completedTimeoutRef.current);
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Video Player */}
      <div className="relative bg-black rounded-lg overflow-hidden">
        <VideoPlayer
          src={lecture.videoUrl}
          width="100%"
          height="500px"
          onPlay={handleVideoPlay}
          onProgress={handleVideoProgress}
          onEnded={handleVideoEnd}
        />

        {/* Completion Badge */}
        {hasCompleted && (
          <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
            ✓ Completed
          </div>
        )}

        {/* Viewed Badge */}
        {hasViewed && !hasCompleted && (
          <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            Viewing...
          </div>
        )}
      </div>

      {/* Lecture Info & Next Video CTA */}
      <div className="bg-white rounded-lg p-4 space-y-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            {lecture.title}
          </h2>
          {lecture.duration && typeof lecture.duration === "number" && (
            <p className="text-sm text-slate-500">
              Duration: {Math.round(lecture.duration / 60)} minutes
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {!hasViewed && (
            <Button
              onClick={handleVideoPlay}
              size="sm"
              variant="outline"
              className="flex-1"
            >
              Mark as Viewed
            </Button>
          )}

          {!hasCompleted && (
            <Button
              onClick={() =>
                onCompleted && lecture._id && onCompleted(lecture._id)
              }
              size="sm"
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              Mark Complete
            </Button>
          )}
        </div>

        {/* Next Video Suggestion */}
        {hasCompleted && nextLecture && (
          <div className="mt-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
            <p className="text-sm font-medium text-indigo-900 mb-2">
              Next: {nextLecture.title}
            </p>
            <Button
              onClick={onNextVideo}
              size="sm"
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              Continue to Next Video
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default EnhancedVideoPlayer;
