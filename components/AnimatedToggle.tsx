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
    if (disabled) return;

    // Optimistic Update: Update UI immediately
    const previousState = displayState;
    const newState = !displayState;
    setDisplayState(newState);

    try {
      await onToggle(newState);
    } catch (error) {
      console.error('Toggle error:', error);
      // Revert on error
      setDisplayState(previousState);
    }
  };

  // Size configurations with enhanced dimensions
  const sizeConfig = {
    sm: {
      toggleWidth: 'w-12',
      toggleHeight: 'h-6',
      dotSize: 'w-4 h-4',
      dotOffset: 'translate-x-6',
      textSize: 'text-xs',
      padding: 'px-2 py-1',
    },
    md: {
      toggleWidth: 'w-14',
      toggleHeight: 'h-7',
      dotSize: 'w-5 h-5',
      dotOffset: 'translate-x-7',
      textSize: 'text-sm',
      padding: 'px-3 py-2',
    },
    lg: {
      toggleWidth: 'w-18',
      toggleHeight: 'h-9',
      dotSize: 'w-7 h-7',
      dotOffset: 'translate-x-9',
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
        className={`
          relative ${config.toggleWidth} ${config.toggleHeight} rounded-full 
          transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
          ${displayState
            ? 'bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-600'
            : 'bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${isLoading ? 'animate-pulse' : ''}
          before:absolute before:inset-0 before:rounded-full before:transition-all before:duration-500
          ${displayState 
            ? 'before:shadow-[0_0_20px_rgba(34,197,94,0.4),inset_0_1px_1px_rgba(255,255,255,0.2)]' 
            : 'before:shadow-[0_0_10px_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.1)]'
          }
          after:absolute after:inset-[2px] after:rounded-full after:transition-all after:duration-500
          ${displayState
            ? 'after:bg-gradient-to-b after:from-white/20 after:to-transparent'
            : 'after:bg-gradient-to-b after:from-white/10 after:to-transparent'
          }
          hover:scale-[1.02] active:scale-[0.98]
          focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 
          ${displayState ? 'focus-visible:ring-green-500' : 'focus-visible:ring-gray-400'}
        `}
      >
        {/* Background glow effect */}
        <div 
          className={`
            absolute inset-0 rounded-full transition-all duration-700 blur-md
            ${displayState ? 'bg-green-400/30 scale-110' : 'bg-transparent scale-100'}
          `}
        />

        {/* Track inner shadow for depth */}
        <div className="absolute inset-0 rounded-full shadow-inner" />

        {/* Animated dot with spring effect */}
        <div
          className={`
            absolute top-1 left-1 ${config.dotSize} rounded-full 
            bg-white shadow-lg
            transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
            ${displayState ? config.dotOffset : 'translate-x-0'}
            ${isLoading ? 'scale-90' : 'scale-100'}
            before:absolute before:inset-0 before:rounded-full 
            before:bg-gradient-to-b before:from-white before:to-gray-100
            before:shadow-[0_2px_4px_rgba(0,0,0,0.2)]
            after:absolute after:inset-[2px] after:rounded-full 
            after:bg-gradient-to-b after:from-white after:to-gray-50
            hover:shadow-xl
          `}
        >
          {/* Dot inner highlight */}
          <div className="absolute inset-[3px] rounded-full bg-gradient-to-br from-white via-gray-50 to-white opacity-80" />
        </div>

        {/* Status icons inside track */}
        <div className="absolute inset-0 flex items-center justify-between px-1.5 pointer-events-none">
          {/* Check icon (left side, visible when on) */}
          <svg
            className={`
              w-3 h-3 transition-all duration-300 z-10
              ${displayState ? 'text-white/90 scale-100 opacity-100' : 'text-transparent scale-75 opacity-0'}
            `}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
          
          {/* X icon (right side, visible when off) */}
          <svg
            className={`
              w-3 h-3 transition-all duration-300 z-10
              ${!displayState ? 'text-white/70 scale-100 opacity-100' : 'text-transparent scale-75 opacity-0'}
            `}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      </button>

      {/* Status label with smooth color transition */}
      <span
        className={`
          ${config.textSize} font-semibold transition-all duration-500 
          ${displayState
            ? 'text-emerald-500 dark:text-emerald-400'
            : 'text-gray-500 dark:text-gray-400'
          }
        `}
      >
        {displayState ? onLabel : offLabel}
      </span>
    </div>
  );
}
