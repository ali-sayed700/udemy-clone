"use client";

import { motion } from "motion/react";
import {
  AlertTriangle,
  RefreshCw,
  Home,
  WifiOff,
  ServerCrash,
  FileQuestion,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { StatusAnimation, AnimationType } from "./status-animation";

// ============================================
// ERROR STATE COMPONENT - Reusable error UI
// ============================================

type ErrorType = "generic" | "network" | "server" | "notFound";

interface ErrorStateProps {
  error?: Error | unknown;
  title?: string;
  message?: string;
  type?: ErrorType;
  onRetry?: () => void;
  showHomeButton?: boolean;
  showDetails?: boolean;
  className?: string;
}

const errorConfig: Record<
  ErrorType,
  {
    icon: typeof AlertTriangle;
    title: string;
    message: string;
    animationType: AnimationType;
  }
> = {
  generic: {
    icon: AlertTriangle,
    title: "Something went wrong",
    message: "An unexpected error occurred. Please try again.",
    animationType: "error",
  },
  network: {
    icon: WifiOff,
    title: "Connection Error",
    message: "Unable to connect. Please check your internet connection.",
    animationType: "error",
  },
  server: {
    icon: ServerCrash,
    title: "Server Error",
    message: "Our servers are having trouble. Please try again later.",
    animationType: "error",
  },
  notFound: {
    icon: FileQuestion,
    title: "Not Found",
    message: "The requested resource could not be found.",
    animationType: "notFound",
  },
};

export const ErrorState = ({
  error,
  title,
  message,
  type = "generic",
  onRetry,
  showHomeButton = false,
  showDetails = false,
  className,
}: ErrorStateProps) => {
  const config = errorConfig[type];

  // Logic to determine display values
  const displayTitle = title || config.title;
  const displayMessage =
    message || (error instanceof Error ? error.message : config.message);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={cn("w-full flex items-center justify-center py-12", className)}
      suppressHydrationWarning
    >
      <div
        suppressHydrationWarning
        className="flex flex-col items-center gap-4 text-center max-w-md px-4"
      >
        {/* Lottie Animation */}
        <div className="w-48 h-48 flex items-center justify-center -my-8">
          <StatusAnimation
            type={config.animationType}
            width={200}
            height={200}
          />
        </div>

        {/* Error Title */}
        <h3 className="text-xl font-bold text-foreground">{displayTitle}</h3>

        {/* Error Message */}
        <p className="text-sm text-muted-foreground">{displayMessage}</p>

        {/* Error Details (optional) */}
        {showDetails && error instanceof Error && error.message && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="w-full"
            suppressHydrationWarning
          >
            <details className="group text-left">
              <summary className="flex items-center justify-center gap-2 cursor-pointer text-xs text-muted-foreground hover:text-foreground transition-colors">
                <span>View details</span>
              </summary>
              <div className="mt-2 p-3 rounded-lg bg-muted/50">
                <code className="text-xs text-destructive break-all">
                  {error.message}
                </code>
              </div>
            </details>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap gap-3 justify-center mt-2"
          suppressHydrationWarning
        >
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-all hover:scale-105 active:scale-95"
            >
              <RefreshCw suppressHydrationWarning className="h-4 w-4" />
              Try Again
            </button>
          )}

          {showHomeButton && (
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border bg-background text-foreground font-medium text-sm hover:bg-muted transition-all hover:scale-105 active:scale-95"
            >
              <Home suppressHydrationWarning className="h-4 w-4" />
              Go Home
            </Link>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

// ============================================
// INLINE ERROR - Small inline error message
// ============================================
interface InlineErrorProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const InlineError = ({
  message,
  onRetry,
  className,
}: InlineErrorProps) => (
  <div
    className={cn(
      "flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm",
      className,
    )}
  >
    <AlertTriangle suppressHydrationWarning className="h-4 w-4 shrink-0" />
    <span className="flex-1">{message}</span>
    {onRetry && (
      <button
        onClick={onRetry}
        className="p-1 rounded hover:bg-destructive/20 transition-colors"
      >
        <RefreshCw suppressHydrationWarning className="h-4 w-4" />
      </button>
    )}
  </div>
);

// ============================================
// EMPTY STATE - For when no data is found
// ============================================
interface EmptyStateProps {
  icon?: typeof AlertTriangle;
  title?: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState = ({
  icon: Icon = FileQuestion,
  title = "No data found",
  message = "There is nothing to display at the moment.",
  action,
  className,
}: EmptyStateProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className={cn("w-full flex items-center justify-center py-12", className)}
    suppressHydrationWarning
  >
    <div
      suppressHydrationWarning
      className="flex flex-col items-center gap-4 text-center max-w-md"
    >
      <div
        suppressHydrationWarning
        className="w-16 h-16 rounded-full bg-muted flex items-center justify-center"
      >
        <Icon className="h-8 w-8 text-muted-foreground/50" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 mt-2"
        >
          {action.label}
        </button>
      )}
    </div>
  </motion.div>
);

export default ErrorState;
