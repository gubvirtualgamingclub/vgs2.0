'use client';

import React, { useState, useEffect } from 'react';

interface AnimatedToggleProps {
  isOn: boolean;
  onToggle: (newState: boolean) => Promise<void> | void;
  label?: string;
  onLabel?: string;
  offLabel?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function AnimatedToggle({
  isOn,
  onToggle,
  label,
  onLabel = 'Open',
  offLabel = 'Closed',
  disabled = false,
  size = 'md',
}: AnimatedToggleProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [displayState, setDisplayState] = useState(isOn);

  useEffect(() => {
    setDisplayState(isOn);
  }, [isOn]);

  const handleToggle = async () => {
    if (disabled || isLoading) return;

    setIsLoading(true);
    try {
      await onToggle(!displayState);
      setDisplayState(!displayState);
    } catch (error) {
      console.error('Toggle error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Size configurations
  const sizeConfig = {
    sm: {
      toggleWidth: 'w-10',
      toggleHeight: 'h-6',
      dotSize: 'w-5 h-5',
      dotOffset: 'translate-x-4',
      textSize: 'text-xs',
      padding: 'px-2 py-1',
    },
    md: {
      toggleWidth: 'w-14',
      toggleHeight: 'h-8',
      dotSize: 'w-6 h-6',
      dotOffset: 'translate-x-6',
      textSize: 'text-sm',
      padding: 'px-3 py-2',
    },
    lg: {
      toggleWidth: 'w-16',
      toggleHeight: 'h-10',
      dotSize: 'w-8 h-8',
      dotOffset: 'translate-x-8',
      textSize: 'text-base',
      padding: 'px-4 py-3',
    },
  };

  const config = sizeConfig[size];

  return (
    <div className="flex items-center gap-3">
      {label && (
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}

      <button
        onClick={handleToggle}
        disabled={disabled || isLoading}
        className={`relative ${config.toggleWidth} ${config.toggleHeight} rounded-full transition-all duration-300 ${
          displayState
            ? 'bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg shadow-green-500/30'
            : 'bg-gradient-to-r from-red-500 to-pink-600 shadow-lg shadow-red-500/30'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-lg'} ${
          isLoading ? 'animate-pulse' : ''
        }`}
      >
        {/* Animated dot */}
        <div
          className={`absolute top-1 left-1 ${config.dotSize} bg-white rounded-full shadow-md transition-all duration-300 ${
            displayState ? config.dotOffset : 'translate-x-0'
          } ${isLoading ? 'scale-95' : 'scale-100'}`}
        />

        {/* Checkmark/X icon animation */}
        <div className="absolute inset-0 flex items-center justify-center">
          {displayState ? (
            <svg
              className="w-3 h-3 text-white animate-fade-in"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg
              className="w-3 h-3 text-white animate-fade-in"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>
      </button>

      {/* Status label */}
      <span
        className={`${config.textSize} font-semibold transition-all duration-300 ${
          displayState
            ? 'text-green-600 dark:text-green-400'
            : 'text-red-600 dark:text-red-400'
        }`}
      >
        {displayState ? onLabel : offLabel}
      </span>
    </div>
  );
}
