'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { QuestionMarkCircleIcon, XMarkIcon, ClipboardDocumentIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';

interface AdminHelpButtonProps {
  title: string;
  instructions: string[];
  tips?: string[];
  actions?: { title: string; description: string }[];
}

export default function AdminHelpButton({ title, instructions, tips, actions }: AdminHelpButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState<'instructions' | 'actions' | 'tips'>('instructions');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Memoize extraction logic to prevent re-calculation on render
  const extractCodeBlock = useCallback((text: string) => {
    // Extract code blocks wrapped in triple backticks
    const tripleBacktickMatch = text.match(/```[\s\S]*?```/);
    if (tripleBacktickMatch) {
      return tripleBacktickMatch[0].replace(/```\w*\n?/g, '').replace(/```/g, '').trim();
    }
    
    // Extract code in single backticks
    const singleBacktickMatch = text.match(/`[^`]+`/);
    if (singleBacktickMatch) {
      return singleBacktickMatch[0].replace(/`/g, '').trim();
    }
    
    // Explicitly check for specific code patterns (simpler logic)
    if (text.includes('EMAIL_') || text.includes('npm ') || text.includes('function ')) {
       const lines = text.split('\n');
       const codeLines = lines.filter(line => {
         const t = line.trim();
         return t.startsWith('EMAIL_') || t.startsWith('npm ') || t.startsWith('function') || t.startsWith('const') || t.startsWith('let');
       });
       if (codeLines.length > 0) return codeLines.join('\n');
    }
    
    return null;
  }, []);

  const formatDescription = useCallback((description: string) => {
    const paragraphs = description.split('\n\n');
    return paragraphs.map((para, idx) => {
      const trimmedPara = para.trim();
      
      // Check for code block
      if (trimmedPara.startsWith('```') || trimmedPara.includes('EMAIL_HOST=')) {
        const codeContent = trimmedPara.replace(/```\w*\n?/g, '').replace(/```/g, '').trim();
        return (
          <pre key={idx} className="bg-gray-900/80 p-3 rounded-lg overflow-x-auto text-xs font-mono text-green-400 my-2 border border-gray-700">
            <code>{codeContent}</code>
          </pre>
        );
      }
      
      // List handling
      if (trimmedPara.includes('\n- ') || trimmedPara.startsWith('- ')) {
        const items = trimmedPara.split('\n').filter(line => line.trim().startsWith('-'));
        return (
          <ul key={idx} className="space-y-1 my-2">
            {items.map((item, itemIdx) => (
              <li key={itemIdx} className="flex items-start gap-2 text-sm">
                <span className="text-purple-400 mt-1">•</span>
                <span className="text-gray-300 leading-relaxed">{item.replace(/^- /, '')}</span>
              </li>
            ))}
          </ul>
        );
      }
      
      // Regular text with bold support
      const parts = para.split(/(\*\*[^*]+\*\*)/g);
      return (
        <p key={idx} className="text-gray-300 text-sm leading-relaxed my-2">
          {parts.map((part, partIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={partIdx} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
            }
            return <span key={partIdx}>{part}</span>;
          })}
        </p>
      );
    });
  }, []);

  if (!isMounted) return null;

  return (
    <>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`
          fixed bottom-6 right-6 z-[60]
          bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700
          text-white p-3 rounded-full shadow-2xl
          transition-all duration-300 hover:scale-110
          flex items-center justify-center
          ${isOpen ? 'rotate-90' : 'rotate-0'}
        `}
        title="Page Instructions"
        aria-label="Toggle Help Instructions"
      >
        {isOpen ? <XMarkIcon className="w-6 h-6" /> : <QuestionMarkCircleIcon className="w-6 h-6" />}
      </button>

      {isOpen && (
        <>
          {/* Backdrop for mobile only */}
          <div 
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px] md:hidden"
            onClick={() => setIsOpen(false)}
          />

          <div
            className="
              fixed bottom-24 right-6 z-50
              w-[calc(100vw-3rem)] max-w-sm md:max-w-md
              bg-gray-800 rounded-2xl shadow-2xl border border-purple-500/30
              flex flex-col max-h-[70vh] animate-fadeIn
            "
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-t-2xl flex items-center justify-between flex-shrink-0">
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 p-1.5 rounded-lg">
                  <QuestionMarkCircleIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white leading-tight">{title}</h2>
                  <p className="text-purple-100 text-xs">Page Instructions</p>
                </div>
              </div>
            </div>

            {/* Content Container */}
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              {/* Tab Navigation */}
              <div className="bg-gray-800 border-b border-gray-700 px-6 py-3 flex gap-2 overflow-x-auto flex-shrink-0">
                <button
                  onClick={() => setActiveSection('instructions')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                    activeSection === 'instructions'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white'
                  }`}
                >
                  📋 Instructions
                </button>
                {actions && actions.length > 0 && (
                  <button
                    onClick={() => setActiveSection('actions')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                      activeSection === 'actions'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white'
                    }`}
                  >
                    ⚡ Step-by-Step
                  </button>
                )}
                {tips && tips.length > 0 && (
                  <button
                    onClick={() => setActiveSection('tips')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                      activeSection === 'tips'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white'
                    }`}
                  >
                    💡 Tips
                  </button>
                )}
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 min-h-0 custom-scrollbar">
                {activeSection === 'instructions' && (
                  <div className="space-y-4">
                    <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-4">
                      <h3 className="text-lg font-bold text-white mb-3">🎯 Quick Overview</h3>
                      <ol className="space-y-3">
                        {instructions.map((instruction, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {index + 1}
                            </span>
                            <span className="text-gray-200 text-sm pt-0.5">{instruction}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                )}

                {activeSection === 'actions' && actions && (
                  <div className="space-y-4">
                    {actions.map((action, index) => {
                      const codeBlock = extractCodeBlock(action.description);
                      return (
                        <div key={index} className="bg-gray-700/30 rounded-xl border border-gray-700 overflow-hidden">
                          <div className="bg-gray-700/50 px-4 py-3 flex items-center justify-between">
                            <h4 className="font-bold text-white text-base flex items-center gap-2">
                              <span className="text-purple-400">#{index + 1}</span>
                              {action.title}
                            </h4>
                            {codeBlock && (
                              <button
                                onClick={() => copyToClipboard(codeBlock, index)}
                                className="text-xs flex items-center gap-2 px-2 py-1 bg-gray-600 hover:bg-gray-500 rounded text-gray-200 transition-colors"
                              >
                                {copiedIndex === index ? (
                                  <>
                                    <ClipboardDocumentCheckIcon className="w-4 h-4 text-green-400" />
                                    Copied
                                  </>
                                ) : (
                                  <>
                                    <ClipboardDocumentIcon className="w-4 h-4" />
                                    Copy
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                          <div className="p-4">
                            {formatDescription(action.description)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {activeSection === 'tips' && tips && (
                  <div className="space-y-3">
                    {tips.map((tip, index) => (
                      <div key={index} className="bg-yellow-900/10 border border-yellow-600/20 rounded-xl p-4 flex gap-3">
                        <span className="text-xl">💡</span>
                        <p className="text-gray-200 text-sm pt-1">{tip}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        </>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.5);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4b5563;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }
      `}</style>
    </>
  );
}
