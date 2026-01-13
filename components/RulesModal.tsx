import { useState, useEffect } from 'react';

interface RulesModalProps {
    isOpen: boolean;
    onClose: () => void;
    content: string;
}

export default function RulesModal({ isOpen, onClose, content }: RulesModalProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            // Prevent body scroll
            document.body.style.overflow = 'hidden';
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            document.body.style.overflow = 'unset';
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isVisible && !isOpen) return null;

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/90 backdrop-blur-xl"
                onClick={onClose}
            ></div>

            {/* Modal Container */}
            <div className={`relative w-full max-w-4xl max-h-[90vh] bg-[#0f1219] border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-2xl shadow-purple-900/20 transform transition-transform duration-300 ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'}`}>

                {/* Header */}
                <div className="flex items-center justify-between p-6 md:p-8 border-b border-white/5 bg-white/5 backdrop-blur-md z-10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-600/20 rounded-xl text-purple-400">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Rules & Regulations</h2>
                            <p className="text-gray-400 text-sm">Official Tournament Guidelines</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full bg-white/5 hover:bg-white/20 text-gray-400 hover:text-white transition-all transform hover:rotate-90"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar bg-gradient-to-b from-[#0f1219] to-black/50">
                    <div
                        className="prose prose-invert prose-lg max-w-none
                            prose-headings:text-white prose-headings:font-bold prose-headings:tracking-tight
                            prose-p:text-gray-300 prose-p:leading-relaxed
                            prose-li:text-gray-300
                            prose-strong:text-purple-400
                            prose-a:text-cyan-400 hover:prose-a:text-cyan-300
                            prose-blockquote:border-l-4 prose-blockquote:border-purple-500 prose-blockquote:bg-white/5 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg
                            prose-code:text-pink-400 prose-code:bg-white/5 prose-code:px-1 prose-code:rounded
                        "
                        dangerouslySetInnerHTML={{ __html: content || '<p class="text-gray-500 italic text-center py-10">No rules content available.</p>' }}
                    />
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/5 bg-black/20 text-center text-xs text-gray-500 uppercase tracking-widest">
                    VGS Tournament Authority • {new Date().getFullYear()}
                </div>
            </div>
        </div>
    );
}
