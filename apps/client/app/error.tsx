"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/error-state";
import { toast } from "react-toastify";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    toast.error(`${error.message} `);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <ErrorState
        error={error}
        title="Oops! Something went wrong"
        message="We encountered an unexpected error. Don't worry, our team has been notified."
        type="generic"
        onRetry={reset}
        showHomeButton={true}
        showDetails={true}
      />
    </div>
  );
}
