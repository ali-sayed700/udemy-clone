"use client";

import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

// Dynamically import Lottie to avoid SSR issues
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

interface LottieAnimationProps {
  animationData: string | object;
  className?: string;
  loop?: boolean;
  autoplay?: boolean;
  width?: number | string;
  height?: number | string;
}

export const LottieAnimation = ({
  animationData,
  className,
  loop = true,
  autoplay = true,
  width,
  height,
}: LottieAnimationProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={cn("flex items-center justify-center", className)}
      style={{ width, height }}
      suppressHydrationWarning
    >
      <Lottie
        animationData={animationData}
        loop={loop}
        autoplay={autoplay}
        className="w-full h-full"
      />
    </motion.div>
  );
};

export default LottieAnimation;
