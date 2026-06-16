"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

// ============================================
// BASE SKELETON COMPONENT
// ============================================
type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export const Skeleton = ({ className, ...props }: SkeletonProps) => (
  <div
    className={cn("animate-pulse bg-muted rounded-md", className)}
    {...props}
  />
);

// ============================================
// CARD SKELETON - Reusable for any card layout
// ============================================
interface CardSkeletonProps {
  showImage?: boolean;
  imagePosition?: "top" | "bottom";
  lines?: number;
  className?: string;
}

export const CardSkeleton = ({
  showImage = true,
  imagePosition = "bottom",
  lines = 3,
  className,
}: CardSkeletonProps) => (
  <div className={cn("w-full", className)}>
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="py-4 px-5 flex flex-row items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-full shrink-0" />
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Image at top position */}
      {showImage && imagePosition === "top" && (
        <div className="px-5">
          <Skeleton className="w-full aspect-video rounded-xl" />
        </div>
      )}

      {/* Content lines */}
      <div className="px-5 space-y-2">
        {[...Array(lines)].map((_, i) => (
          <Skeleton
            key={i}
            className="h-3"
            style={{ width: `${100 - i * 15}%` }}
          />
        ))}
      </div>

      {/* Image at bottom position */}
      {showImage && imagePosition === "bottom" && (
        <div className="px-5 mt-4">
          <Skeleton className="w-full aspect-video rounded-xl" />
        </div>
      )}

      <div className="h-4" />
    </div>
  </div>
);

// ============================================
// GRID SKELETON - For grid layouts
// ============================================
interface GridSkeletonProps {
  count?: number;
  columns?: { sm?: number; md?: number; lg?: number };
  showImage?: boolean;
  className?: string;
}

export const GridSkeleton = ({
  count = 6,
  columns = { sm: 1, md: 2, lg: 3 },
  showImage = true,
  className,
}: GridSkeletonProps) => {
  return (
    <div
      className={cn("grid gap-4", className)}
      style={{
        gridTemplateColumns: `repeat(${columns.lg || 3}, minmax(0, 1fr))`,
      }}
    >
      {[...Array(count)].map((_, index) => (
        <motion.div
          key={index}
          suppressHydrationWarning
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            delay: index * 0.1,
            ease: [0.21, 0.47, 0.32, 0.98],
          }}
        >
          <CardSkeleton showImage={showImage} />
        </motion.div>
      ))}
    </div>
  );
};

// ============================================
// CAROUSEL SKELETON - For carousel layouts
// ============================================
interface CarouselSkeletonProps {
  count?: number;
  showNavigation?: boolean;
  className?: string;
}

export const CarouselSkeleton = ({
  count = 3,
  showNavigation = true,
  className,
}: CarouselSkeletonProps) => {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex gap-4 overflow-hidden px-1">
        {[...Array(count)].map((_, index) => (
          <motion.div
            key={index}
            suppressHydrationWarning
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              delay: index * 0.1,
              ease: [0.21, 0.47, 0.32, 0.98],
            }}
            className="shrink-0 w-full md:w-1/2 lg:w-1/3 p-1"
          >
            <CardSkeleton />
          </motion.div>
        ))}
      </div>

      {/* Navigation skeleton */}
      {showNavigation && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex gap-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-2 w-2 rounded-full" />
            ))}
          </div>
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      )}
    </div>
  );
};

// ============================================
// LIST SKELETON - For list layouts
// ============================================
interface ListSkeletonProps {
  count?: number;
  showAvatar?: boolean;
  className?: string;
}

export const ListSkeleton = ({
  count = 5,
  showAvatar = true,
  className,
}: ListSkeletonProps) => (
  <div className={cn("space-y-4", className)}>
    {[...Array(count)].map((_, index) => (
      <motion.div
        key={index}
        suppressHydrationWarning
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{
          duration: 0.3,
          delay: index * 0.05,
        }}
        className="flex items-center gap-4 p-4 rounded-lg border bg-card"
      >
        {showAvatar && <Skeleton className="h-12 w-12 rounded-full shrink-0" />}
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-8 w-20 rounded-md" />
      </motion.div>
    ))}
  </div>
);

// ============================================
// LOADING SPINNER - Simple spinner component
// ============================================
interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

export const LoadingSpinner = ({
  size = "md",
  text,
  className,
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3",
        className,
      )}
    >
      <div className="flex gap-1">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            suppressHydrationWarning
            className={cn("rounded-full bg-primary", sizeClasses[size])}
            style={{
              width: size === "sm" ? 6 : size === "md" ? 8 : 10,
              height: size === "sm" ? 6 : size === "md" ? 8 : 10,
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [1, 0.5, 1],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  );
};

// ============================================
// PAGE SKELETON - Full page loading skeleton
// ============================================
interface PageSkeletonProps {
  showHero?: boolean;
  contentType?: "grid" | "carousel" | "list";
  className?: string;
}

export const PageSkeleton = ({
  showHero = true,
  contentType = "carousel",
  className,
}: PageSkeletonProps) => {
  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {/* Hero section */}
      {showHero && (
        <motion.div
          suppressHydrationWarning
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Skeleton className="w-full h-[300px] md:h-[400px] rounded-2xl" />
        </motion.div>
      )}

      {/* Section title */}
      <div className="mt-4">
        <Skeleton className="h-8 w-48" />
      </div>

      {/* Content based on type */}
      {contentType === "carousel" && <CarouselSkeleton />}
      {contentType === "grid" && <GridSkeleton />}
      {contentType === "list" && <ListSkeleton />}

      {/* Loading indicator */}
      <LoadingSpinner text="Loading..." className="py-4" />
    </div>
  );
};

// ============================================
// LOTTIE LOADING - Animated loading state
// ============================================
import { StatusAnimation } from "./status-animation";

interface LottieLoadingProps {
  text?: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export const LottieLoading = ({
  text,
  className,
  size = "md",
}: LottieLoadingProps) => {
  const sizes = {
    sm: 50,
    md: 100,
    lg: 200,
    xl: 300,
  };

  return (
    <StatusAnimation
      type="loading"
      className={className}
      width={sizes[size]}
      height={sizes[size]}
      statusText={text}
    />
  );
};
