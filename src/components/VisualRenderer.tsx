import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, RefreshCw } from 'lucide-react';
import { createSandboxContent } from '../lib/sanitizer';

interface VisualRendererProps {
  html: string;
  isLoading: boolean;
  onClear: () => void;
}

export function VisualRenderer({ html, isLoading, onClear }: VisualRendererProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="flex-1 h-full bg-bg-primary relative overflow-hidden">
      {/* Toolbar */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        {html && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={onClear}
            className="p-2 rounded-lg bg-bg-secondary/80 backdrop-blur-glass text-text-secondary hover:text-text-primary transition-colors"
            title="Clear"
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        )}
      </div>

      {/* Loading State */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex items-center justify-center bg-bg-primary"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-bg-tertiary" />
                <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-accent-primary animate-spin" />
              </div>
              <p className="text-text-secondary animate-pulse">Generating your visualization...</p>
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
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center max-w-md"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 flex items-center justify-center">
              <span className="text-5xl">🎨</span>
            </div>
            <h2 className="font-heading text-2xl font-semibold mb-2">Visual AI Generator</h2>
            <p className="text-text-secondary mb-6">
              Describe what you want to build and I'll generate beautiful visualizations instantly.
            </p>
            <div className="grid grid-cols-2 gap-3 text-left">
              <div className="p-3 rounded-lg bg-bg-secondary border border-white/5">
                <p className="text-accent-primary text-sm font-medium mb-1">📈 Charts</p>
                <p className="text-text-muted text-xs">Line, bar, pie charts</p>
              </div>
              <div className="p-3 rounded-lg bg-bg-secondary border border-white/5">
                <p className="text-accent-secondary text-sm font-medium mb-1">🗓️ Timelines</p>
                <p className="text-text-muted text-xs">Roadmaps & journeys</p>
              </div>
              <div className="p-3 rounded-lg bg-bg-secondary border border-white/5">
                <p className="text-green-500 text-sm font-medium mb-1">📊 Cards</p>
                <p className="text-text-muted text-xs">Stats & dashboards</p>
              </div>
              <div className="p-3 rounded-lg bg-bg-secondary border border-white/5">
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
