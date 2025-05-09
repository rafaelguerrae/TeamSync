'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <h1 className="text-3xl font-bold text-red-500 mb-4">Something went wrong!</h1>
      <p className="text-gray-600 max-w-md mb-8">
        An unexpected error has occurred. We've been notified and are working on the issue.
      </p>
      <button
        onClick={() => reset()}
        className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
