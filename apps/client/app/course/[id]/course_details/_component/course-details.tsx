"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-toastify";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CardSkeleton } from "@/components/ui/skeleton";
import FavoriteButton from "@/components/course/FavoriteButton";

// Icons
import {
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Globe,
  PlayCircle,
  Lock,
  Users,
  CreditCard,
  ShoppingCart,
} from "lucide-react";

// Custom Hooks
import { useCourseDetails } from "@/hooks/useCourseDetails";
import { useCoursePayment } from "@/hooks/useCoursePayment";
import { useCourseCart } from "@/hooks/useCourseCart";
import {
  getCourseLectures,
  getFreePreviewLectures,
  getSortedSections,
  getUnsectionedLectures,
} from "@/lib/course-content";

const VideoPlayer = dynamic(() => import("@/components/video-player"), {
  ssr: false,
  loading: () => (
    <div className="flex aspect-video items-center justify-center rounded-lg bg-slate-900 text-sm text-white/70">
      Loading video...
    </div>
  ),
});

const PayPalCheckoutButtons = dynamic(
  () => import("@/components/payment/PayPalCheckoutButtons"),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-lg border p-4 text-sm text-muted-foreground">
        Loading PayPal...
      </div>
    ),
  },
);

const CourseDetails = ({ id }: { id: string }) => {
  // ════════════════════════════════════════════════════════════════════════
  // STATE: Dialog Controls
  // ════════════════════════════════════════════════════════════════════════
  const [displayCurrentVideoFreePreview, setDisplayCurrentVideoFreePreview] =
    useState<string | null>(null);
  const [showFreePreviewDialog, setShowFreePreviewDialog] = useState(false);
  const [showPaymentMethodDialog, setShowPaymentMethodDialog] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    new Set(),
  );

  // ════════════════════════════════════════════════════════════════════════
  // CUSTOM HOOKS: Core Data & Operations
  // ════════════════════════════════════════════════════════════════════════
  const { course, isLoading, isError, isEnrolled, userId, cartItems } =
    useCourseDetails(id);

  const {
    paymentMethod,
    setPaymentMethod,
    isProcessingBuyNow,
    handleStripeCheckout: executeStripeCheckout,
    createPayPalOrder,
    capturePayPalOrder,
  } = useCoursePayment();

  const { isProcessing, handleAddToCart: executeAddToCart } = useCourseCart();

  // ════════════════════════════════════════════════════════════════════════
  // EVENT HANDLERS
  // ════════════════════════════════════════════════════════════════════════

  const handleAddToCart = () => {
    if (course && userId) {
      executeAddToCart(course, userId);
    }
  };

  const handleSetFreePreview = (info: { videoUrl?: string }) => {
    setDisplayCurrentVideoFreePreview(info?.videoUrl || null);
    setShowFreePreviewDialog(true);
  };

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

  // ── Stripe Checkout ──
  const handleStripeCheckout = () => {
    if (course && userId) {
      executeStripeCheckout(course, userId);
      setShowPaymentMethodDialog(false);
    }
  };

  // ── PayPal Handlers ──
  const handleCreatePayPalOrder = async (): Promise<string> => {
    if (course && userId) {
      return await createPayPalOrder(course, userId);
    }
    throw new Error("Course or user ID missing");
  };

  const handleCapturePayPalOrder = async (orderId: string) => {
    if (course && userId) {
      await capturePayPalOrder(orderId, course, userId);
      setShowPaymentMethodDialog(false);
    }
  };

  // ════════════════════════════════════════════════════════════════════════
  // RENDER LOGIC
  // ════════════════════════════════════════════════════════════════════════

  // Loading state
  if (isLoading) {
    return (
      <div className="mx-auto p-4">
        <div className="bg-linear-to-r from-gray-900 via-indigo-950 to-gray-900 rounded-t-lg p-8">
          <CardSkeleton showImage={false} lines={3} className="mb-8" />
        </div>
        <div className="flex flex-col md:flex-row gap-8 mt-8">
          <main className="grow space-y-4">
            <CardSkeleton lines={4} />
            <CardSkeleton lines={4} />
            <CardSkeleton lines={4} />
          </main>
          <aside className="w-full md:w-[500px]">
            <CardSkeleton showImage={true} lines={3} />
          </aside>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Course Not Found
        </h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          Something went wrong loading this course. Please try refreshing the
          page or go back.
        </p>
        <div className="flex gap-4">
          <Button
            className="bg-indigo-600 hover:bg-indigo-700"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </Button>
          <Button asChild variant="outline">
            <Link href="/course">Browse Courses</Link>
          </Button>
        </div>
      </div>
    );
  }

  const studentCount = course?.studentCount ?? course?.students?.length ?? 0;
  const courseLectures = getCourseLectures(course);
  const sortedSections = getSortedSections(course);
  const unsectionedLectures = getUnsectionedLectures(course);
  const freePreviewLectures = getFreePreviewLectures(course);
  const previewLecture =
    freePreviewLectures.find((lecture) => lecture.videoUrl) ??
    courseLectures.find((lecture) => lecture.videoUrl);

  return (
    <div className="mx-auto p-4 mt-5">
      {/* Hero Header */}
      <div className="bg-linear-to-r from-gray-900 via-indigo-950 to-gray-900 text-white p-4 md:p-8 rounded-t-lg relative overflow-hidden">
        <div className="absolute inset-0 opacity-40"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-start gap-4">
            <h1 className="text-xl md:text-3xl font-bold mb-2 md:mb-4">
              {course?.title}
            </h1>
            <div className="shrink-0">
              {id && <FavoriteButton courseId={id} />}
            </div>
          </div>
          <p className="text-base md:text-xl mb-4 text-gray-300">
            {course?.description}
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm ">
            <span>Created By {course?.instructor?.userName}</span>
            <span>Created On {course?.createdAt?.split("T")[0]}</span>
            <span className="flex items-center">
              <Globe className="mr-1 h-4 w-4" />
              {course?.primaryLanguage}
            </span>
            <span className="flex items-center bg-indigo-500/20 px-3 py-1 rounded-full">
              <Users className="mr-1 h-4 w-4 text-indigo-300" />
              <span className="font-semibold text-indigo-200">
                {studentCount}
              </span>
              <span className="ml-1 text-indigo-300">
                {studentCount <= 1 ? "Student" : "Students"}
              </span>
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 mt-8">
        <main className="grow">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>What you will learn</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {course?.objectives.split(",").map((objective, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="mr-2 h-5 w-5 text-green-500 shrink-0" />
                    <span>{objective}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Course Description</CardTitle>
            </CardHeader>
            <CardContent>{course?.description}</CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Course List</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 ">
              {sortedSections.map((section, sectionIndex) => {
                const sectionId = section._id || `section-${sectionIndex}`;
                const isCollapsed = collapsedSections.has(sectionId);

                return (
                  <div
                    key={sectionId}
                    className="overflow-hidden rounded-lg border bg-card "
                  >
                    <button
                      type="button"
                      onClick={() => toggleSection(sectionId)}
                      className="flex w-full items-center gap-2 bg-muted px-4 py-3 text-left font-semibold text-foreground transition-colors hover:bg-accent cursor-pointer"
                    >
                      {isCollapsed ? (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="min-w-0 flex-1 truncate">
                        {section.title}
                      </span>
                      <span className="text-xs font-medium text-muted-foreground">
                        {section.lectures?.length || 0} lectures
                      </span>
                    </button>

                    {!isCollapsed && (
                      <ul className="divide-y divide-border">
                        {section.lectures?.map((curriculumItem, index) => (
                          <li key={curriculumItem._id || index}>
                            <button
                              type="button"
                              className={`flex w-full items-center px-4 py-3 text-left ${
                                curriculumItem?.freePreview
                                  ? "cursor-pointer transition-colors hover:bg-accent"
                                  : "cursor-not-allowed text-muted-foreground"
                              }`}
                              onClick={
                                curriculumItem?.freePreview
                                  ? () => handleSetFreePreview(curriculumItem)
                                  : () => {}
                              }
                            >
                              {curriculumItem?.freePreview ? (
                                <PlayCircle className="mr-2 h-4 w-4 shrink-0 text-indigo-600" />
                              ) : (
                                <Lock className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                              )}
                              <span className="min-w-0 flex-1 truncate">
                                {index + 1}. {curriculumItem?.title}
                              </span>
                              {curriculumItem?.duration && (
                                <span className="ml-3 shrink-0 text-xs text-muted-foreground">
                                  {curriculumItem.duration}
                                </span>
                              )}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}

              {unsectionedLectures.length > 0 && (
                <div className="overflow-hidden rounded-lg border bg-card">
                  <div className="bg-muted px-4 py-3 text-sm font-semibold text-foreground">
                    Unsectioned
                  </div>
                  <ul className="divide-y divide-border">
                    {unsectionedLectures.map((curriculumItem, index) => (
                      <li key={curriculumItem._id || index}>
                        <button
                          type="button"
                          className={`flex w-full items-center px-4 py-3 text-left ${
                            curriculumItem?.freePreview
                              ? "cursor-pointer transition-colors hover:bg-accent"
                              : "cursor-not-allowed text-muted-foreground"
                          }`}
                          onClick={
                            curriculumItem?.freePreview
                              ? () => handleSetFreePreview(curriculumItem)
                              : () => {}
                          }
                        >
                          {curriculumItem?.freePreview ? (
                            <PlayCircle className="mr-2 h-4 w-4 shrink-0 text-indigo-600" />
                          ) : (
                            <Lock className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                          )}
                          <span className="min-w-0 flex-1 truncate">
                            {index + 1}. {curriculumItem?.title}
                          </span>
                          {curriculumItem?.duration && (
                            <span className="ml-3 shrink-0 text-xs text-muted-foreground">
                              {curriculumItem.duration}
                            </span>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </main>

        <aside className="w-full md:w-[500px]">
          <Card className="sticky top-4">
            <CardContent className="p-6">
              {previewLecture?.videoUrl ? (
                <button
                  type="button"
                  onClick={() => handleSetFreePreview(previewLecture)}
                  className="relative mb-4 aspect-video w-full overflow-hidden rounded-lg bg-slate-900 text-left"
                >
                  {course?.image ? (
                    <Image
                      src={course.image}
                      alt={course.title || "Course preview"}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 500px"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-linear-to-br from-slate-800 to-indigo-950" />
                  )}
                  <div className="absolute inset-0 bg-black/35" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg">
                      <PlayCircle className="h-5 w-5 text-indigo-600" />
                      Play Preview
                    </span>
                  </div>
                </button>
              ) : null}

              <div className="mb-4">
                <span className="text-3xl font-bold">${course?.price}</span>
              </div>

              {isEnrolled ? (
                <Button
                  asChild
                  className="w-full bg-linear-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white text-lg py-6 rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/25"
                >
                  <Link href={`/course/${id}/learn`}>
                    <PlayCircle className="mr-2 h-5 w-5" />
                    Continue Learning
                  </Link>
                </Button>
              ) : (
                <div className="space-y-4">
                  {/* Add to Cart / Go to Cart */}
                  {cartItems.some((item) => item._id === course?._id) ? (
                    <Button
                      asChild
                      className="w-full bg-slate-800 hover:bg-slate-900 text-white text-lg py-6 rounded-xl transition-all duration-300 shadow-lg cursor-pointer"
                    >
                      <Link href="/cart">
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        Go to Cart
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      className="w-full border-2 border-indigo-600 bg-background text-indigo-700 hover:bg-accent dark:text-indigo-300 text-lg py-6 rounded-xl transition-all duration-300 cursor-pointer"
                      onClick={handleAddToCart}
                      disabled={isProcessing || !userId}
                    >
                      {isProcessing ? (
                        <span className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-indigo-600"></div>
                          Adding...
                        </span>
                      ) : (
                        <>
                          <ShoppingCart className="mr-2 h-5 w-5" />
                          Add to Cart
                        </>
                      )}
                    </Button>
                  )}

                  {/* Buy Now (Direct Checkout) */}
                  <Button
                    className="w-full bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-lg py-6 rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/25 cursor-pointer"
                    onClick={() => setShowPaymentMethodDialog(true)}
                    disabled={isProcessingBuyNow || !userId}
                  >
                    {isProcessingBuyNow ? (
                      <span className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                        Processing...
                      </span>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-5 w-5" />
                        Buy Now
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>

      {/* Payment Method Selection Dialog */}
      <Dialog
        open={showPaymentMethodDialog}
        onOpenChange={setShowPaymentMethodDialog}
      >
        <DialogContent className="w-[95vw] max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Select Payment Method</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 my-6">
            {/* Stripe Option */}
            <button
              onClick={() => {
                setPaymentMethod("stripe");
                handleStripeCheckout();
              }}
              disabled={isProcessingBuyNow}
              className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-border bg-card hover:border-foreground hover:bg-accent transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mb-3">
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9 12h6M12 9v6" />
                </svg>
              </div>
              <h3 className="font-bold text-foreground mb-1">Stripe</h3>
              <p className="text-xs text-muted-foreground text-center">
                Pay with card securely
              </p>
            </button>

            {/* PayPal Option */}
            <button
              onClick={() => setPaymentMethod("paypal")}
              disabled={isProcessingBuyNow}
              className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-blue-200 bg-card hover:border-blue-600 hover:bg-blue-50 dark:border-blue-500/30 dark:hover:bg-blue-500/10 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-3">
                <svg
                  className="w-6 h-6 text-white"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M10 15h4v-4h-4v4zm-9 1h2v-8H1v8zm20-8h-3V5h-2v3h-3v2h3v3h2v-3h3V8z" />
                </svg>
              </div>
              <h3 className="font-bold text-foreground mb-1">PayPal</h3>
              <p className="text-xs text-muted-foreground text-center">
                Pay with your PayPal account
              </p>
            </button>
          </div>

          {paymentMethod === "paypal" && (
            <div className="mt-6 pt-6 border-t">
              <PayPalCheckoutButtons
                createOrder={handleCreatePayPalOrder}
                onApprove={async (orderId) => {
                  try {
                    await handleCapturePayPalOrder(orderId);
                  } catch {
                    toast.error(
                      "Failed to complete payment. Please try again.",
                    );
                  }
                }}
                onError={(message) => toast.error(message)}
              />
            </div>
          )}

          <DialogFooter className="sm:justify-start">
            <DialogClose asChild>
              <Button
                type="button"
                variant="secondary"
                disabled={isProcessingBuyNow}
              >
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Free Preview Dialog */}
      <Dialog
        open={showFreePreviewDialog}
        onOpenChange={() => {
          setShowFreePreviewDialog(false);
          setDisplayCurrentVideoFreePreview(null);
        }}
      >
        <DialogContent className="w-[95vw] max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Course Preview</DialogTitle>
          </DialogHeader>
          <div className="aspect-video rounded-lg flex items-center justify-center">
            {showFreePreviewDialog && displayCurrentVideoFreePreview ? (
              <VideoPlayer
                src={displayCurrentVideoFreePreview}
                width="450px"
                height="200px"
              />
            ) : null}
          </div>
          <div className="flex flex-col gap-2">
            {freePreviewLectures.map((filteredItem, index) => (
              <p
                key={index}
                onClick={() => handleSetFreePreview(filteredItem)}
                className="cursor-pointer text-[16px] font-medium text-foreground hover:text-indigo-600 dark:hover:text-indigo-300"
              >
                {filteredItem?.title}
              </p>
            ))}
          </div>
          <DialogFooter className="sm:justify-start">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseDetails;
