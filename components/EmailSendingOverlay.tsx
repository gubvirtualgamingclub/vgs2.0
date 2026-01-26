'use client';

import { useEffect, useState } from 'react';
import { PaperAirplaneIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface EmailSendingOverlayProps {
  isSending: boolean;
  progress: { sent: number; total: number; failed: number };
  onComplete: () => void;
}

export default function EmailSendingOverlay({ isSending, progress, onComplete }: EmailSendingOverlayProps) {
  const [mounted, setMounted] = useState(false);
  const [show, setShow] = useState(false);
  const [animationStage, setAnimationStage] = useState<'sending' | 'success' | 'error'>('sending');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isSending) {
      setShow(true);
      setAnimationStage('sending');
    } else if (show) {
      // Sending finished
      if (progress.failed === 0 && progress.sent > 0) {
        setAnimationStage('success');

        // Auto close ONLY on success
        const timer = setTimeout(() => {
          setShow(false);
          onComplete();
        }, 3000);
        return () => clearTimeout(timer);
      } else {
        setAnimationStage('error');
        // DO NOT auto-close on error, wait for user to click
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSending, progress]); // Removed 'show' and 'onComplete' from dep array to avoid loops

  // Handler for manual close
  const handleClose = () => {
    setShow(false);
    onComplete();
  };

  if (!mounted || !show) return null;

  const percentage = progress.total > 0 ? Math.round(((progress.sent + progress.failed) / progress.total) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="max-w-md w-full p-8 rounded-3xl bg-gradient-to-br from-gray-800 to-gray-900 border border-purple-500/30 shadow-2xl relative overflow-hidden">
        
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl"></div>

        <div className="relative z-10 flex flex-col items-center text-center">
          
          {/* Animation Stage: Sending */}
          {animationStage === 'sending' && (
            <>
              <div className="relative mb-8">
                {/* Orbital Rings */}
                <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full animate-[spin_3s_linear_infinite]"></div>
                <div className="absolute inset-2 border-4 border-pink-500/30 rounded-full animate-[spin_4s_linear_infinite_reverse]"></div>
                
                {/* Central Icon */}
                <div className="w-32 h-32 flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-600 rounded-full shadow-lg relative">
                  <PaperAirplaneIcon className="w-16 h-16 text-white animate-pulse" />
                  
                  {/* Particles */}
                  <div className="absolute -right-4 top-0 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
                  <div className="absolute -left-2 bottom-4 w-2 h-2 bg-blue-400 rounded-full animate-ping delay-75"></div>
                </div>
              </div>

              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
                Sending Emails...
              </h2>
              <p className="text-gray-400 mb-6">Delivering your campaign</p>

              {/* Warning Message */}
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-6 animate-pulse">
                <p className="text-yellow-200 text-sm font-semibold flex items-center justify-center gap-2">
                  <span className="text-xl">⚠️</span>
                  Please keep this tab open!
                </p>
                <p className="text-yellow-200/70 text-xs mt-1">
                  Closing it will stop the campaign.
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-700/50 rounded-full h-4 mb-4 overflow-hidden relative">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 bg-[length:200%_100%] animate-[shimmer_2s_linear_infinite] transition-all duration-300 ease-out"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between w-full text-sm font-medium">
                <span className="text-purple-300">{percentage}% Complete</span>
                <span className="text-gray-400">{progress.sent + progress.failed} / {progress.total}</span>
              </div>
            </>
          )}

          {/* Animation Stage: Success */}
          {animationStage === 'success' && (
            <div className="animate-scaleIn">
              <div className="w-32 h-32 mx-auto mb-6 bg-green-500/20 rounded-full flex items-center justify-center border-4 border-green-500 relative">
                <CheckCircleIcon className="w-20 h-20 text-green-500 animate-[bounce_1s_ease-out]" />
                <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-green-400"></div>
              </div>
              <h2 className="text-3xl font-bold text-green-400 mb-2">Mission Accomplished!</h2>
              <p className="text-gray-300 mb-6">All {progress.sent} emails have been delivered successfully.</p>
              
              <button 
                onClick={onComplete}
                className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all hover:scale-105 shadow-lg shadow-green-900/50"
              >
                Continue
              </button>
            </div>
          )}

          {/* Animation Stage: Error/Partial */}
          {animationStage === 'error' && (
            <div className="animate-shake">
              <div className="w-32 h-32 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center border-4 border-red-500">
                <XCircleIcon className="w-20 h-20 text-red-500" />
              </div>
              <h2 className="text-3xl font-bold text-red-400 mb-2">Sending Issues Detected</h2>
              <p className="text-gray-300 mb-2">
                <span className="text-green-400 font-bold">{progress.sent} sent</span> • 
                <span className="text-red-400 font-bold ml-2">{progress.failed} failed</span>
              </p>
              <p className="text-gray-400 text-sm mb-6">Check the error logs for details.</p>
              
              <button 
                onClick={handleClose}
                className="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-bold transition-all z-50 relative cursor-pointer"
              >
                Close & Review
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes shimmer {
          0% { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }
        @keyframes scaleIn {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
}
