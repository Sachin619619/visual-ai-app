import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, RefreshCw, Download, Code, X, Copy, Check, Maximize2, Minimize2, FileCode, Image, Layout, Square, Layers, Sparkles } from 'lucide-react';
import { createSandboxContent } from '../lib/sanitizer';
import { ModelProvider, StyleFrame } from '../types';
import { AI_PROVIDERS } from '../lib/ai-providers';
import html2canvas from 'html2canvas';

interface VisualRendererProps {
  html: string;
  isLoading: boolean;
  onClear: () => void;
  model?: ModelProvider;
  styleFrame?: StyleFrame;
  onStyleFrameChange?: (frame: StyleFrame) => void;
  onQuickGenerate?: (prompt: string) => void;
}

// Quick start prompts for empty state cards
const QUICK_PROMPTS = [
  { key: 'charts', prompt: 'Create a beautiful interactive line chart showing monthly revenue data for 2024 with tooltips and a legend', label: '📈 Charts' },
  { key: 'timeline', prompt: 'Build a vertical timeline component showing a product launch roadmap with milestones and dates', label: '🗓️ Timelines' },
  { key: 'cards', prompt: 'Design a responsive grid of stat cards showing KPI metrics with icons, numbers and trend indicators', label: '📊 Cards' },
  { key: 'forms', prompt: 'Build a modern contact form with name, email, subject, message fields and a submit button with validation styling', label: '📋 Forms' },
];

// Simple syntax highlighting for HTML
function highlightHTML(code: string): string {
  return code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/(&lt;\/?)([\w-]+)/g, '$1<span class="text-purple-400">$2</span>')
    .replace(/([\w-]+)=/g, '<span class="text-cyan-400">$1</span>=')
    .replace(/"([^"]*)"/g, '"<span class="text-green-400">$1</span>"')
    .replace(/(&gt;)/g, '<span class="text-yellow-400">$1</span>');
}

export function VisualRenderer({ html, isLoading, onClear, model, styleFrame = 'card', onStyleFrameChange, onQuickGenerate }: VisualRendererProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showStyleFrames, setShowStyleFrames] = useState(false);

  // Style frame options with icons and labels
  const STYLE_FRAMES: { id: StyleFrame; label: string; icon: React.ReactNode }[] = [
    { id: 'card', label: 'Card', icon: <Square className="w-4 h-4" /> },
    { id: 'modal', label: 'Modal', icon: <Layers className="w-4 h-4" /> },
    { id: 'fullwidth', label: 'Full', icon: <Maximize2 className="w-4 h-4" /> },
    { id: 'floating', label: 'Float', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'glass', label: 'Glass', icon: <Layout className="w-4 h-4" /> },
  ];

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

  // Export as PNG
  const handleExportPNG = async () => {
    if (!iframeRef.current) return;
    try {
      // Get the iframe document
      const iframe = iframeRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) return;
      
      // Clone the body content
      const bodyContent = iframeDoc.body.cloneNode(true) as HTMLElement;
      
      // Create a temporary container
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.style.background = '#0f0f23';
      container.appendChild(bodyContent);
      document.body.appendChild(container);
      
      // Use html2canvas on the content
      const canvas = await html2canvas(container, {
        backgroundColor: '#0f0f23',
        scale: 2,
        logging: false,
        useCORS: true,
      });
      
      // Clean up
      document.body.removeChild(container);
      
      // Download
      const link = document.createElement('a');
      link.download = `visual-ai-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Failed to export PNG:', err);
    }
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
    <div className={`flex-1 h-full lg:h-full w-full lg:w-auto flex flex-col bg-bg-primary relative overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Fullscreen Close Button */}
      {isFullscreen && (
        <button
          onClick={() => setIsFullscreen(false)}
          className="absolute top-4 right-16 z-50 p-2.5 bg-bg-secondary/80 backdrop-blur-glass rounded-lg text-text-secondary hover:text-text-primary transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          title="Exit Fullscreen (Esc)"
          style={{ top: 'env(safe-area-inset-top, 16px)' }}
        >
          <Minimize2 className="w-4 h-4" />
        </button>
      )}

      {/* Toolbar - optimized for mobile */}
      <div className={`absolute top-2 right-2 sm:top-4 sm:right-4 z-10 flex items-center gap-1.5 ${isFullscreen ? 'right-16' : ''}`}>
        {html && (
          <>
            {/* Model Indicator Badge - hidden on very small screens */}
            {model && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="hidden xs:flex px-3 py-2 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl bg-bg-secondary/90 backdrop-blur-md text-xs text-text-muted items-center gap-1.5"
                title={`Generated with ${AI_PROVIDERS[model]?.name || model}`}
              >
                <span>{AI_PROVIDERS[model]?.icon}</span>
                <span className="hidden sm:inline">{AI_PROVIDERS[model]?.name || model}</span>
              </motion.div>
            )}
            {/* Style Frame Selector */}
            <div className="relative">
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={() => setShowStyleFrames(!showStyleFrames)}
                className={`p-3 sm:p-2.5 rounded-xl backdrop-blur-md transition-all min-h-[44px] min-w-[44px] flex items-center justify-center ${
                  showStyleFrames ? 'bg-accent-primary/20 text-accent-primary' : 'bg-bg-secondary/90 text-text-secondary hover:text-text-primary hover:scale-105 active:scale-95'
                }`}
                title="Style Frame"
              >
                <Layout className="w-5 h-5 sm:w-5 sm:h-5" />
              </motion.button>
              {/* Style Frame Dropdown */}
              {showStyleFrames && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="absolute top-full right-0 mt-2 p-2 bg-bg-secondary/95 backdrop-blur-md rounded-xl border border-white/10 shadow-xl z-20 min-w-[140px]"
                >
                  <p className="text-xs text-text-muted px-2 pb-2 mb-2 border-b border-white/5">Style Frame</p>
                  {STYLE_FRAMES.map((frame) => (
                    <button
                      key={frame.id}
                      onClick={() => {
                        onStyleFrameChange?.(frame.id);
                        setShowStyleFrames(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                        styleFrame === frame.id 
                          ? 'bg-accent-primary/20 text-accent-primary' 
                          : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
                      }`}
                    >
                      {frame.icon}
                      {frame.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={() => setShowCode(!showCode)}
              className={`p-3 sm:p-2.5 rounded-xl backdrop-blur-md transition-all min-h-[44px] min-w-[44px] flex items-center justify-center ${
                showCode ? 'bg-accent-primary/20 text-accent-primary' : 'bg-bg-secondary/90 text-text-secondary hover:text-text-primary hover:scale-105 active:scale-95'
              }`}
              title="Toggle Code Preview"
            >
              <Code className="w-5 h-5 sm:w-5 sm:h-5" />
            </motion.button>
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={handleCopyCode}
              className="p-3 sm:p-2.5 rounded-xl bg-bg-secondary/90 backdrop-blur-md text-text-secondary hover:text-text-primary transition-all min-h-[44px] min-w-[44px] flex items-center justify-center hover:scale-105 active:scale-95"
              title={copied ? "Copied!" : "Copy HTML"}
            >
              {copied ? <Check className="w-5 h-5 sm:w-5 sm:h-5 text-green-400" /> : <FileCode className="w-5 h-5 sm:w-5 sm:h-5" />}
            </motion.button>
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={handleExportPNG}
              className="p-3 sm:p-2.5 rounded-xl bg-bg-secondary/90 backdrop-blur-md text-text-secondary hover:text-text-primary transition-all min-h-[44px] min-w-[44px] flex items-center justify-center hover:scale-105 active:scale-95"
              title="Export as PNG"
            >
              <Image className="w-5 h-5 sm:w-5 sm:h-5" />
            </motion.button>
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={handleDownload}
              className="p-3 sm:p-2.5 rounded-xl bg-bg-secondary/90 backdrop-blur-md text-text-secondary hover:text-text-primary transition-all min-h-[44px] min-w-[44px] flex items-center justify-center hover:scale-105 active:scale-95"
              title="Download HTML"
            >
              <Download className="w-5 h-5 sm:w-5 sm:h-5" />
            </motion.button>
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-3 sm:p-2.5 rounded-xl bg-bg-secondary/90 backdrop-blur-md text-text-secondary hover:text-text-primary transition-all min-h-[44px] min-w-[44px] flex items-center justify-center hover:scale-105 active:scale-95"
              title={isFullscreen ? "Exit Fullscreen (Esc)" : "Fullscreen Preview"}
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5 sm:w-5 sm:h-5" /> : <Maximize2 className="w-5 h-5 sm:w-5 sm:h-5" />}
            </motion.button>
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={onClear}
              className="p-3 sm:p-2.5 rounded-xl bg-bg-secondary/90 backdrop-blur-md text-text-secondary hover:text-text-primary transition-all min-h-[44px] min-w-[44px] flex items-center justify-center hover:scale-105 active:scale-95"
              title="Clear (⌘+L)"
            >
              <Trash2 className="w-5 h-5 sm:w-5 sm:h-5" />
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
            className="absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4 z-20 max-h-[40vh] sm:max-h-64 bg-bg-secondary/95 backdrop-blur-glass rounded-xl border border-white/10 overflow-hidden"
          >
            <div className="flex items-center justify-between px-3 sm:px-4 py-2 border-b border-white/5">
              <span className="text-xs sm:text-sm text-text-secondary">Generated HTML</span>
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={handleCopyCode}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-text-secondary hover:text-text-primary transition-colors"
                  title="Copy Code"
                >
                  {copied ? <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" /> : <Copy className="w-3 h-3 sm:w-4 sm:h-4" />}
                </button>
                <button
                  onClick={() => setShowCode(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-text-secondary hover:text-text-primary transition-colors"
                >
                  <X className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
            <pre className="p-2 sm:p-4 overflow-auto max-h-[30vh] sm:max-h-44 text-xs font-mono whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: highlightHTML(html) }}>
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
            <div className="flex flex-col items-center gap-6 sm:gap-8">
              {/* Polished spinner with multiple rings */}
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-bg-tertiary" />
                <div className="absolute inset-0 w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-transparent border-t-accent-primary animate-spin" style={{ animationDuration: '1s' }} />
                <div className="absolute inset-1.5 w-17 h-17 sm:w-20 sm:h-20 rounded-full border-4 border-transparent border-b-accent-secondary animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
                <div className="absolute inset-3 w-14 h-14 sm:w-16 sm:h-16 rounded-full border-4 border-transparent border-t-cyan-400 animate-spin" style={{ animationDuration: '2s' }} />
                {/* Center dot */}
                <div className="absolute inset-0 m-auto w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-accent-primary animate-pulse" />
              </div>
              <div className="text-center px-4">
                <p className="text-lg sm:text-xl font-medium text-text-primary mb-2">Generating your visualization</p>
                <p className="text-sm sm:text-base text-text-muted animate-pulse">Crafting beautiful UI components...</p>
              </div>
              {/* Progress dots */}
              <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-accent-primary"
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
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center max-w-xs sm:max-w-md px-3 sm:px-4"
          >
            {/* Animated gradient orb */}
            <div className="relative mb-4 sm:mb-6 mx-auto w-24 h-24 sm:w-32 sm:h-32">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-accent-primary/30 to-accent-secondary/30 blur-2xl animate-pulse" />
              <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 flex items-center justify-center border border-white/10 backdrop-blur-sm">
                <span className="text-4xl sm:text-5xl animate-bounce">🎨</span>
              </div>
            </div>
            <h2 className="font-heading text-xl sm:text-2xl font-semibold mb-2 gradient-text">Visual AI Generator</h2>
            <p className="text-text-secondary text-sm sm:text-base mb-4 sm:mb-6">
              Describe what you want to build and I'll generate beautiful visualizations instantly.
            </p>
            <div className="grid grid-cols-2 gap-2 sm:gap-3 text-left max-w-sm mx-auto">
              {QUICK_PROMPTS.map((item, index) => (
                <motion.button
                  key={item.key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => onQuickGenerate?.(item.prompt)}
                  disabled={isLoading}
                  className="p-3 sm:p-4 rounded-xl bg-bg-secondary border border-white/5 hover:border-accent-primary/50 hover:bg-accent-primary/5 transition-all text-left cursor-pointer disabled:opacity-50 group hover:scale-[1.02] active:scale-[0.98] min-h-[80px] sm:min-h-[90px] flex flex-col justify-between"
                >
                  <p className="text-accent-primary text-sm font-medium group-hover:text-accent-secondary transition-colors">{item.label}</p>
                  <p className="text-text-muted text-xs">Click to generate</p>
                </motion.button>
              ))}
            </div>
            
            {/* Keyboard shortcut hint - always visible on mobile */}
            <p className="text-xs sm:text-sm text-text-muted mt-6 sm:mt-8 flex items-center justify-center gap-2">
              <span className="hidden sm:inline">
                <kbd className="px-2 py-1 bg-bg-tertiary rounded text-text-secondary">⌘</kbd>
                <span className="mx-1">+</span>
                <kbd className="px-2 py-1 bg-bg-tertiary rounded text-text-secondary">Enter</kbd>
                <span className="ml-2">to generate</span>
              </span>
              <span className="sm:hidden flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-bg-tertiary rounded text-text-secondary text-[10px]">⌘</kbd>
                <span className="text-[10px]">+</span>
                <kbd className="px-1.5 py-0.5 bg-bg-tertiary rounded text-text-secondary text-[10px]">↵</kbd>
              </span>
            </p>
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
