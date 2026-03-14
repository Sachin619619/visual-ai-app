import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, RefreshCw, Download, Code, X, Copy, Check, Maximize2, Minimize2, FileCode, FileImage, Layout, Square, Layers, Sparkles, Wand2, FileType, Undo2, Redo2, Sun, Moon, Keyboard, Bookmark, Clipboard, Palette, Shuffle, MoreHorizontal, FileCode2 } from 'lucide-react';
import { createSandboxContent } from '../lib/sanitizer';
import { ModelProvider, PreviewTheme, StyleFrame } from '../types';
import { AI_PROVIDERS } from '../lib/ai-providers';
import html2canvas from 'html2canvas';

interface VisualRendererProps {
  html: string;
  isLoading: boolean;
  onClear: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  model?: ModelProvider;
  styleFrame?: StyleFrame;
  onStyleFrameChange?: (frame: StyleFrame) => void;
  onQuickGenerate?: (prompt: string) => void;
  onRefinePrompt?: (originalPrompt: string, refinement: string) => void;
}

// Quick start prompts for empty state cards
const QUICK_PROMPTS = [
  { key: 'charts', prompt: 'Create a beautiful interactive line chart showing monthly revenue data for 2024 with tooltips and a legend', label: '📈 Charts' },
  { key: 'radar', prompt: 'Create a radar chart showing skills analysis with speed, reliability, comfort, safety metrics', label: '🕸️ Radar' },
  { key: 'polar', prompt: 'Create a polar area chart showing regional distribution of users across continents', label: '🌊 Polar' },
  { key: 'timeline', prompt: 'Build a vertical timeline component showing a product launch roadmap with milestones and dates', label: '🗓️ Timelines' },
  { key: 'cards', prompt: 'Design a responsive grid of stat cards showing KPI metrics with icons, numbers and trend indicators', label: '📊 Cards' },
  { key: 'forms', prompt: 'Build a modern contact form with name, email, subject, message fields and a submit button with validation styling', label: '📋 Forms' },
  { key: 'landing', prompt: 'Design a complete landing page with hero, features section, pricing, testimonials, and footer', label: '🖥️ Landing' },
  { key: 'sidebar', prompt: 'Build a collapsible sidebar navigation with icons, labels, active states, and smooth expand/collapse animations', label: '📑 Sidebar' },
  { key: 'pricing', prompt: 'Create a pricing table with 3 tiers, monthly/yearly toggle, feature lists and CTA buttons', label: '💰 Pricing' },
  { key: 'dashboard', prompt: 'Create a dark-themed analytics dashboard with multiple widgets, charts and data tables', label: '📈 Dashboard' },
  { key: 'gallery', prompt: 'Design an image gallery with masonry layout, lightbox on click, and smooth hover animations', label: '🖼️ Gallery' },
  { key: 'profile', prompt: 'Create a user profile card with avatar, bio, social links, and skill tags', label: '👤 Profile' },
  { key: 'carousel', prompt: 'Build an auto-scrolling image carousel with navigation dots and prev/next buttons', label: '🎠 Carousel' },
  { key: 'animation', prompt: 'Create an animated loading skeleton with shimmer effect for content placeholders', label: '⚡ Loading' },
  { key: 'table', prompt: 'Build a responsive data table with sortable columns, pagination, and search input', label: '📋 Table' },
  { key: 'tabs', prompt: 'Create an interactive tabs component with multiple tabs and an accordion FAQ section', label: '🔽 Tabs' },
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

export function VisualRenderer({ html, isLoading, onClear, onUndo, onRedo, model, styleFrame = 'card', onStyleFrameChange, onQuickGenerate, onRefinePrompt }: VisualRendererProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showStyleFrames, setShowStyleFrames] = useState(false);
  const [showRefine, setShowRefine] = useState(false);
  const [refinementText, setRefinementText] = useState('');
  const [previewTheme, setPreviewTheme] = useState<PreviewTheme>('dark');
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [exportQuality, setExportQuality] = useState(2);
  const [showColorSchemes, setShowColorSchemes] = useState(false);
  const [colorScheme, setColorScheme] = useState('violet');
  const [isRemixing, setIsRemixing] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Color scheme definitions for instant theme switching
  const COLOR_SCHEMES = [
    { id: 'violet', name: 'Violet', primary: '#8b5cf6', secondary: '#06b6d4' },
    { id: 'rose', name: 'Rose', primary: '#f43f5e', secondary: '#f97316' },
    { id: 'emerald', name: 'Emerald', primary: '#10b981', secondary: '#06b6d4' },
    { id: 'amber', name: 'Amber', primary: '#f59e0b', secondary: '#ef4444' },
    { id: 'blue', name: 'Blue', primary: '#3b82f6', secondary: '#8b5cf6' },
    { id: 'pink', name: 'Pink', primary: '#ec4899', secondary: '#a855f7' },
  ];

  // Apply color scheme to generated HTML
  const applyColorScheme = (schemeId: string) => {
    if (!iframeRef.current) return;
    const iframe = iframeRef.current;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) return;

    const scheme = COLOR_SCHEMES.find(s => s.id === schemeId);
    if (!scheme) return;

    // Create a style element to override colors
    const styleId = 'color-scheme-override';
    let styleEl = iframeDoc.getElementById(styleId);
    if (!styleEl) {
      styleEl = iframeDoc.createElement('style');
      styleEl.id = styleId;
      iframeDoc.head.appendChild(styleEl);
    }

    styleEl.textContent = `
      :root {
        --accent-primary: ${scheme.primary};
        --accent-secondary: ${scheme.secondary};
      }
      .bg-gradient-to-r { background: linear-gradient(135deg, ${scheme.primary}, ${scheme.secondary}) !important; }
      .text-accent-primary { color: ${scheme.primary} !important; }
      .bg-accent-primary { background-color: ${scheme.primary} !important; }
      .border-accent-primary { border-color: ${scheme.primary} !important; }
      button, .btn { background-color: ${scheme.primary} !important; }
      [style*="background: linear-gradient"] { background: linear-gradient(135deg, ${scheme.primary}, ${scheme.secondary}) !important; }
    `;
    setColorScheme(schemeId);
    setShowColorSchemes(false);
  };

  // Keyboard shortcuts list
  const KEYBOARD_SHORTCUTS = [
    { keys: ['⌘', 'Enter'], description: 'Generate UI' },
    { keys: ['⌘', 'L'], description: 'Clear canvas' },
    { keys: ['⌘', 'Z'], description: 'Undo' },
    { keys: ['⌘', 'Shift', 'Z'], description: 'Redo' },
    { keys: ['⌘', 'Shift', 'C'], description: 'Toggle code view' },
    { keys: ['Esc'], description: 'Exit fullscreen' },
  ];

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
  const handleExportPNG = async (e?: React.MouseEvent) => {
    // If shift is held, cycle through quality
    if (e?.shiftKey) {
      setExportQuality(prev => prev >= 3 ? 1 : prev + 1);
      return;
    }
    
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
        scale: exportQuality,
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

  // Export as SVG
  const handleExportSVG = async () => {
    if (!iframeRef.current) return;
    try {
      const iframe = iframeRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) return;
      
      // Get the body content
      const bodyContent = iframeDoc.body;
      const innerHTML = bodyContent.innerHTML;
      
      // Create SVG container
      const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
  <foreignObject width="100%" height="100%">
    <div xmlns="http://www.w3.org/1999/xhtml" style="
      background: #0f0f23;
      width: 100%;
      height: 100%;
      font-family: system-ui, -apple-system, sans-serif;
    ">
      ${innerHTML}
    </div>
  </foreignObject>
</svg>`;
      
      const blob = new Blob([svgContent], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `visual-ai-${Date.now()}.svg`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export SVG:', err);
    }
  };

  // Export as React Component
  const handleExportReact = () => {
    if (!html) return;
    
    // Convert HTML to a simple React functional component
    const componentName = 'GeneratedComponent';
    const reactCode = `import React from 'react';

export default function ${componentName}() {
  return (
    <div dangerouslySetInnerHTML={{ __html: \`${html.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\` }} />
  );
}
`;
    
    const blob = new Blob([reactCode], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${componentName}.jsx`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export as standalone CSS file
  const handleExportCSS = () => {
    if (!html) return;
    
    // Extract CSS from the HTML (look for style tags and Tailwind classes converted to styles)
    const styleMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
    const inlineStyles = html.match(/style="([^"]*)"/g);
    
    let cssContent = `/* Generated by Visual AI */
/* Base styles */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #0f0f23;
  color: #f8fafc;
  min-height: 100vh;
}

/* Custom styles from generated UI */
`;
    
    // Add any inline styles found
    if (inlineStyles && inlineStyles.length > 0) {
      cssContent += `\n/* Inline styles extracted from HTML */\n`;
      inlineStyles.forEach((style, index) => {
        const styleValue = style.match(/style="([^"]*)"/)?.[1];
        if (styleValue) {
          cssContent += `.inline-style-${index} { ${styleValue} }\n`;
        }
      });
    }
    
    // Add any content from style tags
    if (styleMatch && styleMatch[1]) {
      cssContent += `\n/* Styles from <style> tags */\n${styleMatch[1]}\n`;
    }
    
    const blob = new Blob([cssContent], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `visual-ai-styles.css`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Generate a variation/remix of the current design
  const handleRemix = async () => {
    if (!html || isRemixing) return;
    setIsRemixing(true);
    
    try {
      // Use the iframe content to create a variation
      const remixPrompt = `Create a variation of this UI design with different colors, layout, or styling. Keep the same type of component but make it visually distinct. Make it dark-themed with modern styling using Tailwind CSS.`;
      
      // Call the parent generation function with a remix prompt
      if (onQuickGenerate) {
        onQuickGenerate(remixPrompt);
      }
    } catch (error) {
      console.error('Remix failed:', error);
    } finally {
      setIsRemixing(false);
    }
  };

  // Copy to clipboard as image
  const handleCopyToClipboard = async () => {
    if (!iframeRef.current) return;
    try {
      const iframe = iframeRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) return;
      
      const bodyContent = iframeDoc.body.cloneNode(true) as HTMLElement;
      
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.style.background = previewTheme === 'dark' ? '#0f0f23' : '#ffffff';
      container.appendChild(bodyContent);
      document.body.appendChild(container);
      
      const canvas = await html2canvas(container, {
        backgroundColor: previewTheme === 'dark' ? '#0f0f23' : '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
      });
      
      document.body.removeChild(container);
      
      canvas.toBlob(async (blob) => {
        if (blob) {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          setCopiedImage(true);
          setTimeout(() => setCopiedImage(false), 2000);
        }
      });
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  // Save as template
  const handleSaveTemplate = () => {
    if (!templateName.trim() || !html) return;
    const templates = JSON.parse(localStorage.getItem('visual-ai-templates') || '[]');
    templates.push({
      id: Date.now().toString(),
      name: templateName.trim(),
      html,
      createdAt: new Date().toISOString()
    });
    localStorage.setItem('visual-ai-templates', JSON.stringify(templates));
    setTemplateName('');
    setShowSaveTemplate(false);
  };

  // Load saved templates
  const savedTemplates = JSON.parse(localStorage.getItem('visual-ai-templates') || '[]');

  // Delete saved template
  const handleDeleteTemplate = (id: string) => {
    const templates = JSON.parse(localStorage.getItem('visual-ai-templates') || '[]');
    const filtered = templates.filter((t: any) => t.id !== id);
    localStorage.setItem('visual-ai-templates', JSON.stringify(filtered));
  };

  useEffect(() => {
    if (html && iframeRef.current) {
      try {
        const content = createSandboxContent(html, previewTheme);
        const iframe = iframeRef.current;
        iframe.srcdoc = content;
        setError(null);
      } catch (err) {
        setError('Failed to render content');
        console.error(err);
      }
    }
  }, [html, previewTheme]);

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
    <div className={`flex-1 h-full w-full flex flex-col bg-bg-primary relative overflow-hidden pt-12 sm:pt-16 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`} style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 48px)' }}>
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

      {/* Toolbar - compact toolbar for mobile with proper spacing and overflow handling */}
      <div className={`absolute top-2 right-2 sm:top-4 sm:right-4 z-10 flex flex-wrap justify-end gap-1 max-w-[calc(100vw-56px)] xs:max-w-[calc(100vw-60px)] sm:max-w-none overflow-x-auto py-1 ${isFullscreen ? 'right-16' : ''}`}>
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
                className={`p-2.5 sm:p-2.5 rounded-xl backdrop-blur-md transition-all min-h-[40px] min-w-[40px] flex items-center justify-center ${
                  showStyleFrames ? 'bg-accent-primary/20 text-accent-primary' : 'bg-bg-secondary/90 text-text-secondary hover:text-text-primary hover:scale-105 active:scale-95'
                }`}
                title="Style Frame"
              >
                <Layout className="w-4 h-4 sm:w-5 sm:h-5" />
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
            {/* Undo Button */}
            {onUndo && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={onUndo}
                className="p-3 sm:p-2.5 rounded-xl bg-bg-secondary/90 backdrop-blur-md text-text-secondary hover:text-text-primary transition-all min-h-[44px] min-w-[44px] flex items-center justify-center hover:scale-105 active:scale-95"
                title="Undo (⌘+Z)"
              >
                <Undo2 className="w-5 h-5 sm:w-5 sm:h-5" />
              </motion.button>
            )}
            {/* Redo Button - hidden on small mobile */}
            {onRedo && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={onRedo}
                className="hidden sm:flex p-3 sm:p-2.5 rounded-xl bg-bg-secondary/90 backdrop-blur-md text-text-secondary hover:text-text-primary transition-all min-h-[44px] min-w-[44px] items-center justify-center hover:scale-105 active:scale-95"
                title="Redo (⌘+Shift+Z)"
              >
                <Redo2 className="w-5 h-5 sm:w-5 sm:h-5" />
              </motion.button>
            )}
            {/* Theme Toggle Button */}
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={() => setPreviewTheme(prev => prev === 'dark' ? 'light' : 'dark')}
              className="p-3 sm:p-2.5 rounded-xl bg-bg-secondary/90 backdrop-blur-md text-text-secondary hover:text-text-primary transition-all min-h-[44px] min-w-[44px] flex items-center justify-center hover:scale-105 active:scale-95"
              title={previewTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {previewTheme === 'dark' ? <Sun className="w-5 h-5 sm:w-5 sm:h-5" /> : <Moon className="w-5 h-5 sm:w-5 sm:h-5" />}
            </motion.button>
            {/* Color Scheme Button with Dropdown */}
            <div className="relative">
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={() => setShowColorSchemes(!showColorSchemes)}
                className={`p-2.5 sm:p-2.5 rounded-xl backdrop-blur-md transition-all min-h-[44px] min-w-[44px] flex items-center justify-center ${
                  showColorSchemes ? 'bg-accent-primary/20 text-accent-primary' : 'bg-bg-secondary/90 text-text-secondary hover:text-text-primary hover:scale-105 active:scale-95'
                }`}
                title="Color Scheme"
              >
                <Palette className="w-5 h-5 sm:w-5 sm:h-5" />
              </motion.button>
              {/* Color Scheme Dropdown */}
              {showColorSchemes && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="absolute top-full right-0 mt-2 p-2 bg-bg-secondary/95 backdrop-blur-md rounded-xl border border-white/10 shadow-xl z-20 min-w-[160px]"
                >
                  <p className="text-xs text-text-muted px-2 pb-2 mb-2 border-b border-white/5">Color Scheme</p>
                  {COLOR_SCHEMES.map((scheme) => (
                    <button
                      key={scheme.id}
                      onClick={() => applyColorScheme(scheme.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        colorScheme === scheme.id 
                          ? 'bg-accent-primary/20 text-accent-primary' 
                          : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
                      }`}
                    >
                      <div className="flex gap-0.5">
                        <div className="w-4 h-4 rounded-full" style={{ background: scheme.primary }} />
                        <div className="w-4 h-4 rounded-full -ml-2" style={{ background: scheme.secondary }} />
                      </div>
                      {scheme.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
            {/* Keyboard Shortcuts Help Button - hidden on mobile, shown in more menu */}
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={() => setShowShortcuts(true)}
              className="hidden md:flex p-3 sm:p-2.5 rounded-xl bg-bg-secondary/90 backdrop-blur-md text-text-secondary hover:text-text-primary transition-all min-h-[44px] min-w-[44px] items-center justify-center hover:scale-105 active:scale-95"
              title="Keyboard Shortcuts"
            >
              <Keyboard className="w-5 h-5 sm:w-5 sm:h-5" />
            </motion.button>
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={() => setShowCode(!showCode)}
              className={`p-2.5 sm:p-2.5 rounded-xl backdrop-blur-md transition-all min-h-[40px] min-w-[40px] flex items-center justify-center ${
                showCode ? 'bg-accent-primary/20 text-accent-primary' : 'bg-bg-secondary/90 text-text-secondary hover:text-text-primary hover:scale-105 active:scale-95'
              }`}
              title="Toggle Code Preview"
            >
              <Code className="w-5 h-5 sm:w-5 sm:h-5" />
            </motion.button>
            {/* Mobile More Menu Button */}
            <div className="relative md:hidden">
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className={`p-2.5 rounded-xl backdrop-blur-md transition-all min-h-[40px] min-w-[40px] flex items-center justify-center ${
                  showMoreMenu ? 'bg-accent-primary/20 text-accent-primary' : 'bg-bg-secondary/90 text-text-secondary hover:text-text-primary hover:scale-105 active:scale-95'
                }`}
                title="More Options"
              >
                <MoreHorizontal className="w-5 h-5" />
              </motion.button>
              {/* More Menu Dropdown */}
              {showMoreMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="absolute top-full right-0 mt-2 p-2 bg-bg-secondary/95 backdrop-blur-md rounded-xl border border-white/10 shadow-xl z-30 min-w-[180px]"
                >
                  <button
                    onClick={() => { setShowShortcuts(true); setShowMoreMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-secondary hover:bg-white/5 hover:text-text-primary transition-colors"
                  >
                    <Keyboard className="w-4 h-4" /> Keyboard Shortcuts
                  </button>
                  <button
                    onClick={() => { setShowSaveTemplate(true); setShowMoreMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-secondary hover:bg-white/5 hover:text-text-primary transition-colors"
                  >
                    <Bookmark className="w-4 h-4" /> Save Template
                  </button>
                  <button
                    onClick={() => { setShowTemplates(true); setShowMoreMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-secondary hover:bg-white/5 hover:text-text-primary transition-colors"
                  >
                    <Layout className="w-4 h-4" /> Templates ({savedTemplates.length})
                  </button>
                </motion.div>
              )}
            </div>
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={handleCopyCode}
              className="p-3 sm:p-2.5 rounded-xl bg-bg-secondary/90 backdrop-blur-md text-text-secondary hover:text-text-primary transition-all min-h-[44px] min-w-[44px] flex items-center justify-center hover:scale-105 active:scale-95"
              title={copied ? "Copied!" : "Copy HTML"}
            >
              {copied ? <Check className="w-5 h-5 sm:w-5 sm:h-5 text-green-400" /> : <FileCode className="w-5 h-5 sm:w-5 sm:h-5" />}
            </motion.button>
            <div className="relative">
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={handleExportPNG}
                className="p-3 sm:p-2.5 rounded-xl bg-bg-secondary/90 backdrop-blur-md text-text-secondary hover:text-text-primary transition-all min-h-[44px] min-w-[44px] flex items-center justify-center hover:scale-105 active:scale-95"
                title={`Export as PNG (${exportQuality}x quality)`}
              >
                <FileImage className="w-5 h-5 sm:w-5 sm:h-5" />
              </motion.button>
              <div className="absolute -bottom-1 -right-1 text-[8px] bg-accent-primary/80 text-white px-1 rounded hidden sm:block">{exportQuality}x</div>
            </div>
            {/* Export options hidden on mobile - in more menu */}
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={handleExportSVG}
              className="hidden md:flex p-3 sm:p-2.5 rounded-xl bg-bg-secondary/90 backdrop-blur-md text-text-secondary hover:text-text-primary transition-all min-h-[44px] min-w-[44px] items-center justify-center hover:scale-105 active:scale-95"
              title="Export as SVG"
            >
              <span className="w-5 h-5 sm:w-5 sm:h-5 flex items-center justify-center text-xs font-bold">SVG</span>
            </motion.button>
            {/* Export React - hidden on mobile */}
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={handleExportReact}
              className="hidden md:flex p-3 sm:p-2.5 rounded-xl bg-bg-secondary/90 backdrop-blur-md text-text-secondary hover:text-text-primary transition-all min-h-[44px] min-w-[44px] items-center justify-center hover:scale-105 active:scale-95"
              title="Export as React"
            >
              <FileType className="w-5 h-5 sm:w-5 sm:h-5" />
            </motion.button>
            {/* Export CSS - hidden on mobile */}
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={handleExportCSS}
              className="hidden md:flex p-3 sm:p-2.5 rounded-xl bg-bg-secondary/90 backdrop-blur-md text-text-secondary hover:text-text-primary transition-all min-h-[44px] min-w-[44px] items-center justify-center hover:scale-105 active:scale-95"
              title="Export as CSS"
            >
              <FileCode2 className="w-5 h-5 sm:w-5 sm:h-5" />
            </motion.button>
            {/* Copy to Clipboard as Image */}
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={handleCopyToClipboard}
              className="p-3 sm:p-2.5 rounded-xl bg-bg-secondary/90 backdrop-blur-md text-text-secondary hover:text-text-primary transition-all min-h-[44px] min-w-[44px] flex items-center justify-center hover:scale-105 active:scale-95"
              title={copiedImage ? "Copied!" : "Copy as Image"}
            >
              {copiedImage ? <Check className="w-5 h-5 sm:w-5 sm:h-5 text-green-400" /> : <Clipboard className="w-5 h-5 sm:w-5 sm:h-5" />}
            </motion.button>
            {/* Save as Template - hidden on mobile, in more menu */}
            <div className="relative hidden md:block">
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={() => setShowSaveTemplate(!showSaveTemplate)}
                className={`p-3 sm:p-2.5 rounded-xl backdrop-blur-md transition-all min-h-[44px] min-w-[44px] flex items-center justify-center ${
                  showSaveTemplate ? 'bg-accent-primary/20 text-accent-primary' : 'bg-bg-secondary/90 text-text-secondary hover:text-text-primary hover:scale-105 active:scale-95'
                }`}
                title="Save as Template"
              >
                <Bookmark className="w-5 h-5 sm:w-5 sm:h-5" />
              </motion.button>
              {/* Save Template Dropdown */}
              {showSaveTemplate && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="absolute top-full right-0 mt-2 p-3 bg-bg-secondary/95 backdrop-blur-md rounded-xl border border-white/10 shadow-xl z-20 min-w-[200px]"
                >
                  <p className="text-xs text-text-muted mb-2">Save Current UI</p>
                  <input
                    type="text"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="Template name..."
                    className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-white/10 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary"
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveTemplate()}
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={handleSaveTemplate}
                      disabled={!templateName.trim()}
                      className="flex-1 px-3 py-2 rounded-lg bg-accent-primary text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setShowTemplates(!showTemplates)}
                      className="px-3 py-2 rounded-lg bg-white/10 text-text-secondary text-sm hover:bg-white/20 transition-colors"
                    >
                      Templates ({savedTemplates.length})
                    </button>
                  </div>
                  {/* Templates List */}
                  {showTemplates && savedTemplates.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/10 max-h-40 overflow-y-auto">
                      {savedTemplates.map((t: any) => (
                        <button
                          key={t.id}
                          onClick={() => {
                            // This would need to be handled by parent - for now just show notification
                            setShowSaveTemplate(false);
                            setShowTemplates(false);
                          }}
                          className="w-full text-left px-2 py-2 rounded-lg text-sm text-text-secondary hover:bg-white/5 hover:text-text-primary transition-colors truncate"
                        >
                          {t.name}
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </div>
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={() => setShowRefine(true)}
              className="p-3 sm:p-2.5 rounded-xl bg-bg-secondary/90 backdrop-blur-md text-text-secondary hover:text-text-primary transition-all min-h-[44px] min-w-[44px] flex items-center justify-center hover:scale-105 active:scale-95"
              title="Refine Prompt"
            >
              <Wand2 className="w-5 h-5 sm:w-5 sm:h-5" />
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
            {/* Remix/Variation Button */}
            {html && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={handleRemix}
                disabled={isRemixing}
                className="p-3 sm:p-2.5 rounded-xl bg-bg-secondary/90 backdrop-blur-md text-text-secondary hover:text-accent-primary transition-all min-h-[44px] min-w-[44px] flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-50"
                title={isRemixing ? "Generating variation..." : "Generate Variation"}
              >
                <Shuffle className={`w-5 h-5 sm:w-5 sm:h-5 ${isRemixing ? 'animate-spin' : ''}`} />
              </motion.button>
            )}
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-3 sm:p-2.5 rounded-xl bg-bg-secondary/90 backdrop-blur-md text-text-secondary hover:text-text-primary transition-all min-h-[44px] min-w-[44px] flex items-center justify-center hover:scale-105 active:scale-95"
              title={isFullscreen ? "Exit Fullscreen (Esc)" : "Fullscreen Preview"}
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5 sm:w-5 sm:h-5" /> : <Maximize2 className="w-5 h-5 sm:w-5 sm:h-5" />}
            </motion.button>
            {/* Keyboard Shortcuts - hidden on mobile, in more menu */}
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={() => setShowShortcuts(true)}
              className="hidden md:flex p-3 sm:p-2.5 rounded-xl bg-bg-secondary/90 backdrop-blur-md text-text-secondary hover:text-text-primary transition-all min-h-[44px] min-w-[44px] flex items-center justify-center hover:scale-105 active:scale-95"
              title="Keyboard Shortcuts"
            >
              <Keyboard className="w-5 h-5 sm:w-5 sm:h-5" />
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

      {/* Refine Prompt Modal */}
      <AnimatePresence>
        {showRefine && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/70" onClick={() => setShowRefine(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative bg-bg-secondary rounded-xl border border-white/10 w-full max-w-md overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-white/5">
                <h3 className="font-heading text-lg font-semibold flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-accent-primary" />
                  Refine Prompt
                </h3>
                <button
                  onClick={() => setShowRefine(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="text-sm text-text-secondary mb-2 block font-medium">How would you like to modify it?</label>
                  <textarea
                    value={refinementText}
                    onChange={(e) => setRefinementText(e.target.value)}
                    placeholder="e.g., Make it darker, add more colors, change to glassmorphism..."
                    className="input-field h-24 resize-none text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowRefine(false)}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-bg-tertiary text-text-secondary hover:text-text-primary transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (refinementText.trim() && onRefinePrompt) {
                        onRefinePrompt(refinementText, refinementText);
                        setRefinementText('');
                        setShowRefine(false);
                      }
                    }}
                    disabled={!refinementText.trim()}
                    className="flex-1 btn-primary disabled:opacity-50"
                  >
                    Generate
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard Shortcuts Modal */}
      <AnimatePresence>
        {showShortcuts && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowShortcuts(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-bg-secondary rounded-xl border border-white/10 w-full max-w-sm overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-white/5">
                <h3 className="font-heading text-lg font-semibold flex items-center gap-2">
                  <Keyboard className="w-5 h-5 text-accent-primary" />
                  Keyboard Shortcuts
                </h3>
                <button
                  onClick={() => setShowShortcuts(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 space-y-3">
                {KEYBOARD_SHORTCUTS.map((shortcut, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">{shortcut.description}</span>
                    <div className="flex gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <kbd
                          key={keyIndex}
                          className="px-2 py-1 text-xs font-mono bg-bg-tertiary border border-white/10 rounded-md text-text-primary"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
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
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center max-w-[280px] xs:max-w-xs sm:max-w-md px-3 sm:px-4"
          >
            {/* Animated gradient orb */}
            <div className="relative mb-4 sm:mb-6 mx-auto w-20 h-20 sm:w-32 sm:h-32">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-accent-primary/30 to-accent-secondary/30 blur-2xl animate-pulse" />
              <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 flex items-center justify-center border border-white/10 backdrop-blur-sm">
                <span className="text-3xl sm:text-5xl animate-bounce">🎨</span>
              </div>
            </div>
            <h2 className="font-heading text-lg sm:text-2xl font-semibold mb-2 gradient-text">Visual AI Generator</h2>
            <p className="text-text-secondary text-xs sm:text-base mb-4 sm:mb-6">
              Describe what you want to build and I'll generate beautiful visualizations instantly.
            </p>
            <div className="grid grid-cols-3 xs:grid-cols-3 gap-1 sm:gap-2 sm:grid-cols-4 text-left max-w-sm xs:max-w-md mx-auto">
              {QUICK_PROMPTS.slice(0, 12).map((item, index) => (
                <motion.button
                  key={item.key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onQuickGenerate?.(item.prompt)}
                  disabled={isLoading}
                  className="p-1.5 sm:p-3 rounded-lg sm:rounded-xl bg-bg-secondary/80 border border-white/5 hover:border-accent-primary/50 hover:bg-accent-primary/10 transition-all cursor-pointer disabled:opacity-50 group hover:scale-[1.02] active:scale-[0.98] min-h-[48px] sm:min-h-[70px] flex flex-col justify-center"
                >
                  <p className="text-accent-primary text-[9px] sm:text-xs font-medium group-hover:text-accent-secondary transition-colors truncate">{item.label}</p>
                </motion.button>
              ))}
            </div>
            
            {/* Saved Templates Section */}
            {savedTemplates.length > 0 && (
              <div className="mt-8 max-w-sm mx-auto">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-text-secondary text-sm font-medium">📁 My Templates</h3>
                  <button 
                    onClick={() => {
                      if (confirm('Delete all saved templates?')) {
                        localStorage.removeItem('visual-ai-templates');
                      }
                    }}
                    className="text-text-muted hover:text-red-400 text-xs"
                  >
                    Clear all
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 text-left">
                  {savedTemplates.slice(0, 6).map((template: any, index: number) => (
                    <motion.div
                      key={template.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="relative group"
                    >
                      <button
                        onClick={() => {
                          const content = createSandboxContent(template.html, previewTheme);
                          if (iframeRef.current) {
                            iframeRef.current.srcdoc = content;
                          }
                        }}
                        className="w-full p-2.5 sm:p-3 rounded-xl bg-bg-secondary border border-white/5 hover:border-accent-primary/50 hover:bg-accent-primary/5 transition-all text-left cursor-pointer min-h-[60px] flex flex-col justify-between"
                      >
                        <p className="text-accent-primary text-xs font-medium truncate">{template.name}</p>
                        <p className="text-text-muted text-[10px]">Click to load</p>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTemplate(template.id);
                        }}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        ×
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
            
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
