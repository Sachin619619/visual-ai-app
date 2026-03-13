import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, RefreshCw, Download, Code, X, Copy, Check, Maximize2, Minimize2 } from 'lucide-react';
import { createSandboxContent } from '../lib/sanitizer';

interface VisualRendererProps {
  html: string;
  isLoading: boolean;
  onClear: () => void;
}

export function VisualRenderer({ html, isLoading, onClear }: VisualRendererProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Handle download HTML file
  const handleDownload = () => {
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `visual-ai-${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Copy code to clipboard
  const handleCopyCode = () => {
    navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (html && iframeRef.current) {
      try {
        const content = createSandboxContent(html);
        const iframe = iframeRef.current;
        iframe.srcdoc = content;
        setError(null);
      } catch (err) {
        setError('Failed to render content');
        console.error(err);
      }
    }
  }, [html]);

  // Handle Escape key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
      // Cmd/Ctrl + Shift + C to toggle code preview
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        setShowCode(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  return (
    <div className={`flex-1 h-full bg-bg-primary relative overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Fullscreen Close Button */}
      {isFullscreen && (
        <button
          onClick={() => setIsFullscreen(false)}
          className="absolute top-4 right-16 z-50 p-2.5 bg-bg-secondary/80 backdrop-blur-glass rounded-lg text-text-secondary hover:text-text-primary transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          title="Exit Fullscreen (Esc)"
        >
          <Minimize2 className="w-4 h-4" />
        </button>
      )}

      {/* Toolbar */}
      <div className={`absolute top-3 right-3 sm:top-4 sm:right-4 z-10 flex items-center gap-2 sm:gap-2.5 ${isFullscreen ? 'right-16' : ''}`}>
        {html && (
          <>
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={() => setShowCode(!showCode)}
              className={`p-3 sm:p-2.5 rounded-xl backdrop-blur-md transition-all min-h-[48px] min-w-[48px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center ${
                showCode ? 'bg-accent-primary/20 text-accent-primary' : 'bg-bg-secondary/90 text-text-secondary hover:text-text-primary hover:scale-105 active:scale-95'
              }`}
              title="Toggle Code Preview"
            >
              <Code className="w-5 h-5" />
            </motion.button>
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={handleDownload}
              className="p-3 sm:p-2.5 rounded-xl bg-bg-secondary/90 backdrop-blur-md text-text-secondary hover:text-text-primary transition-all min-h-[48px] min-w-[48px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center hover:scale-105 active:scale-95"
              title="Download HTML"
            >
              <Download className="w-5 h-5" />
            </motion.button>
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-3 sm:p-2.5 rounded-xl bg-bg-secondary/90 backdrop-blur-md text-text-secondary hover:text-text-primary transition-all min-h-[48px] min-w-[48px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center hover:scale-105 active:scale-95"
              title={isFullscreen ? "Exit Fullscreen (Esc)" : "Fullscreen Preview"}
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </motion.button>
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={onClear}
              className="p-3 sm:p-2.5 rounded-xl bg-bg-secondary/90 backdrop-blur-md text-text-secondary hover:text-text-primary transition-all min-h-[48px] min-w-[48px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center hover:scale-105 active:scale-95"
              title="Clear (⌘+L)"
            >
              <Trash2 className="w-5 h-5" />
            </motion.button>
          </>
        )}
      </div>

      {/* Code Preview Panel */}
      <AnimatePresence>
        {showCode && html && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-4 left-4 right-4 z-20 max-h-64 bg-bg-secondary/95 backdrop-blur-glass rounded-xl border border-white/10 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
              <span className="text-sm text-text-secondary">Generated HTML Code</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCode}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-text-secondary hover:text-text-primary transition-colors"
                  title="Copy Code"
                >
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setShowCode(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-text-secondary hover:text-text-primary transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <pre className="p-4 overflow-auto max-h-44 text-xs text-text-muted font-mono">
              {html}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading State */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex items-center justify-center bg-bg-primary"
          >
            <div className="flex flex-col items-center gap-6">
              {/* Polished spinner with multiple rings */}
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-bg-tertiary" />
                <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-transparent border-t-accent-primary animate-spin" style={{ animationDuration: '1s' }} />
                <div className="absolute inset-2 w-16 h-16 rounded-full border-4 border-transparent border-b-accent-secondary animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
                <div className="absolute inset-4 w-12 h-12 rounded-full border-4 border-transparent border-t-cyan-400 animate-spin" style={{ animationDuration: '2s' }} />
                {/* Center dot */}
                <div className="absolute inset-0 m-auto w-3 h-3 rounded-full bg-accent-primary animate-pulse" />
              </div>
              <div className="text-center">
                <p className="text-lg font-medium text-text-primary mb-1">Generating your visualization</p>
                <p className="text-sm text-text-muted animate-pulse">Crafting beautiful UI components...</p>
              </div>
              {/* Progress dots */}
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-accent-primary"
                    style={{
                      animation: 'pulse 1.5s ease-in-out infinite',
                      animationDelay: `${i * 0.2}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error State */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 text-center"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
              <RefreshCw className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-red-400 mb-4">{error}</p>
            <button onClick={onClear} className="btn-primary">
              Try Again
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      <AnimatePresence>
        {!html && !isLoading && !error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center max-w-xs sm:max-w-md px-3"
          >
            <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 rounded-2xl bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 flex items-center justify-center">
              <span className="text-4xl sm:text-5xl">🎨</span>
            </div>
            <h2 className="font-heading text-xl sm:text-2xl font-semibold mb-2">Visual AI Generator</h2>
            <p className="text-text-secondary text-sm sm:text-base mb-4 sm:mb-6">
              Describe what you want to build and I'll generate beautiful visualizations instantly.
            </p>
            <div className="grid grid-cols-2 gap-2 sm:gap-3 text-left">
              <div className="p-2.5 sm:p-3 rounded-lg bg-bg-secondary border border-white/5">
                <p className="text-accent-primary text-sm font-medium mb-1">📈 Charts</p>
                <p className="text-text-muted text-xs">Line, bar, pie charts</p>
              </div>
              <div className="p-2.5 sm:p-3 rounded-lg bg-bg-secondary border border-white/5">
                <p className="text-accent-secondary text-sm font-medium mb-1">🗓️ Timelines</p>
                <p className="text-text-muted text-xs">Roadmaps & journeys</p>
              </div>
              <div className="p-2.5 sm:p-3 rounded-lg bg-bg-secondary border border-white/5">
                <p className="text-green-500 text-sm font-medium mb-1">📊 Cards</p>
                <p className="text-text-muted text-xs">Stats & dashboards</p>
              </div>
              <div className="p-2.5 sm:p-3 rounded-lg bg-bg-secondary border border-white/5">
                <p className="text-yellow-500 text-sm font-medium mb-1">📋 Tables</p>
                <p className="text-text-muted text-xs">Data tables</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Iframe Renderer */}
      <iframe
        ref={iframeRef}
        title="Visual Output"
        sandbox="allow-scripts"
        className="w-full h-full border-0"
      />
    </div>
  );
}
