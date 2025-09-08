import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  className?: string;
  variant?: 'default' | 'inline' | 'button';
  color?: 'blue' | 'white' | 'gray';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text = 'Loading...', 
  className = '',
  variant = 'default',
  color = 'blue'
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-20 w-20'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const colorClasses = {
    blue: 'border-blue-500',
    white: 'border-white',
    gray: 'border-gray-400'
  };

  // Inline spinner for buttons and small areas
  if (variant === 'inline') {
    return (
      <div className={`animate-spin rounded-full border-t-2 border-b-2 ${colorClasses[color]} ${sizeClasses[size]} ${className}`}></div>
    );
  }

  // Button spinner with text
  if (variant === 'button') {
    return (
      <div className="flex items-center">
        <svg
          className={`animate-spin ${sizeClasses[size]} mr-2 ${colorClasses[color]}`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          ></path>
        </svg>
        {text}
      </div>
    );
  }

  // Default full-page spinner
  return (
    <div className={`flex justify-center items-center h-64 ${className}`}>
      <div className={`animate-spin rounded-full border-t-4 border-b-4 ${colorClasses[color]} ${sizeClasses[size]}`}></div>
      {text && (
        <p className={`ml-4 ${textSizes[size]} text-gray-600`}>
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner; 