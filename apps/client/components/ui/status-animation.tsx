"use client";

import { LottieAnimation } from "./lottie-animation";
import loadingAnimation from "@/public/animations/loading.json";
import errorAnimation from "@/public/animations/error.json";
import notFoundAnimation from "@/public/animations/not-found.json";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

export type AnimationType = "loading" | "error" | "notFound";

interface StatusAnimationProps {
  type: AnimationType;
  className?: string;
  width?: number | string;
  height?: number | string;
  statusText?: string;
  loop?: boolean;
  autoplay?: boolean;
}

const animationMap = {
  loading: loadingAnimation,
  error: errorAnimation,
  notFound: notFoundAnimation,
};

export const StatusAnimation = ({
  type,
  className,
  width = 200,
  height = 200,
  statusText,
  loop = true,
  autoplay = true,
}: StatusAnimationProps) => {
  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <LottieAnimation
        animationData={animationMap[type]}
        width={width}
        height={height}
        loop={loop}
        autoplay={autoplay}
      />
      {statusText && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-muted-foreground font-medium mt-2 text-center"
          suppressHydrationWarning
        >
          {statusText}
        </motion.p>
      )}
    </div>
  );
};

export default StatusAnimation;
