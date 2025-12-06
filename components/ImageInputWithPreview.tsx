'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface ImageInputWithPreviewProps {
  label: string;
  value: string;
  sourceType: 'url' | 'path';
  onValueChange: (value: string) => void;
  onSourceChange: (source: 'url' | 'path') => void;
  placeholder?: string;
  helpText?: string;
  minHeight?: string;
}

export default function ImageInputWithPreview({
  label,
  value,
  sourceType,
  onValueChange,
  onSourceChange,
  placeholder = "https://example.com/image.jpg or /public/image.jpg",
  helpText = "Enter image URL or /public path",
  minHeight = "h-40",
}: ImageInputWithPreviewProps) {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setError('');
  }, [value, sourceType]);

  const isValidImageSource = (src: string, type: 'url' | 'path') => {
    if (!src) return false;

    if (type === 'url') {
      try {
        new URL(src);
        return true;
      } catch {
        return false;
      }
    } else {
      return src.startsWith('/');
    }
  };

  const getImageSrc = () => {
    if (!value) return null;
    if (sourceType === 'path' && value.startsWith('/')) {
      return value;
    } else if (sourceType === 'url') {
      return value;
    }
    return null;
  };

  const imageSrc = getImageSrc();
  const isValid = isValidImageSource(value, sourceType);

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
        {label}
      </label>

      {/* Source Type Toggle */}
      <div className="flex gap-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
        <button
          type="button"
          onClick={() => onSourceChange('url')}
          className={`flex-1 px-3 py-2 rounded-md transition-all font-medium text-sm ${
            sourceType === 'url'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          🌐 URL
        </button>
        <button
          type="button"
          onClick={() => onSourceChange('path')}
          className={`flex-1 px-3 py-2 rounded-md transition-all font-medium text-sm ${
            sourceType === 'path'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          📁 /public
        </button>
      </div>

      {/* Input Field */}
      <input
        type="text"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition"
      />

      {/* Help Text */}
      <p className="text-xs text-gray-500 dark:text-gray-400">{helpText}</p>

      {/* Error Message */}
      {value && !isValid && (
        <div className="p-2 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-600 dark:text-red-400">
          ⚠️ Invalid {sourceType === 'url' ? 'URL' : '/public path'}
        </div>
      )}

      {/* Image Preview */}
      {value && isValid && imageSrc && (
        <div className={`relative w-full ${minHeight} bg-gray-800 rounded-lg overflow-hidden border-2 border-blue-500/50`}>
          <Image
            src={imageSrc}
            alt="Preview"
            fill
            className="object-cover"
            onLoadingComplete={() => setIsLoading(false)}
            onError={() => setError('Failed to load image')}
          />
          {isLoading && (
            <div className="absolute inset-0 bg-gray-800/50 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
            </div>
          )}
        </div>
      )}

      {/* Success Indicator */}
      {value && isValid && imageSrc && !error && (
        <div className="p-2 bg-green-500/10 border border-green-500/30 rounded-lg text-sm text-green-600 dark:text-green-400">
          ✅ Image preview ready
        </div>
      )}
    </div>
  );
}
