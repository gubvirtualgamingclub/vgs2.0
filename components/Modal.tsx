'use client';

import { Fragment, useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const [show, setShow] = useState(isOpen);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShow(true);
      setTimeout(() => setAnimate(true), 10); // Trigger enter animation
    } else {
      setAnimate(false);
      setTimeout(() => setShow(false), 300); // Wait for exit animation
    }
  }, [isOpen]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${animate ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4 text-center">
        {/* Modal Panel */}
        <div
          className={`
            w-full max-w-2xl transform overflow-hidden rounded-2xl bg-gray-900 border border-white/10 p-6 text-left align-middle shadow-2xl transition-all duration-300
            ${animate ? 'opacity-100 scale-100' : 'opacity-0 scale-95 translate-y-4'}
          `}
        >
          <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
            <h3 className="text-xl font-bold leading-6 text-white">
              {title}
            </h3>
            <button
              type="button"
              className="rounded-lg p-2 text-gray-400 hover:bg-white/10 hover:text-white transition-colors focus:outline-none"
              onClick={onClose}
            >
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-2 custom-scrollbar max-h-[calc(100vh-12rem)] overflow-y-auto px-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
