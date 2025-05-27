import { LogoText } from '@/components/ui/logo';
import React from 'react';

export default function Loading() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-pulse">
          <LogoText size="large" />
        </div>
      </div>
  );
}
