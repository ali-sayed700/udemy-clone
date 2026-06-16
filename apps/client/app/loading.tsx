'use client';

import { StatusAnimation } from '@/components/ui/status-animation';

export default function Loading() {
  return (
    <div className="container mx-auto px-4 min-h-[50vh] flex items-center justify-center">
      <StatusAnimation
        type="loading"
        width={300}
        height={300}
        statusText="Preparing your learning experience..."
      />
    </div>
  );
}
