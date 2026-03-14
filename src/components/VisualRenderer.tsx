import { memo, useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, RefreshCw, Download, Code, X, Copy, Check, Maximize2, Minimize2, FileCode, FileImage, Layout, Square, Layers, Sparkles, Wand2, FileType, Undo2, Redo2, Sun, Moon, Keyboard, Bookmark, Clipboard, Palette, Shuffle, MoreHorizontal, FileCode2, Share2, Upload, FileText, RotateCcw, Smartphone, Tablet, Monitor, MonitorPlay, Pause, Play, Star, GalleryHorizontal } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { createSandboxContent } from '../lib/sanitizer';
import { ModelProvider, PreviewTheme, StyleFrame, GenerationStats, ViewportSize } from '../types';
import { AI_PROVIDERS } from '../lib/ai-providers';
import html2canvas from 'html2canvas';

interface VisualRendererProps {
  html: string;
  isLoading: boolean;
  onClear: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onApplyCode?: (code: string) => void;
  model?: ModelProvider;
  styleFrame?: StyleFrame;
  onStyleFrameChange?: (frame: StyleFrame) => void;
  onQuickGenerate?: (prompt: string) => void;
  onRefinePrompt?: (originalPrompt: string, refinement: string) => void;
  onShare?: () => void;
  onExport?: () => void;
  onSaveFavorite?: () => void;
  onShowFavorites?: () => void;
  onShowGallery?: () => void;
  visualHistoryCount?: number;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  generationStats?: GenerationStats | null;
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
  { key: 'footer', prompt: 'Create a responsive website footer with company logo, navigation links, social media icons, newsletter signup, and copyright text', label: '🦶 Footer' },
  { key: 'error404', prompt: 'Design a creative 404 error page with illustration, "Page Not Found" message, helpful links, and a search box', label: '❌ 404 Page' },
  { key: 'settings', prompt: 'Create a settings page with sections for account, privacy, notifications, and theme toggle with form inputs and switches', label: '⚙️ Settings' },
  // New quick prompts
  { key: 'notification', prompt: 'Create a notification toast component with icon, message, close button, and slide-in animation', label: '🔔 Toast' },
  { key: 'upload', prompt: 'Build a drag-and-drop file upload zone with progress bar, file preview, and upload complete state', label: '📤 Upload' },
  { key: 'comments', prompt: 'Create a comments section with user avatars, timestamps, reply functionality, and nested replies', label: '💬 Comments' },
  { key: 'slider', prompt: 'Design a range slider component with value labels, custom thumb styling, and smooth interactions', label: '🎚️ Slider' },
  { key: 'progress', prompt: 'Build various progress indicators including linear bars, circular spinners, and percentage display', label: '⏳ Progress' },
  { key: 'datepicker', prompt: 'Create a stylish date picker calendar component with month navigation and date selection', label: '📅 Date Picker' },
  { key: 'skeleton', prompt: 'Create elegant skeleton loading placeholders with shimmer animation for content loading states', label: '✨ Skeleton' },
  { key: 'alert', prompt: 'Design alert banner components with different types (success, warning, error, info) and dismissible option', label: '⚠️ Alerts' },
  { key: 'widget', prompt: 'Build a beautiful clock widget showing current time, date, and a modern digital clock design', label: '🕐 Widget' },
  { key: 'badge', prompt: 'Design a collection of badges and tags with different colors, sizes, and subtle hover effects', label: '🏷️ Badges' },
  { key: 'files', prompt: 'Create a file browser interface with folder hierarchy, file icons, selection states, and grid/list view toggle', label: '📁 Files' },
  { key: 'modal', prompt: 'Create a beautiful modal dialog with overlay, header, body content, and action buttons with smooth animations', label: '💭 Modal' },
  { key: 'login', prompt: 'Create a modern login form with email, password fields, remember me checkbox, and login button', label: '🔑 Login' },
  { key: 'cart', prompt: 'Create a shopping cart component showing product items with images, quantities, prices, and a checkout summary', label: '🛒 Cart' },
  { key: 'product', prompt: 'Design a beautiful product card with image placeholder, product title, price, rating stars, and Add to Cart button', label: '🛍️ Product' },
  { key: 'portfolio', prompt: 'Build a personal portfolio section with project cards, skills tags, about section, and contact information', label: '💼 Portfolio' },
];

// Viewport size configurations
const VIEWPORTS: { id: ViewportSize; name: string; width: number; height: number; icon: React.ElementType }[] = [
  { id: 'mobile', name: 'Mobile', width: 375, height: 667, icon: Smartphone },
  { id: 'tablet', name: 'Tablet', width: 768, height: 1024, icon: Tablet },
  { id: 'desktop', name: 'Desktop', width: 1280, height: 800, icon: Monitor },
  { id: 'wide', name: 'Wide', width: 1920, height: 1080, icon: MonitorPlay },
];

// Enhanced syntax highlighting for HTML with line numbers
function highlightHTML(code: string): { html: string; lineCount: number } {
  const lines = code.split('\n');
  const lineCount = lines.length;
  
  const highlightedLines = lines.map(line => {
    let highlighted = line
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // HTML tags
      .replace(/(&lt;\/?)([\w-]+)/g, '$1<span class="text-purple-400 font-semibold">$2</span>')
      // Attributes
      .replace(/([\w-]+)=/g, '<span class="text-cyan-400">$1</span>=')
      // String values
      .replace(/"([^"]*)"/g, '"<span class="text-green-400">$1</span>"')
      .replace(/'([^']*)'/g, "'<span class=\"text-green-400\">$1</span>'")
      // Closing brackets
      .replace(/(&gt;)/g, '<span class="text-yellow-400">$1</span>')
      // Comments
      .replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="text-gray-500 italic">$1</span>')
      // CSS in style tags
      .replace(/([\w-]+):/g, '<span class="text-pink-400">$1</span>:');
    
    return highlighted;
  });
  
  return { html: highlightedLines.join('\n'), lineCount };
}

// Memoized Quick Start Button Component
const QuickStartButton = memo(({ item, index, onClick, disabled }: { 
  item: { key: string; prompt: string; label: string }; 
  index: number; 
  onClick: (prompt: string) => void;
  disabled: boolean;
}) => (
  <motion.button
    key={item.key}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
    onClick={() => onClick(item.prompt)}
    disabled={disabled}
    className="p-3 sm:p-3 rounded-xl bg-bg-secondary/80 border border-white/5 hover:border-accent-primary/50 hover:bg-accent-primary/10 transition-all cursor-pointer disabled:opacity-50 group hover:scale-[1.02] active:scale-[0.98] min-h-[64px] sm:min-h-[70px] flex flex-col justify-center gap-1"
  >
    <p className="text-accent-primary text-xs sm:text-xs font-medium group-hover:text-accent-secondary transition-colors truncate">{item.label}</p>
  </motion.button>
));

QuickStartButton.displayName = 'QuickStartButton';

// Memoized Toolbar Button Component
const ToolbarButton = memo(({ onClick, title, children, className = '', disabled = false }: {
  onClick?: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}) => (
  <motion.button
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    onClick={onClick}
    disabled={disabled}
    className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-bg-secondary/90 backdrop-blur-md text-text-secondary hover:text-text-primary transition-all min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center hover:scale-105 active:scale-95 ${className}`}
    title={title}
  >
    {children}
  </motion.button>
));

ToolbarButton.displayName = 'ToolbarButton';

// Memoized Quick Start Grid Component for better performance
const QuickStartGrid = memo(({ items, onClick, disabled }: {
  items: { key: string; prompt: string; label: string }[];
  onClick: (prompt: string) => void;
  disabled: boolean;
}) => (
  <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-2 text-left max-w-xs xs:max-w-sm sm:max-w-md mx-auto md:grid">
    {items.map((item, index) => (
      <QuickStartButton
        key={item.key}
        item={item}
        index={index}
        onClick={onClick}
        disabled={disabled}
      />
    ))}
  </div>
));

QuickStartGrid.displayName = 'QuickStartGrid';

export const VisualRenderer = memo(function VisualRenderer({ html, isLoading, onClear, onUndo, onRedo, onApplyCode, model, styleFrame = 'card', onStyleFrameChange, onQuickGenerate, onRefinePrompt, onShare, onExport, onSaveFavorite, onShowFavorites, onShowGallery, visualHistoryCount, theme = 'dark', onToggleTheme, generationStats }: VisualRendererProps) {
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
  const [showCopyMenu, setShowCopyMenu] = useState(false);
  const [viewportSize, setViewportSize] = useState<ViewportSize>('desktop');
  const [animationsPaused, setAnimationsPaused] = useState(false);
  const [showViewportSelector, setShowViewportSelector] = useState(false);
  const [isEditingCode, setIsEditingCode] = useState(false);
  const [editedCode, setEditedCode] = useState('');

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

  // Handle viewport change
  const handleViewportChange = (viewportId: ViewportSize) => {
    setViewportSize(viewportId);
    setShowViewportSelector(false);
  };

  // Toggle animations
  const toggleAnimations = () => {
    if (!iframeRef.current) return;
    const iframe = iframeRef.current;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) return;

    const styleId = 'animation-pause-override';
    let styleEl = iframeDoc.getElementById(styleId);
    if (!styleEl) {
      styleEl = iframeDoc.createElement('style');
      styleEl.id = styleId;
      iframeDoc.head.appendChild(styleEl);
    }

    if (animationsPaused) {
      // Resume animations
      styleEl.textContent = '';
      setAnimationsPaused(false);
    } else {
      // Pause animations
      styleEl.textContent = `
        *, *::before, *::after {
          animation-play-state: paused !important;
          transition-duration: 0s !important;
        }
      `;
      setAnimationsPaused(true);
    }
  };

  // Keyboard shortcuts list
  const KEYBOARD_SHORTCUTS = [
    { keys: ['⌘', 'Enter'], description: 'Generate UI' },
    { keys: ['⌘', 'L'], description: 'Clear canvas' },
    { keys: ['⌘', 'Z'], description: 'Undo' },
    { keys: ['⌘', 'Shift', 'Z'], description: 'Redo' },
    { keys: ['⌘', 'Shift', 'C'], description: 'Toggle code view' },
    { keys: ['⌘', 'S'], description: 'Share design' },
    { keys: ['⌘', 'E'], description: 'Export HTML' },
    { keys: ['⌘', 'P'], description: 'Export as PNG' },
    { keys: ['⌘', 'B'], description: 'Toggle theme' },
    { keys: ['⌘', '/'], description: 'Show shortcuts' },
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

  // Quick copy HTML only (extract body content)
  const handleCopyHTML = () => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const bodyContent = tempDiv.querySelector('body')?.innerHTML || html;
    navigator.clipboard.writeText(bodyContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Quick copy CSS only (extract from style tags)
  const handleCopyCSS = () => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const styles = tempDiv.querySelectorAll('style');
    let cssContent = '';
    styles.forEach(style => { cssContent += style.textContent + '\n'; });
    if (!cssContent) cssContent = '/* No inline CSS found in <style> tags */';
    navigator.clipboard.writeText(cssContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Quick copy JS only (extract from script tags)
  const handleCopyJS = () => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const scripts = tempDiv.querySelectorAll('script');
    let jsContent = '';
    scripts.forEach(script => { 
      if (script.textContent) jsContent += script.textContent + '\n'; 
    });
    if (!jsContent) jsContent = '// No inline JavaScript found in <script> tags';
    navigator.clipboard.writeText(jsContent);
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

  // Export as Vue Component
  const handleExportVue = () => {
    if (!html) return;
    
    // Convert HTML to a Vue 3 component
    const componentName = 'GeneratedComponent';
    const vueCode = `<template>
  <div v-html="htmlContent"></div>
</template>

<script setup>
const htmlContent = \`${html.replace(/`/g, '\\`').replace(/\$/g, '\\$').replace(/"/g, '\\"')}\`;
</script>

<style scoped>
/* Add component styles here */
</style>
`;
    
    const blob = new Blob([vueCode], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${componentName}.vue`;
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

  // Export as JSON with metadata
  const handleExportJSON = () => {
    if (!html) return;
    
    const jsonData = {
      content: html,
      metadata: {
        generatedAt: new Date().toISOString(),
        model: model || 'unknown',
        previewTheme,
        colorScheme,
        styleFrame,
        version: '1.0.0'
      }
    };
    
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `visual-ai-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export as PDF
  const handleExportPDF = async () => {
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
      
      // Create PDF with jsPDF
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2]
      });
      
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`visual-ai-${Date.now()}.pdf`);
    } catch (err) {
      console.error('Failed to export PDF:', err);
    }
  };

  // Reset all settings and clear localStorage
  const handleResetAll = () => {
    if (!confirm('Reset all settings and clear all data? This cannot be undone.')) return;
    
    // Clear all Visual AI localStorage keys
    const keysToRemove = [
      'visual-ai-session',
      'visual-ai-history',
      'visual-ai-draft',
      'visual-ai-api-key',
      'visual-ai-free-model',
      'visual-ai-dark-mode',
      'visual-ai-auto-enhance',
      'visual-ai-templates',
      'site_auth_visual'
    ];
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Reload the page to reset state
    window.location.reload();
  };

  // Load HTML from file
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleLoadFile = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content && iframeRef.current) {
        try {
          const sandboxedContent = createSandboxContent(content, previewTheme);
          iframeRef.current.srcdoc = sandboxedContent;
        } catch (err) {
          console.error('Failed to load file:', err);
        }
      }
    };
    reader.readAsText(file);
    
    // Reset input so same file can be selected again
    e.target.value = '';
  }, [previewTheme]);

  // Generate a variation/remix of the current design
  const handleRemix = async () => {
    if (!html || isRemixing) return;
    setIsRemixing(true);
    
    try {
      // Use the iframe content as context for creating a variation
      const remixPrompt = `Create a visually different variation of this UI design. Change the colors to a different palette, modify the layout slightly, and add your own creative touches. Keep the same type of component but make it feel fresh and unique. Make it dark-themed with modern styling using Tailwind CSS.`;
      
      // Call the parent generation function with context
      if (onQuickGenerate) {
        // We need to pass the current HTML as context - this will be handled by parent
        onQuickGenerate(remixPrompt);
      }
    } catch (error) {
      console.error('Remix failed:', error);
    } finally {
      setIsRemixing(false);
    }
  };

  // Duplicate current design (save a copy to gallery)
  const handleDuplicate = useCallback(() => {
    if (!html) return;
    
    // Add current design to visual history as a duplicate
    const entry = {
      id: Date.now().toString(),
      html,
      prompt: 'Duplicated design',
      model: model || 'openai',
      thumbnail: '',
      createdAt: Date.now()
    };
    
    // Save to localStorage directly for quick duplicate
    const savedVisualHistory = localStorage.getItem('visual-ai-visual-history');
    let history = savedVisualHistory ? JSON.parse(savedVisualHistory) : [];
    history = [entry, ...history].slice(0, 50);
    localStorage.setItem('visual-ai-visual-history', JSON.stringify(history));
    
    // Show feedback
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [html, model]);

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
        console.log('🎨 HTML received by VisualRenderer:', html.substring(0, 500));
        const content = createSandboxContent(html, previewTheme);
        console.log('🎨 Generated iframe content (first 500 chars):', content.substring(0, 500));
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
    <div className={`flex-1 h-full w-full flex flex-col bg-bg-primary overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Toolbar Header - Fixed overflow issues on small screens */}
      <div className="flex-none min-h-[56px] sm:h-14 flex items-center border-b border-white/8 bg-bg-secondary/90 backdrop-blur-md flex-shrink-0 shadow-sm px-1 overflow-x-hidden" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        {/* Spacer on mobile/tablet to avoid overlapping the fixed hamburger button (w-14 = 56px) */}
        <div className="w-14 flex-shrink-0 lg:hidden" />
        {/* Separator after spacer on mobile */}
        <div className="w-px h-6 bg-white/8 flex-shrink-0 lg:hidden" />
        {/* Scrollable toolbar - right-aligned, with proper overflow handling */}
        <div className="flex-1 flex items-center overflow-x-auto overflow-y-hidden scrollbar-hide min-w-0 px-1 sm:px-3 gap-0.5 sm:gap-1">
          {html && (
            <div className="flex items-center gap-1 sm:gap-1.5 ml-auto min-w-max">
            {/* Model Indicator Badge - hidden on very small screens */}
            {model && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="hidden xs:flex px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl bg-bg-secondary/90 backdrop-blur-md text-[10px] sm:text-xs text-text-muted items-center gap-1"
                title={`Generated with ${AI_PROVIDERS[model]?.name || model}`}
              >
                <span className="text-xs">{AI_PROVIDERS[model]?.icon}</span>
                <span className="hidden sm:inline">{AI_PROVIDERS[model]?.name || model}</span>
                {generationStats && (
                  <span className="ml-1 text-green-400" title={`Generated in ${generationStats.time}ms`}>
                    • {(generationStats.time / 1000).toFixed(1)}s
                  </span>
                )}
              </motion.div>
            )}
            {/* Essential actions always visible on mobile - Clear, Fullscreen, Share */}
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={onClear}
              className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-bg-secondary/90 backdrop-blur-md text-text-secondary hover:text-text-primary transition-all min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center hover:scale-105 active:scale-95"
              title="Clear (⌘+L)"
            >
              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.button>
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-bg-secondary/90 backdrop-blur-md text-text-secondary hover:text-text-primary transition-all min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center hover:scale-105 active:scale-95"
              title={isFullscreen ? "Exit Fullscreen (Esc)" : "Fullscreen Preview"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />}
            </motion.button>
            {onShare && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={onShare}
                className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-bg-secondary/90 backdrop-blur-md text-text-secondary hover:text-accent-primary transition-all min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center hover:scale-105 active:scale-95"
                title="Share via URL"
              >
                <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>
            )}
            {onExport && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={onExport}
                className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-bg-secondary/90 backdrop-blur-md text-text-secondary hover:text-accent-secondary transition-all min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center hover:scale-105 active:scale-95"
                title="Download HTML"
              >
                <FileType className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>
            )}
            {onToggleTheme && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={onToggleTheme}
                className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-bg-secondary/90 backdrop-blur-md text-text-secondary hover:text-yellow-400 transition-all min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center hover:scale-105 active:scale-95"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 sm:w-5 sm:h-5" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
              </motion.button>
            )}
            {onSaveFavorite && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={onSaveFavorite}
                className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-bg-secondary/90 backdrop-blur-md text-text-secondary hover:text-yellow-400 transition-all min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center hover:scale-105 active:scale-95"
                title="Save to Favorites (⌘+D)"
              >
                <Bookmark className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>
            )}
            {onShowFavorites && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={onShowFavorites}
                className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-bg-secondary/90 backdrop-blur-md text-text-secondary hover:text-yellow-400 transition-all min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center hover:scale-105 active:scale-95"
                title="View Favorites"
              >
                <Star className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>
            )}
            {onShowGallery && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={onShowGallery}
                className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-bg-secondary/90 backdrop-blur-md text-text-secondary hover:text-accent-primary transition-all min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center hover:scale-105 active:scale-95 relative"
                title="Design Gallery"
              >
                <GalleryHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
                {visualHistoryCount !== undefined && visualHistoryCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {visualHistoryCount > 9 ? '9+' : visualHistoryCount}
                  </span>
                )}
              </motion.button>
            )}
            {/* Copy menu with options */}
            <div className="relative">
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={() => setShowCopyMenu(!showCopyMenu)}
                className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-bg-secondary/90 backdrop-blur-md text-text-secondary hover:text-text-primary transition-all min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center hover:scale-105 active:scale-95"
                title="Copy options"
              >
                {copied ? <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" /> : <FileCode className="w-4 h-4 sm:w-5 sm:h-5" />}
              </motion.button>
              {/* Copy dropdown menu */}
              {showCopyMenu && html && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 top-full mt-2 w-40 bg-bg-secondary/95 backdrop-blur-md rounded-xl border border-white/10 shadow-xl py-1 z-50"
                >
                  <button
                    onClick={() => { handleCopyCode(); setShowCopyMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-secondary hover:bg-white/5 hover:text-text-primary transition-colors"
                  >
                    <FileCode className="w-4 h-4" /> Copy Full HTML
                  </button>
                  <button
                    onClick={() => { handleCopyHTML(); setShowCopyMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-secondary hover:bg-white/5 hover:text-text-primary transition-colors"
                  >
                    <span className="w-4 h-4 flex items-center justify-center text-[10px] font-bold text-orange-400">&lt;&gt;</span> Copy HTML Only
                  </button>
                  <button
                    onClick={() => { handleCopyCSS(); setShowCopyMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-secondary hover:bg-white/5 hover:text-text-primary transition-colors"
                  >
                    <span className="w-4 h-4 flex items-center justify-center text-[10px] font-bold text-blue-400">#</span> Copy CSS Only
                  </button>
                  <button
                    onClick={() => { handleCopyJS(); setShowCopyMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-secondary hover:bg-white/5 hover:text-text-primary transition-colors"
                  >
                    <span className="w-4 h-4 flex items-center justify-center text-[10px] font-bold text-yellow-400">JS</span> Copy JS Only
                  </button>
                </motion.div>
              )}
            </div>
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={handleExportPNG}
              className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-bg-secondary/90 backdrop-blur-md text-text-secondary hover:text-text-primary transition-all min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center hover:scale-105 active:scale-95"
              title={`Export as PNG (${exportQuality}x quality)`}
            >
              <FileImage className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.button>
            {/* Copy to Clipboard as Image */}
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={handleCopyToClipboard}
              className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-bg-secondary/90 backdrop-blur-md text-text-secondary hover:text-text-primary transition-all min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center hover:scale-105 active:scale-95"
              title={copiedImage ? "Copied!" : "Copy as Image"}
            >
              {copiedImage ? <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" /> : <Clipboard className="w-4 h-4 sm:w-5 sm:h-5" />}
            </motion.button>
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={handleDownload}
              className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-bg-secondary/90 backdrop-blur-md text-text-secondary hover:text-text-primary transition-all min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center hover:scale-105 active:scale-95"
              title="Download HTML"
            >
              <Download className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.button>
            {/* Style Frame Selector */}
            <div className="relative">
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={() => setShowStyleFrames(!showStyleFrames)}
                className={`p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl backdrop-blur-md transition-all min-h-[36px] min-w-[36px] sm:min-h-[40px] sm:min-w-[40px] flex items-center justify-center ${
                  showStyleFrames ? 'bg-accent-primary/20 text-accent-primary' : 'bg-bg-secondary/90 text-text-secondary hover:text-text-primary hover:scale-105 active:scale-95'
                }`}
                title="Style Frame"
              >
                <Layout className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
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
            {/* Viewport Size Selector - visible on all screens via more menu on mobile */}
            <div className="relative hidden md:block">
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={() => setShowViewportSelector(!showViewportSelector)}
                className={`p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl backdrop-blur-md transition-all min-h-[36px] min-w-[36px] sm:min-h-[40px] sm:min-w-[40px] items-center justify-center ${
                  showViewportSelector || viewportSize !== 'desktop' ? 'bg-accent-primary/20 text-accent-primary' : 'bg-bg-secondary/90 text-text-secondary hover:text-text-primary hover:scale-105 active:scale-95'
                }`}
                title="Viewport Size"
              >
                {viewportSize === 'mobile' ? <Smartphone className="w-3.5 h-3.5 sm:w-5 sm:h-5" /> : viewportSize === 'tablet' ? <Tablet className="w-3.5 h-3.5 sm:w-5 sm:h-5" /> : viewportSize === 'wide' ? <MonitorPlay className="w-3.5 h-3.5 sm:w-5 sm:h-5" /> : <Monitor className="w-3.5 h-3.5 sm:w-5 sm:h-5" />}
              </motion.button>
              {/* Viewport Dropdown */}
              {showViewportSelector && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="absolute top-full right-0 mt-2 p-2 bg-bg-secondary/95 backdrop-blur-md rounded-xl border border-white/10 shadow-xl z-20 min-w-[140px]"
                >
                  <p className="text-xs text-text-muted px-2 pb-2 mb-2 border-b border-white/5">Viewport</p>
                  {VIEWPORTS.map((viewport) => {
                    const Icon = viewport.icon;
                    return (
                      <button
                        key={viewport.id}
                        onClick={() => handleViewportChange(viewport.id)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                          viewportSize === viewport.id 
                            ? 'bg-accent-primary/20 text-accent-primary' 
                            : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {viewport.name}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </div>
            {/* Animation Toggle Button - visible on tablet+, mobile via more menu */}
            {html && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={toggleAnimations}
                className={`hidden md:flex p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl backdrop-blur-md transition-all min-h-[36px] min-w-[36px] sm:min-h-[40px] sm:min-w-[40px] items-center justify-center ${
                  animationsPaused ? 'bg-amber-500/20 text-amber-400' : 'bg-bg-secondary/90 text-text-secondary hover:text-text-primary hover:scale-105 active:scale-95'
                }`}
                title={animationsPaused ? "Resume Animations" : "Pause Animations"}
              >
                {animationsPaused ? <Play className="w-3.5 h-3.5 sm:w-5 sm:h-5" /> : <Pause className="w-3.5 h-3.5 sm:w-5 sm:h-5" />}
              </motion.button>
            )}
            {/* Undo Button */}
            {onUndo && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={onUndo}
                className="p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-bg-secondary/90 backdrop-blur-md text-text-secondary hover:text-text-primary transition-all min-h-[36px] min-w-[36px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center hover:scale-105 active:scale-95"
                title="Undo (⌘+Z)"
              >
                <Undo2 className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
              </motion.button>
            )}
            {/* Redo Button - hidden on small mobile */}
            {onRedo && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={onRedo}
                className="hidden xs:flex p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-bg-secondary/90 backdrop-blur-md text-text-secondary hover:text-text-primary transition-all min-h-[36px] min-w-[36px] sm:min-h-[44px] sm:min-w-[44px] items-center justify-center hover:scale-105 active:scale-95"
                title="Redo (⌘+Shift+Z)"
              >
                <Redo2 className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
              </motion.button>
            )}
            {/* Theme Toggle Button - visible on tablet+, mobile via more menu */}
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={() => setPreviewTheme(prev => prev === 'dark' ? 'light' : 'dark')}
              className="hidden md:flex p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-bg-secondary/90 backdrop-blur-md text-text-secondary hover:text-text-primary transition-all min-h-[36px] min-w-[36px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center hover:scale-105 active:scale-95"
              title={previewTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {previewTheme === 'dark' ? <Sun className="w-3.5 h-3.5 sm:w-5 sm:h-5" /> : <Moon className="w-3.5 h-3.5 sm:w-5 sm:h-5" />}
            </motion.button>
            {/* Color Scheme Button with Dropdown - visible on tablet+, mobile via more menu */}
            <div className="relative hidden md:block">
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={() => setShowColorSchemes(!showColorSchemes)}
                className={`p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl backdrop-blur-md transition-all min-h-[36px] min-w-[36px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center ${
                  showColorSchemes ? 'bg-accent-primary/20 text-accent-primary' : 'bg-bg-secondary/90 text-text-secondary hover:text-text-primary hover:scale-105 active:scale-95'
                }`}
                title="Color Scheme"
              >
                <Palette className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
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
            {/* Duplicate Button - quick save to gallery */}
            {html && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={handleDuplicate}
                className="hidden md:flex p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-bg-secondary/90 backdrop-blur-md text-text-secondary hover:text-green-400 transition-all min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] items-center justify-center hover:scale-105 active:scale-95"
                title="Duplicate Design"
              >
                {copied ? <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" /> : <Copy className="w-4 h-4 sm:w-5 sm:h-5" />}
              </motion.button>
            )}
            {/* Remix/Variation Button - visible on tablet+ */}
            {html && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={handleRemix}
                disabled={isRemixing}
                className="hidden md:flex p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-bg-secondary/90 backdrop-blur-md text-text-secondary hover:text-accent-primary transition-all min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-50"
                title={isRemixing ? "Generating variation..." : "Generate Variation"}
              >
                <Shuffle className={`w-4 h-4 sm:w-5 sm:h-5 ${isRemixing ? 'animate-spin' : ''}`} />
              </motion.button>
            )}
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={() => setShowCode(!showCode)}
              className="hidden sm:flex p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl backdrop-blur-md transition-all min-h-[36px] min-w-[36px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center"
              style={{
                background: showCode ? 'rgba(139, 92, 246, 0.2)' : 'rgba(18, 18, 26, 0.9)',
                color: showCode ? '#8b5cf6' : '#94a3b8'
              }}
              title="Toggle Code Preview"
            >
              <Code className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            </motion.button>
            {/* Mobile More Menu Button - always visible on mobile */}
            <div className="relative lg:hidden">
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className={`p-2 rounded-lg backdrop-blur-md transition-all min-h-[40px] min-w-[40px] flex items-center justify-center ${
                  showMoreMenu ? 'bg-accent-primary/20 text-accent-primary' : 'bg-bg-secondary/90 text-text-secondary hover:text-text-primary hover:scale-105 active:scale-95'
                }`}
                title="More Options"
              >
                <MoreHorizontal className="w-4 h-4" />
              </motion.button>
              {/* More Menu Dropdown */}
              {showMoreMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="absolute top-full right-0 mt-2 p-2 bg-bg-secondary/95 backdrop-blur-md rounded-xl border border-white/10 shadow-xl z-30 min-w-[200px]"
                >
                  {/* Theme Toggle */}
                  <button
                    onClick={() => { setPreviewTheme(prev => prev === 'dark' ? 'light' : 'dark'); setShowMoreMenu(false); }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-text-secondary hover:bg-white/5 hover:text-text-primary transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {previewTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                      <span>Light Mode</span>
                    </div>
                  </button>
                  {/* Color Scheme */}
                  <button
                    onClick={() => { setShowColorSchemes(true); setShowMoreMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-secondary hover:bg-white/5 hover:text-text-primary transition-colors"
                  >
                    <Palette className="w-4 h-4" /> Color Scheme
                  </button>
                  {/* Viewport Size */}
                  <button
                    onClick={() => { setShowViewportSelector(true); setShowMoreMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-secondary hover:bg-white/5 hover:text-text-primary transition-colors"
                  >
                    <Monitor className="w-4 h-4" /> Viewport: {viewportSize.charAt(0).toUpperCase() + viewportSize.slice(1)}
                  </button>
                  {/* Animation Toggle */}
                  <button
                    onClick={() => { toggleAnimations(); setShowMoreMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-secondary hover:bg-white/5 hover:text-text-primary transition-colors"
                  >
                    {animationsPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                    {animationsPaused ? 'Resume Animations' : 'Pause Animations'}
                  </button>
                  {/* Code Toggle */}
                  <button
                    onClick={() => { setShowCode(!showCode); setShowMoreMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-secondary hover:bg-white/5 hover:text-text-primary transition-colors"
                  >
                    <Code className="w-4 h-4" /> {showCode ? 'Hide Code' : 'Show Code'}
                  </button>
                  <div className="border-t border-white/10 my-1" />
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
                  {/* Export options - mobile */}
                  {html && (
                    <>
                      <button
                        onClick={() => { handleExportSVG(); setShowMoreMenu(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-secondary hover:bg-white/5 hover:text-text-primary transition-colors"
                      >
                        <span className="w-4 h-4 flex items-center justify-center text-[10px] font-bold">SVG</span> Export as SVG
                      </button>
                      <button
                        onClick={() => { handleExportReact(); setShowMoreMenu(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-secondary hover:bg-white/5 hover:text-text-primary transition-colors"
                      >
                        <FileType className="w-4 h-4" /> Export as React
                      </button>
                      <button
                        onClick={() => { handleExportVue(); setShowMoreMenu(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-secondary hover:bg-white/5 hover:text-text-primary transition-colors"
                      >
                        <span className="w-4 h-4 flex items-center justify-center text-[10px] font-bold text-green-400">V</span> Export as Vue
                      </button>
                      <button
                        onClick={() => { handleExportCSS(); setShowMoreMenu(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-secondary hover:bg-white/5 hover:text-text-primary transition-colors"
                      >
                        <FileCode2 className="w-4 h-4" /> Export as CSS
                      </button>
                      <button
                        onClick={() => { handleExportJSON(); setShowMoreMenu(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-secondary hover:bg-white/5 hover:text-text-primary transition-colors"
                      >
                        <span className="w-4 h-4 flex items-center justify-center text-[10px] font-bold">JSON</span> Export as JSON
                      </button>
                      <button
                        onClick={() => { handleExportPDF(); setShowMoreMenu(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-secondary hover:bg-white/5 hover:text-text-primary transition-colors"
                      >
                        <FileText className="w-4 h-4" /> Export as PDF
                      </button>
                    </>
                  )}
                  {/* Remix - mobile */}
                  {html && (
                    <button
                      onClick={() => { handleRemix(); setShowMoreMenu(false); }}
                      disabled={isRemixing}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-secondary hover:bg-white/5 hover:text-text-primary transition-colors disabled:opacity-50"
                    >
                      <Shuffle className={`w-4 h-4 ${isRemixing ? 'animate-spin' : ''}`} /> 
                      {isRemixing ? 'Generating...' : 'Generate Variation'}
                    </button>
                  )}
                  <div className="border-t border-white/10 my-1" />
                  {/* Reset All */}
                  <button
                    onClick={() => { handleResetAll(); setShowMoreMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" /> Reset All
                  </button>
                </motion.div>
              )}
            </div>
            {/* Export options - visible on tablet+ */}
            <div className="relative hidden md:block">
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={handleExportPNG}
                className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-bg-secondary/90 backdrop-blur-md text-text-secondary hover:text-text-primary transition-all min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center hover:scale-105 active:scale-95"
                title={`Export as PNG (${exportQuality}x quality, hold Shift to cycle)`}
              >
                <FileImage className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>
              <div className="absolute -bottom-1 -right-1 text-[7px] sm:text-[8px] bg-accent-primary/80 text-white px-1.5 rounded-full">{exportQuality}x</div>
            </div>
            {/* Save as Template - visible on tablet+ */}
            <div className="relative hidden md:block">
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={() => setShowSaveTemplate(!showSaveTemplate)}
                className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl backdrop-blur-md transition-all min-h-[36px] min-w-[36px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center ${
                  showSaveTemplate ? 'bg-accent-primary/20 text-accent-primary' : 'bg-bg-secondary/90 text-text-secondary hover:text-text-primary hover:scale-105 active:scale-95'
                }`}
                title="Save as Template"
              >
                <Bookmark className="w-4 h-4 sm:w-5 sm:h-5" />
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
            {/* Refine Prompt - visible on tablet+ */}
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={() => setShowRefine(true)}
              className="hidden md:flex p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-bg-secondary/90 backdrop-blur-md text-text-secondary hover:text-text-primary transition-all min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] items-center justify-center hover:scale-105 active:scale-95"
              title="Refine Prompt"
            >
              <Wand2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.button>
            {/* Load from File - visible on tablet+ */}
            <div className="hidden md:block">
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={handleLoadFile}
                className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-bg-secondary/90 backdrop-blur-md text-text-secondary hover:text-text-primary transition-all min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center hover:scale-105 active:scale-95"
                title="Load HTML File"
              >
                <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".html,.htm"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 relative min-h-0 overflow-hidden">
      {/* Code Preview Panel - Enhanced with Line Numbers */}
      <AnimatePresence>
        {showCode && html && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-20 sm:bottom-4 left-2 right-2 sm:left-4 sm:right-4 z-20 max-h-[45vh] sm:max-h-80 bg-bg-secondary/95 backdrop-blur-glass rounded-xl border border-white/10 overflow-hidden"
          >
            <div className="flex items-center justify-between px-3 sm:px-4 py-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm text-text-secondary">{isEditingCode ? 'Edit Code' : 'Generated HTML'}</span>
                {!isEditingCode && (
                  <span className="text-[10px] sm:text-xs text-text-muted bg-bg-tertiary px-1.5 py-0.5 rounded">
                    {highlightHTML(html).lineCount} lines
                  </span>
                )}
                {isEditingCode && (
                  <span className="text-[10px] sm:text-xs text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded">
                    Editing mode
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                {isEditingCode ? (
                  <>
                    <button
                      onClick={() => {
                        if (onApplyCode) {
                          onApplyCode(editedCode);
                        }
                        setIsEditingCode(false);
                      }}
                      className="p-1.5 rounded-lg hover:bg-green-500/20 text-green-400 hover:text-green-300 transition-colors"
                      title="Apply Changes"
                    >
                      <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingCode(false);
                        setEditedCode(html);
                      }}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-text-secondary hover:text-text-primary transition-colors"
                      title="Cancel"
                    >
                      <X className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setEditedCode(html);
                        setIsEditingCode(true);
                      }}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-text-secondary hover:text-text-primary transition-colors"
                      title="Edit Code"
                    >
                      <FileCode2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
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
                  </>
                )}
              </div>
            </div>
            {isEditingCode ? (
              <div className="flex overflow-auto max-h-[35vh] sm:max-h-60">
                <textarea
                  value={editedCode}
                  onChange={(e) => setEditedCode(e.target.value)}
                  className="flex-1 p-3 sm:p-4 bg-bg-primary text-text-primary text-xs sm:text-sm font-mono whitespace-pre leading-5 sm:leading-6 resize-none focus:outline-none"
                  spellCheck={false}
                  placeholder="Edit your HTML code here..."
                />
              </div>
            ) : (
              <div className="flex overflow-auto max-h-[30vh] sm:max-h-44">
                {/* Line Numbers */}
                <div className="flex-shrink-0 py-2 sm:py-4 px-2 sm:px-3 bg-bg-primary/50 text-right select-none border-r border-white/5">
                  {Array.from({ length: highlightHTML(html).lineCount }, (_, i) => (
                    <div key={i} className="text-[10px] sm:text-xs font-mono text-text-muted leading-5 sm:leading-6">
                      {i + 1}
                    </div>
                  ))}
                </div>
                {/* Code Content */}
                <pre className="flex-1 p-2 sm:p-4 overflow-x-auto text-xs sm:text-sm font-mono whitespace-pre leading-5 sm:leading-6" dangerouslySetInnerHTML={{ __html: highlightHTML(html).html }}>
                </pre>
              </div>
            )}
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
          >
            <div className="absolute inset-0" onClick={() => setShowRefine(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
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
                {/* Quick refine buttons */}
                <div>
                  <label className="text-sm text-text-secondary mb-2 block font-medium">Quick refinements:</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: '🌙 Darker', prompt: 'Make the design darker with deeper shadows and richer dark tones' },
                      { label: '☀️ Lighter', prompt: 'Make the design lighter with brighter colors and softer shadows' },
                      { label: '✨ Add animations', prompt: 'Add smooth animations, transitions, and hover effects to all elements' },
                      { label: '🎨 Modernize', prompt: 'Modernize the design with contemporary styling, rounded corners, and fresh look' },
                      { label: '📱 Mobile responsive', prompt: 'Make it fully responsive with proper mobile layouts' },
                      { label: '🔵 Change to blue', prompt: 'Change the color scheme to blue tones' },
                      { label: '🟢 Change to green', prompt: 'Change the color scheme to green tones' },
                      { label: '🔴 Change to red', prompt: 'Change the color scheme to red tones' },
                      { label: '💎 Glassmorphism', prompt: 'Add glassmorphism effect with blur, transparency, and subtle borders' },
                      { label: '📊 Add charts', prompt: 'Add charts like line, bar, or pie charts to visualize data' },
                    ].map((item) => (
                      <button
                        key={item.label}
                        onClick={() => {
                          if (onRefinePrompt) {
                            onRefinePrompt(item.prompt, item.prompt);
                            setShowRefine(false);
                          }
                        }}
                        className="px-3 py-1.5 text-xs bg-bg-tertiary hover:bg-accent-primary/20 hover:text-accent-primary rounded-lg transition-colors border border-white/5"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-text-secondary mb-2 block font-medium">Or describe what you want:</label>
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
            onClick={() => setShowShortcuts(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
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
            style={{ paddingBottom: '80px' }}
          >
            <div className="flex flex-col items-center gap-6 sm:gap-8">
              {/* Enhanced spinner with multiple rotating rings and glow effect */}
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-bg-tertiary" />
                {/* Outer ring with gradient */}
                <div className="absolute inset-0 w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-transparent border-t-accent-primary animate-spin" style={{ animationDuration: '1.2s' }}>
                  <div className="absolute inset-0 rounded-full shadow-[0_0_15px_rgba(139,92,246,0.5)]" />
                </div>
                {/* Middle ring - reverse direction */}
                <div className="absolute inset-1 w-18 h-18 sm:w-22 sm:h-22 rounded-full border-4 border-transparent border-b-accent-secondary animate-spin" style={{ animationDuration: '1.8s', animationDirection: 'reverse' }} />
                {/* Inner ring */}
                <div className="absolute inset-3 w-14 h-14 sm:w-16 sm:h-16 rounded-full border-4 border-transparent border-t-cyan-400 animate-spin" style={{ animationDuration: '2.2s' }} />
                {/* Center glow */}
                <div className="absolute inset-0 m-auto w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-accent-primary shadow-[0_0_20px_rgba(139,92,246,0.8)] animate-pulse" />
                {/* Outer glow effect */}
                <div className="absolute -inset-4 rounded-full bg-accent-primary/10 blur-xl animate-pulse" style={{ animationDuration: '2s' }} />
              </div>
              <div className="text-center px-4">
                <p className="text-lg sm:text-xl font-medium text-text-primary mb-2">Generating your visualization</p>
                <p className="text-sm sm:text-base text-text-muted animate-pulse">Crafting beautiful UI components...</p>
              </div>
              {/* Progress dots with staggered animation */}
              <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-accent-primary"
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
            className="absolute inset-0 overflow-auto py-4 sm:py-10 px-3 sm:px-4 flex flex-col items-center justify-center"
          >
          <div className="text-center max-w-[280px] xs:max-w-xs sm:max-w-md w-full">
            {/* Enhanced animated gradient orb with better effects */}
            <div className="relative mb-3 sm:mb-6 mx-auto w-16 h-16 sm:w-32 sm:h-32">
              {/* Outer glow layers with pulsing animation */}
              <motion.div 
                className="absolute inset-0 rounded-full bg-gradient-to-br from-accent-primary/30 to-accent-secondary/30 blur-xl"
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div 
                className="absolute inset-2 rounded-full bg-gradient-to-br from-accent-primary/40 to-accent-secondary/40 blur-2xl"
                animate={{ 
                  scale: [1, 1.15, 1],
                  opacity: [0.4, 0.6, 0.4]
                }}
                transition={{ 
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.3
                }}
              />
              {/* Main orb with gradient background animation */}
              <motion.div 
                className="relative w-full h-full rounded-2xl bg-gradient-to-br from-accent-primary/30 to-accent-secondary/30 flex items-center justify-center border border-white/20 backdrop-blur-sm"
                animate={{ 
                  scale: [1, 1.05, 1],
                  rotate: [0, 2, -2, 0]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <motion.span 
                  className="text-2xl sm:text-5xl"
                  animate={{ 
                    y: [0, -5, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >🎨</motion.span>
              </motion.div>
              {/* Floating particles */}
              <motion.div 
                className="absolute top-2 right-2 w-2 h-2 bg-accent-primary/80 rounded-full"
                animate={{ 
                  y: [0, -10, 0],
                  opacity: [0.8, 0.2, 0.8]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div 
                className="absolute bottom-3 left-2 w-1.5 h-1.5 bg-accent-secondary/80 rounded-full"
                animate={{ 
                  y: [0, -8, 0],
                  opacity: [0.6, 0.2, 0.6]
                }}
                transition={{ 
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
              />
              <motion.div 
                className="absolute top-1/2 right-0 w-1 h-1 bg-cyan-400/60 rounded-full"
                animate={{ 
                  y: [0, -6, 0],
                  opacity: [0.5, 0.1, 0.5]
                }}
                transition={{ 
                  duration: 1.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.8
                }}
              />
            </div>
            <h2 className="font-heading text-lg sm:text-2xl font-semibold mb-2 gradient-text">Visual AI Generator</h2>
            <p className="text-text-secondary text-xs sm:text-base mb-4 sm:mb-6">
              Describe what you want to build and I'll generate beautiful visualizations instantly.
            </p>
            <QuickStartGrid
              items={QUICK_PROMPTS.slice(0, 8)}
              onClick={onQuickGenerate!}
              disabled={isLoading}
            />
            
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
          </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Iframe Renderer */}
      <div 
        className="w-full h-full flex items-center justify-center overflow-auto p-4"
        style={{
          background: viewportSize !== 'desktop' ? 'repeating-linear-gradient(45deg, #1a1a24 25%, transparent 25%, transparent 75%, #1a1a24 75%, #1a1a24), repeating-linear-gradient(45deg, #1a1a24 25%, #0a0a0f 25%, #0a0a0f 75%, #1a1a24 75%, #1a1a24)' : undefined,
          backgroundPosition: '0 0, 10px 10px',
          backgroundSize: '20px 20px'
        }}
      >
        <div
          className="transition-all duration-300 ease-out shadow-2xl"
          style={{
            width: viewportSize === 'desktop' ? '100%' : `${VIEWPORTS.find(v => v.id === viewportSize)?.width || 1280}px`,
            height: viewportSize === 'desktop' ? '100%' : `${VIEWPORTS.find(v => v.id === viewportSize)?.height || 800}px`,
            maxWidth: '100%',
            maxHeight: '100%',
            borderRadius: viewportSize !== 'desktop' ? '12px' : '0',
            overflow: 'hidden'
          }}
        >
          <iframe
            ref={iframeRef}
            title="Visual Output"
            sandbox="allow-scripts"
            className="w-full h-full border-0"
          />
        </div>
      </div>
      
      {/* Mobile FAB - Quick Actions - positioned to avoid overlap with chat widget */}
      {html && !isLoading && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed z-30 lg:hidden"
          style={{ 
            bottom: 'calc(env(safe-area-inset-bottom, 20px) + 100px)',
            right: '16px'
          }}
        >
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary shadow-lg shadow-accent-primary/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
          >
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </button>
        </motion.div>
      )}
      </div>
    </div>
  );
});

VisualRenderer.displayName = 'VisualRenderer';
