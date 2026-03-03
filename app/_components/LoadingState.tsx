'use client';

import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

/**
 * Loading State Component
 * Displays a loading spinner with optional message
 */
export function LoadingState({ 
  message = 'Loading...', 
  size = 'md',
  fullScreen = false 
}: LoadingStateProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2 
        className={`${sizeClasses[size]} animate-spin text-blue-600`}
        aria-hidden="true"
      />
      <p className={`${textSizeClasses[size]} text-gray-600`} role="status">
        {message}
      </p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      {content}
    </div>
  );
}

/**
 * Inline Loading Spinner
 * Small spinner for inline use (e.g., in buttons)
 */
export function LoadingSpinner({ className = '' }: { className?: string }) {
  return (
    <Loader2 
      className={`h-4 w-4 animate-spin ${className}`}
      aria-hidden="true"
    />
  );
}

/**
 * Loading Overlay
 * Semi-transparent overlay with loading spinner
 */
export function LoadingOverlay({ message = 'Processing...' }: { message?: string }) {
  return (
    <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" aria-hidden="true" />
        <p className="text-sm text-gray-600" role="status">{message}</p>
      </div>
    </div>
  );
}
