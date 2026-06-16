"use client";

import { useEffect, useState, use, useRef } from "react";
import VideoPlayer from "@/components/video-player";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Circle,
  PlayCircle,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Clock,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { ProgressHistory } from "@/components/course/ProgressHistory";
import { useLoadCourseData } from "@/hooks/useLoadCourseData";
import { useVideoProgress } from "@/hooks/useVideoProgress";
import { useLectureNavigation } from "@/hooks/useLectureNavigation";
import {
  getCourseLectures,
  getSortedSections,
  getUnsectionedLectures,
} from "@/lib/course-content";

interface LearnPageProps {
  params: Promise<{ id: string }>;
}

export default function LearnPage({ params }: LearnPageProps) {
  const { id } = use(params);
  const [showCompletionBanner, setShowCompletionBanner] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    new Set(),
  );
  const lectureListRef = useRef<HTMLDivElement>(null);

  // ============== Custom Hooks ==============
  const {
    course,
    progress,
    currentLecture,
    completionPercentage,
    loading,
    setProgress,
    setCurrentLecture,
    handleMarkViewed,
  } = useLoadCourseData(id);

  const { handleMarkCompleted, getLectureProgress } = useVideoProgress({
    courseId: id,
    course,
    progress,
    setProgress,
    setShowCompletionBanner,
    onNextLecture: () => goToNextLecture(),
  });

  const { handleSelectLecture, goToNextLecture } = useLectureNavigation({
    courseId: id,
    course,
    currentLecture,
    setCurrentLecture,
    onLectureSelect: handleMarkViewed,
  });

  const courseLectures = getCourseLectures(course);
  const sortedSections = getSortedSections(course);
  const unsectionedLectures = getUnsectionedLectures(course);

  const toggleSection = (sectionId: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  // ============== Effects ==============

  // Auto-hide completion banner
  useEffect(() => {
    if (showCompletionBanner) {
      const timer = setTimeout(() => {
        setShowCompletionBanner(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showCompletionBanner]);

  // Save current lecture to localStorage and auto-scroll
  useEffect(() => {
    if (currentLecture?._id && id) {
      // Save to localStorage for resume on refresh
      localStorage.setItem(`course-${id}-last-lecture`, currentLecture._id);

      // Auto-scroll current lecture into view
      setTimeout(() => {
        const currentElement = document.getElementById(
          `lecture-${currentLecture._id}`,
        );
        if (currentElement && lectureListRef.current) {
          currentElement.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
          });
        }
      }, 100);
    }
  }, [currentLecture?._id, currentLecture?.title, id]);

  // ============== Render Methods ==============
  function renderCompletionBanner() {
    if (!showCompletionBanner) return null;

    const currentIndex = courseLectures.findIndex(
      (l) => l._id === currentLecture?._id,
    );
    const isLastLecture = currentIndex === courseLectures.length - 1;

    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-linear-to-r from-emerald-500 to-green-600 text-white p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-6 w-6" />
            <div>
              <p className="font-semibold">Lecture Completed! 🎉</p>
              <p className="text-sm opacity-90">
                {isLastLecture
                  ? "🏆 Course completed! Great job!"
                  : "Loading next video..."}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowCompletionBanner(false)}
            className="text-white hover:opacity-80 transition-opacity"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
        <h2 className="text-xl font-bold text-slate-900 mb-4">
          Course Not Found
        </h2>
        <Button asChild>
          <Link href="/course">Browse Courses</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Completion Banner */}
      {renderCompletionBanner()}

      {/* Top Bar */}
      <div
        className={`bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky ${showCompletionBanner ? "top-16" : "top-0"} z-20 transition-all`}
      >
        <div className="flex items-center gap-3">
          <Link
            href={`/course/${id}/course_details`}
            className="text-slate-500 hover:text-slate-700 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-semibold text-slate-900 truncate max-w-md">
            {course.title}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-1.5">
            <BarChart3 className="h-4 w-4 text-indigo-600" />
            <span className="text-sm font-medium text-slate-700">
              {completionPercentage}% Complete
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Video Area */}
        <div className="flex-1 p-4 lg:p-6">
          <div className="bg-black rounded-2xl overflow-hidden mb-6 shadow-lg">
            {currentLecture && (
              <VideoPlayer
                src={currentLecture.videoUrl}
                width="100%"
                height="500px"
                onProgress={(state) => {
                  // Auto-mark as viewed after 5 seconds
                  if (state.playedSeconds >= 5 && currentLecture._id) {
                    const alreadyViewed = getLectureProgress(
                      currentLecture._id,
                    )?.viewed;
                    if (!alreadyViewed) {
                      handleMarkViewed(currentLecture._id);
                    }
                  }
                }}
                onEnded={() => {
                  // Auto-mark as completed when video ends
                  if (currentLecture._id) {
                    const alreadyCompleted = getLectureProgress(
                      currentLecture._id,
                    )?.completed;
                    if (!alreadyCompleted) {
                      handleMarkCompleted(currentLecture._id);
                    }
                  }
                  // Auto-move to next video after 2 seconds
                  setTimeout(() => {
                    goToNextLecture();
                  }, 2000);
                }}
              />
            )}
          </div>

          {/* Current Lecture Info */}
          {currentLecture && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {currentLecture.title}
                  </h2>
                  {currentLecture.duration && (
                    <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {currentLecture.duration}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  {currentLecture._id &&
                    !getLectureProgress(currentLecture._id)?.completed && (
                      <Button
                        onClick={() => handleMarkCompleted(currentLecture._id!)}
                        className="bg-linear-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-xl shadow-md shadow-emerald-200 transition-all duration-300"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Mark Complete
                      </Button>
                    )}
                  {currentLecture._id &&
                    getLectureProgress(currentLecture._id)?.completed && (
                      <div className="flex items-center text-emerald-600 font-medium gap-1.5 px-4 py-2 bg-emerald-50 rounded-xl">
                        <CheckCircle className="h-4 w-4" />
                        Completed
                      </div>
                    )}
                </div>
              </div>

              {/* View date info */}
              {currentLecture._id &&
                getLectureProgress(currentLecture._id)?.viewedDate && (
                  <p className="text-xs text-slate-400 mt-3">
                    Viewed on{" "}
                    {new Date(
                      getLectureProgress(currentLecture._id)!.viewedDate!,
                    ).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}
            </div>
          )}

          {/* Next Video Preview */}
          {(() => {
            const currentIndex =
              courseLectures.findIndex(
                (l) => l._id === currentLecture?._id,
              ) ?? -1;
            const nextLecture =
              currentIndex >= 0 ? courseLectures[currentIndex + 1] : null;

            return nextLecture ? (
              <div className="bg-linear-to-r from-indigo-50 to-blue-50 rounded-2xl border border-indigo-100 p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <PlayCircle className="h-5 w-5 text-indigo-600" />
                  <h3 className="font-semibold text-slate-900">Next Video</h3>
                </div>
                <div className="flex items-center gap-4 justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {currentIndex + 2}. {nextLecture.title}
                    </p>
                    {nextLecture.duration && (
                      <p className="text-xs text-slate-500 mt-1">
                        {nextLecture.duration}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleSelectLecture(nextLecture)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
                  >
                    Watch Now
                  </button>
                </div>
              </div>
            ) : null;
          })()}

          {/* Progress Bar */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-900">Course Progress</h3>
              <span className="text-sm font-bold text-indigo-600">
                {completionPercentage}%
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
              <div
                className="bg-linear-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {progress.filter((p) => p.completed).length} of{" "}
              {courseLectures.length} lectures completed
            </p>
          </div>

          {/* Progress History */}
          <div className="mt-6">
            <ProgressHistory
              progress={progress}
              completionPercentage={completionPercentage}
              course={course}
            />
          </div>
        </div>

        {/* Sidebar: Lecture List */}
        <div className="w-full lg:w-96 border-l border-slate-200 bg-white">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900">Course Content</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {courseLectures.length} lectures
            </p>
          </div>
          <div
            className="overflow-y-auto max-h-[calc(100vh-180px)]"
            ref={lectureListRef}
          >
            {sortedSections.map((section, sectionIndex) => {
              const sectionId = section._id || `section-${sectionIndex}`;
              const isCollapsed = collapsedSections.has(sectionId);

              return (
                <div key={sectionId} className="border-b border-slate-100">
                  <button
                    type="button"
                    onClick={() => toggleSection(sectionId)}
                    className="flex w-full items-center gap-2 bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-800 hover:bg-slate-100"
                  >
                    {isCollapsed ? (
                      <ChevronRight className="h-4 w-4 text-slate-500" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-500" />
                    )}
                    <span className="min-w-0 flex-1 truncate">
                      {section.title}
                    </span>
                    <span className="shrink-0 text-xs font-medium text-slate-500">
                      {section.lectures?.length || 0} lectures
                    </span>
                  </button>

                  {!isCollapsed &&
                    section.lectures?.map((lecture, index) => {
                      const lectureProgress = lecture._id
                        ? getLectureProgress(lecture._id)
                        : null;
                      const isActive = currentLecture?._id === lecture._id;

                      return (
                        <button
                          key={lecture._id || `${sectionId}-${index}`}
                          id={`lecture-${lecture._id}`}
                          onClick={() => handleSelectLecture(lecture)}
                          className={`w-full text-left px-4 py-4 border-b border-slate-50 flex items-start gap-3 transition-all duration-200 hover:bg-slate-50 ${
                            isActive
                              ? "bg-indigo-50 border-l-2 border-l-indigo-500"
                              : ""
                          }`}
                        >
                          <div className="shrink-0 mt-0.5">
                            {lectureProgress?.completed ? (
                              <CheckCircle className="h-5 w-5 text-emerald-500" />
                            ) : lectureProgress?.viewed ? (
                              <PlayCircle className="h-5 w-5 text-indigo-500" />
                            ) : (
                              <Circle className="h-5 w-5 text-slate-300" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p
                              className={`text-sm font-medium truncate ${
                                isActive ? "text-indigo-700" : "text-slate-700"
                              }`}
                            >
                              {index + 1}. {lecture.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              {lecture.duration && (
                                <span className="text-xs text-slate-400">
                                  {lecture.duration}
                                </span>
                              )}
                              {lectureProgress?.viewedDate && (
                                <span className="text-xs text-slate-400">
                                  •{" "}
                                  {new Date(
                                    lectureProgress.viewedDate,
                                  ).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                </div>
              );
            })}

            {unsectionedLectures.length > 0 && (
              <div className="bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Unsectioned
              </div>
            )}

            {unsectionedLectures.map((lecture, index) => {
              const lectureProgress = lecture._id
                ? getLectureProgress(lecture._id)
                : null;
              const isActive = currentLecture?._id === lecture._id;

              return (
                <button
                  key={lecture._id || index}
                  id={`lecture-${lecture._id}`}
                  onClick={() => handleSelectLecture(lecture)}
                  className={`w-full text-left px-4 py-4 border-b border-slate-50 flex items-start gap-3 transition-all duration-200 hover:bg-slate-50 ${
                    isActive
                      ? "bg-indigo-50 border-l-2 border-l-indigo-500"
                      : ""
                  }`}
                >
                  <div className="shrink-0 mt-0.5">
                    {lectureProgress?.completed ? (
                      <CheckCircle className="h-5 w-5 text-emerald-500" />
                    ) : lectureProgress?.viewed ? (
                      <PlayCircle className="h-5 w-5 text-indigo-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-slate-300" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm font-medium truncate ${
                        isActive ? "text-indigo-700" : "text-slate-700"
                      }`}
                    >
                      {index + 1}. {lecture.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {lecture.duration && (
                        <span className="text-xs text-slate-400">
                          {lecture.duration}
                        </span>
                      )}
                      {lectureProgress?.viewedDate && (
                        <span className="text-xs text-slate-400">
                          •{" "}
                          {new Date(
                            lectureProgress.viewedDate,
                          ).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
