import { memo, useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Sparkles, ChevronDown, Clock, Key, Eye, EyeOff, X, BarChart3, Calendar, LayoutGrid, Activity, Keyboard, Sun, Moon, FileText, CreditCard, Monitor, Star, Table, Navigation, MessageSquare, User, Search, Layout, Square, Layers, Maximize2, Sidebar, AppWindow, Wand2, ChevronDownCircle, Grid3X3, Zap, ShoppingBag, ShoppingCart, Briefcase, AlertCircle, Settings, Bell, Clock3, Tag, MessageCircle, Upload, CalendarDays, Sliders, Loader2, BellOff, FolderOpen, PieChart, TrendingUp, Gauge, Wallet, Users, Mail, Code2, Terminal, Database, Server, Cloud, Lock, Unlock, Image as ImageIcon, Video, Music, File, Download, Share2, Printer, HelpCircle, Rocket, Zap as ZapFast, Filter, SortDesc, Lightbulb, ImagePlus, Trash2, Copy, Check } from 'lucide-react';
import { ModelProvider, PromptHistory, StyleFrame } from '../types';
import { AI_PROVIDERS, setApiKey, getApiKey, enhancePrompt, FREE_MODELS, setFreeModel, setKimiApiKey, setMinimaxApiKey } from '../lib/ai-providers';
import { QuickRefine, PromptTemplates } from './QuickRefine';

interface InputPanelProps {
  onGenerate: (prompt: string, model: ModelProvider, contextHtml?: string, images?: { url: string; name: string }[]) => void;
  onRefine?: (refinement: string) => void;
  isLoading: boolean;
  history: PromptHistory[];
  onClose?: () => void;
  prompt?: string;
  onPromptChange?: (prompt: string) => void;
  onToggleFavorite?: (id: string) => void;
  onClearHistory?: () => void;
  styleFrame?: StyleFrame;
  onStyleFrameChange?: (frame: StyleFrame) => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  onShare?: () => void;
  onExport?: () => void;
  onExportPNG?: () => void;
  onExportPDF?: () => void;
  onExportCodePen?: () => void;
  onSaveFavorite?: (name?: string) => void;
  generationStats?: { time: number; model: string } | null;
  contextHtml?: string;
  currentHtmlLength?: number;
}

// Template definitions
const TEMPLATES = [
  {
    id: 'chart',
    name: 'Line Chart',
    icon: BarChart3,
    prompt: 'Create a beautiful interactive line chart showing monthly revenue data for 2024 with tooltips and a legend'
  },
  {
    id: 'bar-chart',
    name: 'Bar Chart',
    icon: BarChart3,
    prompt: 'Build a vertical bar chart comparing product sales across categories with hover tooltips and animated bars'
  },
  {
    id: 'pie-chart',
    name: 'Pie Chart',
    icon: PieChart,
    prompt: 'Create an interactive pie chart showing market share percentages with labels and legend'
  },
  {
    id: 'timeline',
    name: 'Timeline',
    icon: Calendar,
    prompt: 'Build a vertical timeline component showing a product launch roadmap with milestones and dates'
  },
  {
    id: 'cards',
    name: 'Card Grid',
    icon: LayoutGrid,
    prompt: 'Design a responsive grid of stat cards showing KPI metrics with icons, numbers and trend indicators'
  },
  {
    id: 'dashboard',
    name: 'Dashboard',
    icon: Activity,
    prompt: 'Create a dark-themed analytics dashboard with multiple widgets, charts and data tables'
  },
  {
    id: 'form',
    name: 'Form',
    icon: FileText,
    prompt: 'Build a modern contact form with name, email, subject, message fields and a submit button with validation styling'
  },
  {
    id: 'pricing',
    name: 'Pricing',
    icon: CreditCard,
    prompt: 'Create a responsive pricing table with 3 tiers, monthly/yearly toggle, feature lists and CTA buttons'
  },
  {
    id: 'hero',
    name: 'Hero',
    icon: Monitor,
    prompt: 'Design a stunning hero section with headline, subtext, CTA button, and background gradient or image placeholder'
  },
  {
    id: 'navigation',
    name: 'Navigation',
    icon: Navigation,
    prompt: 'Create a responsive navigation bar with logo, menu links, and mobile hamburger menu'
  },
  {
    id: 'table',
    name: 'Table',
    icon: Table,
    prompt: 'Build a responsive data table with sortable columns, pagination, and search input'
  },
  {
    id: 'testimonials',
    name: 'Testimonials',
    icon: MessageSquare,
    prompt: 'Design a testimonials section with customer quotes, avatars, names and star ratings'
  },
  {
    id: 'login',
    name: 'Login',
    icon: User,
    prompt: 'Create a modern login form with email, password fields, remember me checkbox, and login button'
  },
  {
    id: 'modal',
    name: 'Modal',
    icon: AppWindow,
    prompt: 'Create a beautiful modal dialog with overlay, header, body content, and action buttons with smooth animations'
  },
  {
    id: 'sidebar',
    name: 'Sidebar',
    icon: Sidebar,
    prompt: 'Build a collapsible sidebar navigation with icons, labels, active states, and smooth expand/collapse animations'
  },
  {
    id: 'landing',
    name: 'Landing',
    icon: Layout,
    prompt: 'Design a complete landing page with hero, features section, pricing, testimonials, and footer'
  },
  {
    id: 'tabs',
    name: 'Tabs & Accordion',
    icon: ChevronDownCircle,
    prompt: 'Create an interactive tabs component with multiple tabs and an accordion FAQ section with expand/collapse'
  },
  {
    id: 'product',
    name: 'Product Card',
    icon: ShoppingBag,
    prompt: 'Design a beautiful product card with image placeholder, product title, price, rating stars, and Add to Cart button with hover effects'
  },
  {
    id: 'cart',
    name: 'Shopping Cart',
    icon: ShoppingCart,
    prompt: 'Create a shopping cart component showing product items with images, quantities, prices, and a checkout summary with total'
  },
  {
    id: 'portfolio',
    name: 'Portfolio',
    icon: Briefcase,
    prompt: 'Build a personal portfolio section with project cards, skills tags, about section, and contact information'
  },
  {
    id: 'footer',
    name: 'Footer',
    icon: Layout,
    prompt: 'Create a responsive website footer with company logo, navigation links, social media icons, newsletter signup, and copyright text'
  },
  {
    id: 'error404',
    name: '404 Page',
    icon: AlertCircle,
    prompt: 'Design a creative 404 error page with illustration, "Page Not Found" message, helpful links, and a search box'
  },
  {
    id: 'profile',
    name: 'Profile',
    icon: User,
    prompt: 'Build a user profile page with avatar, cover image, bio, stats (followers, posts), and action buttons'
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: Settings,
    prompt: 'Create a settings page with sections for account, privacy, notifications, and theme toggle with form inputs and switches'
  },
  // New templates
  {
    id: 'notification',
    name: 'Notification',
    icon: Bell,
    prompt: 'Create a notification toast component with icon, message, close button, and slide-in animation'
  },
  {
    id: 'widget',
    name: 'Widget',
    icon: Clock3,
    prompt: 'Build a beautiful clock widget showing current time, date, and a modern digital clock design'
  },
  {
    id: 'badge',
    name: 'Badge',
    icon: Tag,
    prompt: 'Design a collection of badges and tags with different colors, sizes, and subtle hover effects'
  },
  {
    id: 'comments',
    name: 'Comments',
    icon: MessageCircle,
    prompt: 'Create a comments section with user avatars, timestamps, reply functionality, and nested replies'
  },
  {
    id: 'upload',
    name: 'File Upload',
    icon: Upload,
    prompt: 'Build a drag-and-drop file upload zone with progress bar, file preview, and upload complete state'
  },
  {
    id: 'datepicker',
    name: 'Date Picker',
    icon: CalendarDays,
    prompt: 'Create a stylish date picker calendar component with month navigation and date selection'
  },
  {
    id: 'slider',
    name: 'Slider',
    icon: Sliders,
    prompt: 'Design a range slider component with value labels, custom thumb styling, and smooth interactions'
  },
  {
    id: 'progress',
    name: 'Progress',
    icon: Loader2,
    prompt: 'Build various progress indicators including linear bars, circular spinners, and percentage display'
  },
  {
    id: 'skeleton',
    name: 'Skeleton',
    icon: Loader2,
    prompt: 'Create elegant skeleton loading placeholders with shimmer animation for content loading states'
  },
  {
    id: 'alert',
    name: 'Alert',
    icon: BellOff,
    prompt: 'Design alert banner components with different types (success, warning, error, info) and dismissible option'
  },
  {
    id: 'files',
    name: 'File Browser',
    icon: FolderOpen,
    prompt: 'Create a file browser interface with folder hierarchy, file icons, selection states, and grid/list view toggle'
  },
  // New practical templates
  {
    id: 'stats',
    name: 'Stats Widget',
    icon: TrendingUp,
    prompt: 'Create a statistics widget showing key metrics with large numbers, trend indicators, and mini sparkline charts'
  },
  {
    id: 'metric-card',
    name: 'Metric Card',
    icon: Gauge,
    prompt: 'Build a metric card with current value, percentage change, trend arrow, and a small area chart'
  },
  {
    id: 'wallet',
    name: 'Wallet Balance',
    icon: Wallet,
    prompt: 'Design a wallet or balance card showing total amount, recent transactions, and quick action buttons'
  },
  {
    id: 'team',
    name: 'Team Members',
    icon: Users,
    prompt: 'Create a team member grid with avatars, names, roles, and social media links with hover effects'
  },
  {
    id: 'contact-card',
    name: 'Contact Card',
    icon: Mail,
    prompt: 'Build a contact information card with email, phone, address, map preview, and social links'
  },
  {
    id: 'api-docs',
    name: 'API Docs',
    icon: Code2,
    prompt: 'Create an API documentation layout with endpoint descriptions, request/response examples, and code snippets'
  },
  {
    id: 'terminal',
    name: 'Terminal',
    icon: Terminal,
    prompt: 'Build a terminal/console UI with command prompt, output area, and typing animation effects'
  },
  {
    id: 'database',
    name: 'Database Schema',
    icon: Database,
    prompt: 'Design a database schema visualization showing tables, columns, relationships, and data types'
  },
  {
    id: 'server-status',
    name: 'Server Status',
    icon: Server,
    prompt: 'Create a server status dashboard showing uptime, CPU, memory, storage, and health indicators'
  },
  {
    id: 'cloud-services',
    name: 'Cloud Services',
    icon: Cloud,
    prompt: 'Build a cloud services comparison table with features, pricing tiers, and selection buttons'
  },
  {
    id: 'login-register',
    name: 'Login + Register',
    icon: Lock,
    prompt: 'Create a combined login and registration form with tab switching, social login options, and form validation'
  },
  {
    id: 'password-reset',
    name: 'Password Reset',
    icon: Unlock,
    prompt: 'Design a password reset flow with email input, OTP verification, and new password creation steps'
  },
  {
    id: 'media-gallery',
    name: 'Media Gallery',
    icon: ImageIcon,
    prompt: 'Create a media gallery with lightbox, thumbnail grid, filters, and masonry layout'
  },
  {
    id: 'video-player',
    name: 'Video Player',
    icon: Video,
    prompt: 'Build a custom video player with controls, progress bar, volume, fullscreen, and playback speed'
  },
  {
    id: 'music-player',
    name: 'Music Player',
    icon: Music,
    prompt: 'Create a music player UI with album art, progress bar, controls, playlist, and visualizer'
  },
  {
    id: 'file-manager',
    name: 'File Manager',
    icon: File,
    prompt: 'Design a file manager interface with breadcrumbs, toolbar, file list, and context menu'
  },
  {
    id: 'download-list',
    name: 'Download Manager',
    icon: Download,
    prompt: 'Build a download manager showing file list, progress bars, speed, pause/resume, and cancel options'
  },
  {
    id: 'share-modal',
    name: 'Share Modal',
    icon: Share2,
    prompt: 'Create a share dialog with multiple platform icons, copy link, and social media options'
  },
  {
    id: 'print-preview',
    name: 'Print Preview',
    icon: Printer,
    prompt: 'Design a print-friendly document preview with page navigation and print button'
  },
  {
    id: 'onboarding',
    name: 'Onboarding',
    icon: Rocket,
    prompt: 'Create an onboarding flow with step indicators, illustrations, and progress through welcome, setup, and completion'
  },
  {
    id: 'feature-list',
    name: 'Feature Grid',
    icon: ZapFast,
    prompt: 'Build a features grid showcasing product capabilities with icons, titles, and descriptions'
  },
  {
    id: 'comparison',
    name: 'Comparison Table',
    icon: Filter,
    prompt: 'Design a product/service comparison table with checkmarks, pricing, and highlighted recommended option'
  },
  {
    id: 'sort-filter',
    name: 'Sort & Filter',
    icon: SortDesc,
    prompt: 'Create a data table with sort controls, filter dropdowns, search, and bulk actions toolbar'
  },
  {
    id: 'newsletter',
    name: 'Newsletter',
    icon: Mail,
    prompt: 'Build a newsletter signup section with email input, subscription options, and privacy notice'
  },
  {
    id: 'faq',
    name: 'FAQ',
    icon: HelpCircle,
    prompt: 'Create an FAQ section with expandable questions and answers in an accordion style'
  }
];

// Style frame definitions
const STYLE_FRAMES: { id: StyleFrame; label: string; icon: React.ElementType }[] = [
  { id: 'card', label: 'Card', icon: Square },
  { id: 'modal', label: 'Modal', icon: Layers },
  { id: 'fullwidth', label: 'Full Width', icon: Maximize2 },
  { id: 'floating', label: 'Floating', icon: Sparkles },
  { id: 'glass', label: 'Glass', icon: Layout },
];

// Memoized Template Button Component
const TemplateButton = memo(({ template, onClick, isLoading, onClose }: {
  template: { id: string; name: string; icon: React.ElementType; prompt: string };
  onClick: (prompt: string) => void;
  isLoading: boolean;
  onClose?: () => void;
}) => {
  const Icon = template.icon;
  const handleClick = () => {
    onClick(template.prompt);
    if (onClose && window.innerWidth < 1024) {
      onClose();
    }
  };
  return (
    <motion.button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex-shrink-0 xs:flex-none flex flex-col items-center gap-1 p-2.5 xs:p-2.5 rounded-lg xs:rounded-xl bg-bg-tertiary hover:bg-white/10 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 min-h-[48px] xs:min-h-[52px] sm:min-h-[56px] group w-[52px] xs:w-auto"
      title={template.name}
    >
      <Icon className="w-5 h-5 xs:w-4.5 xs:h-4.5 text-accent-primary group-hover:text-accent-secondary transition-colors" />
      <span className="text-[10px] xs:text-[9px] sm:text-[10px] text-text-secondary font-medium truncate w-full text-center hidden xs:block">{template.name}</span>
    </motion.button>
  );
});

TemplateButton.displayName = 'TemplateButton';

export const InputPanel = memo(function InputPanel({ onGenerate, onRefine, isLoading, history, onClose, prompt: externalPrompt, onPromptChange, onToggleFavorite, onClearHistory, styleFrame, onStyleFrameChange, theme = 'dark', onToggleTheme, onShare, onExport, onExportPNG, onExportPDF, onExportCodePen, onSaveFavorite, generationStats, contextHtml, currentHtmlLength }: InputPanelProps) {
  const [internalPrompt, setInternalPrompt] = useState('');
  const [model, setModel] = useState<ModelProvider>(() => {
    try {
      const saved = localStorage.getItem('visual-ai-model') as ModelProvider | null;
      const validModels: ModelProvider[] = ['openai', 'claude', 'gemini', 'openrouter', 'kimi', 'minimax', 'local'];
      if (saved && validModels.includes(saved)) return saved;
    } catch {}
    return 'openrouter'; // Default to free OpenRouter model
  });
  const [freeModel, setFreeModelState] = useState(() => {
    const saved = localStorage.getItem('visual-ai-free-model');
    // Validate saved model is still in the current FREE_MODELS list
    if (saved && FREE_MODELS.some(m => m.id === saved)) return saved;
    return FREE_MODELS[0].id;
  });
  const [showFreeModels, setShowFreeModels] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [kimiKeyInput, setKimiKeyInput] = useState('');
  const [hasKimiKey, setHasKimiKey] = useState(false);
  const [showKimiKey, setShowKimiKey] = useState(false);
  const [minimaxKeyInput, setMinimaxKeyInput] = useState('');
  const [hasMinimaxKey, setHasMinimaxKey] = useState(false);
  const [showMinimaxKey, setShowMinimaxKey] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [historySearch, setHistorySearch] = useState('');
  const [copiedHistoryId, setCopiedHistoryId] = useState<string | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<{ id: string; url: string; name: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Use external theme prop if provided, otherwise use local state
  const isDarkMode = theme !== undefined ? theme === 'dark' : (() => {
    const saved = localStorage.getItem('visual-ai-dark-mode');
    return saved !== null ? saved === 'true' : true;
  })();
  
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('visual-ai-dark-mode');
    return saved !== null ? saved === 'true' : true;
  });
  const [showAllTemplates, setShowAllTemplates] = useState(false);
  const [autoEnhance, setAutoEnhance] = useState(() => {
    const saved = localStorage.getItem('visual-ai-auto-enhance');
    return saved === 'true';
  });

  // Apply dark/light mode to document - use theme prop if provided
  useEffect(() => {
    const effectiveDarkMode = theme !== undefined ? theme === 'dark' : darkMode;
    document.documentElement.setAttribute('data-theme', effectiveDarkMode ? 'dark' : 'light');
    if (theme === undefined) {
      localStorage.setItem('visual-ai-dark-mode', String(darkMode));
    }
  }, [darkMode, theme]);

  // Save auto-enhance preference
  useEffect(() => {
    localStorage.setItem('visual-ai-auto-enhance', String(autoEnhance));
  }, [autoEnhance]);

  // Use external prompt if provided, otherwise use internal
  const prompt = externalPrompt !== undefined ? externalPrompt : internalPrompt;
  const setPrompt = (value: string) => {
    if (onPromptChange) {
      onPromptChange(value);
    } else {
      setInternalPrompt(value);
    }
  };

  // Load saved API key on mount
  useEffect(() => {
    const saved = localStorage.getItem('visual-ai-api-key');
    if (saved) {
      setApiKey(saved);
      setHasApiKey(true);
      setApiKeyInput(saved); // Also populate the input field for visibility
    }

    // Load saved Kimi API key
    const savedKimi = localStorage.getItem('visual-ai-kimi-key');
    if (savedKimi) {
      setKimiApiKey(savedKimi);
      setKimiKeyInput(savedKimi);
      setHasKimiKey(true);
    }

    // Load saved MiniMax API key
    const savedMinimax = localStorage.getItem('visual-ai-minimax-key');
    if (savedMinimax) {
      setMinimaxApiKey(savedMinimax);
      setMinimaxKeyInput(savedMinimax);
      setHasMinimaxKey(true);
    }

    // Load saved free model
    const savedFreeModel = localStorage.getItem('visual-ai-free-model');
    if (savedFreeModel) {
      setFreeModel(savedFreeModel);
    }
  }, []);

  // Save free model selection
  useEffect(() => {
    localStorage.setItem('visual-ai-free-model', freeModel);
    setFreeModel(freeModel);
  }, [freeModel]);

  const handleSaveApiKey = () => {
    if (apiKeyInput.trim()) {
      const key = apiKeyInput.trim();
        // Check if it's a Kimi key
      if (key.startsWith('sk-kimi-')) {
        localStorage.setItem('visual-ai-kimi-key', key);
        setKimiApiKey(key);
        setKimiKeyInput(key);
        setHasKimiKey(true);
      } else {
        localStorage.setItem('visual-ai-api-key', key);
        setApiKey(key);
        setHasApiKey(true);
      }
      
      setApiKeyInput(''); // Clear input after saving
      setShowSettings(false);
    }
  };

  const handleSaveKimiKey = () => {
    const key = kimiKeyInput.trim();
    if (key) {
      try { localStorage.setItem('visual-ai-kimi-key', key); } catch {}
      setKimiApiKey(key);
      setHasKimiKey(true);
      setShowSettings(false);
    }
  };

  const handleClearKimiKey = () => {
    try { localStorage.removeItem('visual-ai-kimi-key'); } catch {}
    setKimiApiKey('');
    setKimiKeyInput('');
    setHasKimiKey(false);
  };

  const handleSaveMinimaxKey = () => {
    const key = minimaxKeyInput.trim();
    if (key) {
      try { localStorage.setItem('visual-ai-minimax-key', key); } catch {}
      setMinimaxApiKey(key);
      setHasMinimaxKey(true);
      setShowSettings(false);
    }
  };

  const handleClearMinimaxKey = () => {
    try { localStorage.removeItem('visual-ai-minimax-key'); } catch {}
    setMinimaxApiKey('');
    setMinimaxKeyInput('');
    setHasMinimaxKey(false);
  };

  const handleClearApiKey = () => {
    localStorage.removeItem('visual-ai-api-key');
    localStorage.removeItem('visual-ai-kimi-key');
    localStorage.removeItem('visual-ai-minimax-key');
    setApiKey('');
    setKimiApiKey('');
    setMinimaxApiKey('');
    setHasApiKey(false);
    setApiKeyInput('');
    setKimiKeyInput('');
    setHasKimiKey(false);
    setMinimaxKeyInput('');
    setHasMinimaxKey(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      // Auto-enhance if toggle is enabled
      if (autoEnhance && !isEnhancing) {
        setIsEnhancing(true);
        try {
          const apiKey = getApiKey();
          const enhanced = await enhancePrompt(prompt, model, apiKey);
          // Pass images along with the enhanced prompt
          onGenerate(enhanced, model, undefined, uploadedImages.length > 0 ? uploadedImages : undefined);
        } catch (error) {
          console.error('Auto-enhance failed:', error);
          onGenerate(prompt, model, undefined, uploadedImages.length > 0 ? uploadedImages : undefined);
        } finally {
          setIsEnhancing(false);
        }
      } else {
        onGenerate(prompt, model, undefined, uploadedImages.length > 0 ? uploadedImages : undefined);
      }
      setPrompt('');
      // Clear uploaded images after generation
      setUploadedImages([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const handleEnhancePrompt = async () => {
    if (!prompt.trim() || isEnhancing || isLoading) return;
    
    setIsEnhancing(true);
    try {
      const apiKey = getApiKey();
      const enhanced = await enhancePrompt(prompt, model, apiKey);
      setPrompt(enhanced);
    } catch (error) {
      console.error('Failed to enhance prompt:', error);
    } finally {
      setIsEnhancing(false);
    }
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        // Warn on files over 4MB
        if (file.size > 4 * 1024 * 1024) {
          console.warn(`Image ${file.name} is ${(file.size / 1024 / 1024).toFixed(1)}MB — may cause issues`);
        }
        const reader = new FileReader();
        reader.onload = (event) => {
          const url = event.target?.result as string;
          setUploadedImages(prev => [...prev, {
            id: crypto.randomUUID(),
            url,
            name: file.name
          }]);
        };
        reader.readAsDataURL(file);
      }
    });
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove uploaded image
  const removeImage = (id: string) => {
    setUploadedImages(prev => prev.filter(img => img.id !== id));
  };

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <motion.div 
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-[85vw] max-w-[300px] sm:max-w-[320px] md:w-72 lg:w-80 h-full bg-bg-secondary border-r border-white/5 flex flex-col overflow-hidden pb-safe"
      style={{ 
        width: 'min(85vw, 300px)',
        maxWidth: 'min(85vw, 300px)'
      }}
    >
      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain sidebar-scroll pb-24" style={{ WebkitOverflowScrolling: 'touch' }}>
      {/* Header */}
      <div className="p-2.5 sm:p-4 border-b border-white/5 sticky top-0 bg-bg-secondary z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center shadow-lg shadow-accent-primary/25">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </div>
            <div>
              <h1 className="font-heading text-sm sm:text-base font-semibold gradient-text">Visual AI</h1>
              <p className="text-[10px] sm:text-xs text-text-muted hidden xs:block">Generate stunning UIs</p>
            </div>
          </div>
          <div className="flex items-center gap-0.5 sm:gap-1">
            <button
              type="button"
              onClick={() => {
                if (onToggleTheme) {
                  onToggleTheme();
                } else {
                  setDarkMode(!darkMode);
                }
              }}
              className="p-2 sm:p-2.5 hover:bg-white/10 rounded-lg sm:rounded-xl transition-all min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-text-muted" />}
            </button>
            <button
              type="button"
              onClick={() => setShowShortcuts(true)}
              className="p-2 sm:p-2.5 hover:bg-white/10 rounded-lg sm:rounded-xl transition-all min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center"
              title="Keyboard Shortcuts"
            >
              <Keyboard className="w-4 h-4 sm:w-5 sm:h-5 text-text-muted" />
            </button>
            {onExport && (
              <button
                type="button"
                onClick={onExport}
                className="p-2 sm:p-2.5 hover:bg-white/10 rounded-lg sm:rounded-xl transition-all min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center"
                title="Export HTML"
              >
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-text-muted" />
              </button>
            )}
            {onExportPNG && (
              <button
                type="button"
                onClick={onExportPNG}
                className="p-2 sm:p-2.5 hover:bg-white/10 rounded-lg sm:rounded-xl transition-all min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center"
                title="Export PNG"
              >
                <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-text-muted" />
              </button>
            )}
            {onExportPDF && (
              <button
                type="button"
                onClick={onExportPDF}
                className="p-2 sm:p-2.5 hover:bg-white/10 rounded-lg sm:rounded-xl transition-all min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center"
                title="Export PDF"
              >
                <File className="w-4 h-4 sm:w-5 sm:h-5 text-text-muted" />
              </button>
            )}
            {onExportCodePen && (
              <button
                type="button"
                onClick={onExportCodePen}
                className="p-2 sm:p-2.5 hover:bg-white/10 rounded-lg sm:rounded-xl transition-all min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center"
                title="Export to CodePen"
              >
                <Code2 className="w-4 h-4 sm:w-5 sm:h-5 text-text-muted" />
              </button>
            )}
            {onShare && (
              <button
                type="button"
                onClick={onShare}
                className="p-2 sm:p-2.5 hover:bg-white/10 rounded-lg sm:rounded-xl transition-all min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center"
                title="Share Design"
              >
                <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-text-muted" />
              </button>
            )}
            {onSaveFavorite && (
              <button
                type="button"
                onClick={() => onSaveFavorite()}
                className="p-2 sm:p-2.5 hover:bg-white/10 rounded-lg sm:rounded-xl transition-all min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center"
                title="Save to Favorites"
              >
                <Star className="w-4 h-4 sm:w-5 sm:h-5 text-text-muted" />
              </button>
            )}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="lg:hidden p-2 sm:p-2.5 hover:bg-accent-primary/20 rounded-lg sm:rounded-xl transition-all min-h-[48px] min-w-[48px] flex items-center justify-center border-2 border-accent-primary/50 bg-accent-primary/10"
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5 sm:w-5 sm:h-5 text-accent-primary" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Generation Stats */}
      {generationStats && (
        <div className="px-2.5 sm:px-4 py-2 border-b border-white/5 bg-accent-primary/5">
          <div className="flex items-center justify-between text-[10px] sm:text-xs flex-wrap gap-1">
            <span className="text-text-muted">Last generation:</span>
            <span className="text-accent-primary font-medium flex items-center gap-1.5">
              <span>{(generationStats.time / 1000).toFixed(1)}s</span>
              <span className="text-text-muted">·</span>
              <span>{generationStats.model}</span>
              {currentHtmlLength && currentHtmlLength > 0 && (
                <>
                  <span className="text-text-muted">·</span>
                  <span className="text-text-muted">{(currentHtmlLength / 1024).toFixed(1)}KB</span>
                </>
              )}
            </span>
          </div>
        </div>
      )}

        {/* Templates Gallery - horizontal scroll on mobile */}
      <div className="px-2.5 sm:px-4 py-2.5 sm:py-3.5 border-b border-white/5">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <label className="text-[10px] sm:text-xs text-text-muted block font-medium">Quick Start</label>
          <div className="flex items-center gap-2">
            {onRefine && (
              <PromptTemplates
                onSelect={(template) => {
                  setPrompt(template);
                  if (onClose && window.innerWidth < 1024) {
                    onClose();
                  }
                }}
                isLoading={isLoading}
              />
            )}
            <button
              type="button"
              onClick={() => setShowAllTemplates(true)}
              className="text-[10px] sm:text-xs text-accent-primary hover:text-accent-secondary transition-colors flex items-center gap-1"
            >
              View All <Grid3X3 className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto xs:overflow-x-visible overflow-y-hidden pb-2 -mb-2 xs:mb-0 xs:pb-0 scrollbar-hide px-1">
          {TEMPLATES.slice(0, 4).map((template, index) => {
            const Icon = template.icon;
            return (
              <motion.button
                key={template.id}
                type="button"
                onClick={() => {
                  setPrompt(template.prompt);
                  // Close sidebar after selecting template on mobile
                  if (onClose && window.innerWidth < 1024) {
                    onClose();
                  }
                }}
                disabled={isLoading}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="flex-shrink-0 xs:flex-none flex flex-col items-center gap-1 p-2.5 xs:p-2.5 rounded-lg xs:rounded-xl bg-bg-tertiary hover:bg-white/10 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 min-h-[48px] xs:min-h-[52px] sm:min-h-[56px] group w-[52px] xs:w-auto"
                title={template.name}
              >
                <Icon className="w-5 h-5 xs:w-4.5 xs:h-4.5 text-accent-primary group-hover:text-accent-secondary transition-colors" />
                <span className="text-[10px] xs:text-[9px] sm:text-[10px] text-text-secondary font-medium truncate w-full text-center hidden xs:block">{template.name}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Quick Refine - only show when there's context HTML */}
      {onRefine && contextHtml && (
        <QuickRefine
          onRefine={(refinement) => {
            if (onRefine) {
              onRefine(refinement);
            }
          }}
          isLoading={isLoading}
        />
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-2.5 sm:p-4 flex-1 flex flex-col gap-3 sm:gap-4">
        <div>
          <label className="text-xs sm:text-sm text-text-secondary mb-1.5 sm:mb-2 block font-medium">Describe what you want</label>
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g., Show me a line chart of sales data..."
              className="input-field h-28 sm:h-40 resize-none text-base"
              style={{ fontSize: '16px' }}
              disabled={isLoading || isEnhancing}
            />
            <button
              type="button"
              onClick={handleEnhancePrompt}
              disabled={!prompt.trim() || isEnhancing || isLoading}
              className="absolute right-1.5 top-1.5 p-1.5 sm:p-2 bg-accent-primary/20 hover:bg-accent-primary/30 text-accent-primary rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="Enhance prompt with AI"
            >
              {isEnhancing ? (
                <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-accent-primary/30 border-t-accent-primary rounded-full animate-spin" />
              ) : (
                <Wand2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              )}
            </button>
          </div>
          <div className="flex items-center justify-between mt-1">
            <p className="text-[10px] sm:text-xs text-text-muted">Transform any topic into a stunning visual — not just text.</p>
            <span className={`text-[10px] font-mono tabular-nums ${prompt.length > 800 ? 'text-red-400' : prompt.length > 500 ? 'text-yellow-400' : 'text-text-muted'}`}>
              {prompt.length}/1000
            </span>
          </div>
          {/* Visual Mode Template Chips */}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {[
              { label: 'Infographic:', placeholder: '[topic]', prefix: 'Create a stunning animated infographic about: ' },
              { label: 'Dashboard:', placeholder: '[metrics]', prefix: 'Create a beautiful data dashboard showing: ' },
              { label: 'Compare:', placeholder: '[A vs B]', prefix: 'Create a stunning visual comparison of ' },
              { label: 'Timeline:', placeholder: '[topic]', prefix: 'Create an animated timeline of the history of: ' },
              { label: 'Data Story:', placeholder: '[dataset]', prefix: 'Create a beautiful data story visualization for: ' },
              { label: 'Chart:', placeholder: '[data type]', prefix: 'Create beautiful Chart.js charts showing: ' },
              { label: 'Explainer:', placeholder: '[concept]', prefix: 'Create a visual step-by-step explainer for: ' },
            ].map((tpl) => (
              <button
                key={tpl.label}
                type="button"
                onClick={() => setPrompt(tpl.prefix)}
                className="text-[10px] px-2 py-1 rounded-full bg-accent-primary/15 text-accent-primary border border-accent-primary/25 hover:bg-accent-primary/25 transition-all"
                title={`${tpl.label} ${tpl.placeholder}`}
              >
                {tpl.label} <span className="text-text-muted">{tpl.placeholder}</span>
              </button>
            ))}
          </div>
          {/* Recent prompts — only shown when textarea is empty */}
          {!prompt.trim() && history.length > 0 && (
            <div className="mt-2">
              <p className="text-[9px] text-text-muted mb-1 uppercase tracking-wide">Recent</p>
              <div className="flex flex-col gap-1">
                {history.slice(0, 3).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPrompt(item.prompt)}
                    className="text-left text-[10px] px-2 py-1.5 rounded-lg bg-bg-tertiary border border-white/5 hover:border-accent-primary/30 hover:bg-accent-primary/10 text-text-muted hover:text-text-secondary transition-all line-clamp-1 truncate"
                    title={item.prompt}
                  >
                    ↩ {item.prompt.slice(0, 60)}{item.prompt.length > 60 ? '…' : ''}
                  </button>
                ))}
              </div>
            </div>
          )}
          {/* Draft indicator - shows when prompt has content (draft auto-saved) */}
          {prompt.trim() && (
            <p className="text-[9px] sm:text-[10px] text-cyan-400 mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
              Draft auto-saved
            </p>
          )}
          
          {/* Image Upload Section */}
          <div className="mt-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
            
            {/* Uploaded Images Preview */}
            {uploadedImages.length > 0 && (
              <div className="mb-2">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-text-muted">{uploadedImages.length} image{uploadedImages.length > 1 ? 's' : ''} attached</span>
                  {uploadedImages.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setUploadedImages([])}
                      className="text-[10px] text-red-400 hover:text-red-300 transition-colors"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {uploadedImages.map((img) => (
                    <div key={img.id} className="relative group">
                      <img
                        src={img.url}
                        alt={img.name}
                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-white/10"
                        title={img.name}
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(img.id)}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label={`Remove ${img.name}`}
                      >
                        <Trash2 className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Upload Button */}
            <button
              type="button"
              onClick={triggerFileInput}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-tertiary hover:bg-white/10 border border-white/5 text-xs sm:text-sm text-text-secondary transition-colors"
            >
              <ImagePlus className="w-4 h-4" />
              <span>Add Reference Image</span>
            </button>
            
            {uploadedImages.length > 0 && (
              <p className="text-[10px] text-text-muted mt-1">
                Will be included in generation prompt
              </p>
            )}
          </div>
          {/* Keyboard shortcuts hint & Tips button */}
          <p className="text-[9px] sm:text-[10px] text-text-muted mt-1.5 flex flex-wrap gap-2 items-center">
            <span className="bg-bg-tertiary px-1.5 py-0.5 rounded">
              {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}+Enter
            </span>
            <span className="bg-bg-tertiary px-1.5 py-0.5 rounded">
              {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}+Z
            </span>
            <span className="bg-bg-tertiary px-1.5 py-0.5 rounded">
              {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}+L
            </span>
            <button
              onClick={() => setShowTips(true)}
              className="ml-auto flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <Lightbulb className="w-3 h-3" />
              <span>Tips</span>
            </button>
          </p>
        </div>

        <div>
          <label className="text-xs sm:text-sm text-text-secondary mb-1.5 sm:mb-2 block font-medium">AI Model</label>
          <div className="relative">
            <select
              value={model}
              onChange={(e) => {
                const m = e.target.value as ModelProvider;
                setModel(m);
                try { localStorage.setItem('visual-ai-model', m); } catch {}
              }}
              className="select-field w-full text-xs sm:text-sm"
              disabled={isLoading}
            >
              {Object.entries(AI_PROVIDERS).map(([key, { name, icon }]) => (
                <option key={key} value={key}>
                  {icon} {name}
                </option>
              ))}
            </select>
          </div>
          {/* Provider Status Indicator */}
          <div className="mt-2 flex items-center gap-2 text-[10px] sm:text-xs">
            {model === 'openrouter' ? (
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Free models available
              </span>
            ) : model === 'kimi' ? (
              hasKimiKey ? (
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Kimi key saved
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  Requires Kimi API key
                </span>
              )
            ) : model === 'minimax' ? (
              hasMinimaxKey ? (
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  MiniMax key saved
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  Requires MiniMax API key
                </span>
              )
            ) : model === 'local' ? (
              <span className="flex items-center gap-1 text-text-muted">
                <span className="w-1.5 h-1.5 rounded-full bg-text-muted"></span>
                Local model (not configured)
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-400">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                Requires API key in settings
              </span>
            )}
          </div>
          {/* Free Model Selector - shown when OpenRouter is selected */}
          {model === 'openrouter' && (
            <div className="mt-2 relative">
              <button
                type="button"
                onClick={() => setShowFreeModels(!showFreeModels)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-bg-tertiary border border-white/10 text-sm hover:border-accent-primary/50 transition-colors"
              >
                <span className="text-text-secondary">
                  {FREE_MODELS.find(m => m.id === freeModel)?.icon} {FREE_MODELS.find(m => m.id === freeModel)?.name}
                </span>
                <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${showFreeModels ? 'rotate-180' : ''}`} />
              </button>
              {/* Free Models Dropdown */}
              {showFreeModels && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full left-0 right-0 mt-1 p-1 bg-bg-secondary border border-white/10 rounded-lg shadow-xl z-20 max-h-48 overflow-y-auto"
                >
                  {FREE_MODELS.map((fm) => (
                    <button
                      key={fm.id}
                      type="button"
                      onClick={() => {
                        setFreeModelState(fm.id);
                        setShowFreeModels(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                        freeModel === fm.id
                          ? 'bg-accent-primary/20 text-accent-primary'
                          : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
                      }`}
                    >
                      <span>{fm.icon}</span>
                      <span>{fm.name}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="text-xs sm:text-sm text-text-secondary mb-1.5 sm:mb-2 block font-medium">Style Frame</label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 sm:gap-2">
            {STYLE_FRAMES.map((frame) => {
              const Icon = frame.icon;
              return (
                <button
                  key={frame.id}
                  type="button"
                  onClick={() => onStyleFrameChange?.(frame.id)}
                  disabled={isLoading}
                  className={`flex flex-col items-center gap-0.5 sm:gap-1 p-1.5 sm:p-2 rounded-lg transition-all min-h-[44px] sm:min-h-[48px] ${
                    styleFrame === frame.id
                      ? 'bg-accent-primary/20 text-accent-primary border border-accent-primary/50'
                      : 'bg-bg-tertiary text-text-secondary hover:bg-white/10 border border-transparent'
                  }`}
                  title={frame.label}
                >
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="text-[9px] sm:text-[10px]">{frame.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Short prompt quality hint */}
        {prompt.trim().length > 0 && prompt.trim().length < 20 && !isLoading && (
          <p className="text-[10px] text-amber-400/80 flex items-center gap-1 -mt-1 mb-1">
            <span>💡</span>
            <span>Longer prompts produce richer visuals — try adding details or a format.</span>
          </p>
        )}
        <button
          type="submit"
          disabled={!prompt.trim() || isLoading}
          className="btn-primary w-full flex items-center justify-center gap-2 min-h-[48px] sm:min-h-[48px] text-sm relative overflow-hidden group"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span className="hidden sm:inline">Generating...</span>
              <span className="sm:hidden">Generating</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-0.5 transition-transform" />
              <span>Generate</span>
            </>
          )}
        </button>

        <p className="text-[10px] sm:text-xs text-text-muted text-center">
          <span className="hidden sm:inline">Press ⌘ + Enter to submit</span>
          <span className="sm:hidden">⌘ + ↵ to submit</span>
        </p>
      </form>
      </div>

      {/* Settings - API Key */}
      <div className="border-t border-white/5 flex-shrink-0">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="w-full p-2.5 sm:p-3.5 flex items-center justify-between text-xs sm:text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          <div className="flex items-center gap-2">
            <Key className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">API Settings</span>
            <span className="sm:hidden">Settings</span>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform ${showSettings ? 'rotate-180' : ''}`} />
        </button>
        
        {showSettings && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            className="px-2.5 sm:px-4 pb-2.5 sm:pb-4"
          >
            {/* API Key Status Indicator */}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg mb-2 sm:mb-3 ${
              hasApiKey ? 'bg-green-500/10 border border-green-500/30' : 'bg-bg-tertiary border border-white/5'
            }`}>
              {hasApiKey ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-[10px] sm:text-xs text-green-400">API Key saved</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 rounded-full bg-yellow-400" />
                  <span className="text-[10px] sm:text-xs text-yellow-400">No API key set</span>
                </>
              )}
            </div>
            <p className="text-[10px] sm:text-xs text-text-muted mb-2 sm:mb-3">
              Add your API key to enable real AI generation.
            </p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="sk-..."
                  className="input-field w-full pr-8 text-xs sm:text-sm py-2 sm:py-2.5"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                >
                  {showApiKey ? <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                </button>
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleSaveApiKey}
                className="btn-primary flex-1 text-[10px] sm:text-xs py-2 sm:py-2.5 min-h-[36px] sm:min-h-[40px]"
              >
                Save
              </button>
              <button
                onClick={handleClearApiKey}
                className="px-2 sm:px-3 py-2 sm:py-2.5 text-[10px] sm:text-xs text-red-400 hover:text-red-300 border border-red-400/30 rounded-lg hover:bg-red-400/10 transition-colors min-h-[36px] sm:min-h-[40px]"
              >
                Clear
              </button>
            </div>
            <p className="text-[10px] sm:text-xs text-text-muted mt-2">
              OpenAI, Anthropic, Gemini
            </p>

            {/* Kimi API Key */}
            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-white/5">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10px] sm:text-xs font-medium text-text-secondary">🌙 Kimi K2.5 API Key</p>
                {hasKimiKey && (
                  <span className="text-[10px] sm:text-xs text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block"></span>
                    Saved
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={showKimiKey ? 'text' : 'password'}
                    value={kimiKeyInput}
                    onChange={(e) => setKimiKeyInput(e.target.value)}
                    placeholder="sk-kimi-..."
                    className="input-field w-full pr-8 text-xs sm:text-sm py-2 sm:py-2.5"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKimiKey(!showKimiKey)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                  >
                    {showKimiKey ? <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                  </button>
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleSaveKimiKey}
                  className="btn-primary flex-1 text-[10px] sm:text-xs py-2 sm:py-2.5 min-h-[36px] sm:min-h-[40px]"
                >
                  Save
                </button>
                {hasKimiKey && (
                  <button
                    onClick={handleClearKimiKey}
                    className="px-2 sm:px-3 py-2 sm:py-2.5 text-[10px] sm:text-xs text-red-400 hover:text-red-300 border border-red-400/30 rounded-lg hover:bg-red-400/10 transition-colors min-h-[36px] sm:min-h-[40px]"
                  >
                    Clear
                  </button>
                )}
              </div>
              <p className="text-[10px] sm:text-xs text-text-muted mt-1.5">
                Get your key at <span className="text-accent-primary">moonshot.cn</span>
              </p>
            </div>

            {/* MiniMax API Key */}
            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-white/5">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10px] sm:text-xs font-medium text-text-secondary">🔮 MiniMax API Key</p>
                {hasMinimaxKey && (
                  <span className="text-[10px] sm:text-xs text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block"></span>
                    Saved
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={showMinimaxKey ? 'text' : 'password'}
                    value={minimaxKeyInput}
                    onChange={(e) => setMinimaxKeyInput(e.target.value)}
                    placeholder="MiniMax API key..."
                    className="input-field w-full pr-8 text-xs sm:text-sm py-2 sm:py-2.5"
                  />
                  <button
                    type="button"
                    onClick={() => setShowMinimaxKey(!showMinimaxKey)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                  >
                    {showMinimaxKey ? <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                  </button>
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleSaveMinimaxKey}
                  className="btn-primary flex-1 text-[10px] sm:text-xs py-2 sm:py-2.5 min-h-[36px] sm:min-h-[40px]"
                >
                  Save
                </button>
                {hasMinimaxKey && (
                  <button
                    onClick={handleClearMinimaxKey}
                    className="px-2 sm:px-3 py-2 sm:py-2.5 text-[10px] sm:text-xs text-red-400 hover:text-red-300 border border-red-400/30 rounded-lg hover:bg-red-400/10 transition-colors min-h-[36px] sm:min-h-[40px]"
                  >
                    Clear
                  </button>
                )}
              </div>
              <p className="text-[10px] sm:text-xs text-text-muted mt-1.5">
                Get your key at <span className="text-accent-primary">minimax.io</span>
              </p>
            </div>

            {/* Auto-enhance toggle */}
            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-white/5">
              <button
                onClick={() => setAutoEnhance(!autoEnhance)}
                className="w-full flex items-center justify-between p-2.5 sm:p-3 rounded-lg bg-bg-tertiary hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <Zap className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${autoEnhance ? 'text-yellow-400' : 'text-text-muted'}`} />
                  <div className="text-left">
                    <p className="text-xs sm:text-sm text-text-primary">Auto-Enhance</p>
                    <p className="text-[10px] sm:text-xs text-text-muted">Automatically improve prompts</p>
                  </div>
                </div>
                <div className={`w-9 h-5 sm:w-10 sm:h-6 rounded-full transition-colors relative ${autoEnhance ? 'bg-accent-primary' : 'bg-bg-primary'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 sm:top-1 sm:w-4 sm:h-4 rounded-full bg-white transition-transform ${autoEnhance ? 'translate-x-4 sm:translate-x-5' : 'translate-x-0.5 sm:translate-x-1'}`} />
                </div>
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* History */}
      <div className="border-t border-white/5">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-full p-2.5 sm:p-3.5 flex items-center justify-between text-xs sm:text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Recent prompts</span>
            <span className="sm:hidden">History</span>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform ${showHistory ? 'rotate-180' : ''}`} />
        </button>
        
        {showHistory && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            className="px-2.5 sm:px-4 pb-2.5 sm:pb-4"
          >
            {/* Search Input */}
            <div className="relative mb-2.5 sm:mb-3">
              <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-text-muted pointer-events-none" />
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Search history..."
                className={`input-field w-full pl-8 sm:pl-10 text-[10px] sm:text-xs py-2 ${historySearch ? 'pr-7 sm:pr-8' : ''}`}
              />
              {historySearch && (
                <button
                  onClick={() => setHistorySearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-text-muted hover:text-text-primary transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </button>
              )}
            </div>
            
            {history.length === 0 ? (
              <p className="text-[10px] sm:text-xs text-text-muted text-center py-2.5 sm:py-3.5">No history yet</p>
            ) : (
              <div className="flex flex-col gap-1.5 sm:gap-2 max-h-32 sm:max-h-40 overflow-y-auto">
                {/* Filter toggle */}
                <button
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  className={`w-full flex items-center justify-center gap-1.5 sm:gap-2 py-1.5 sm:py-2 px-2.5 sm:px-3 rounded-lg text-[10px] sm:text-xs transition-colors ${
                    showFavoritesOnly 
                      ? 'bg-yellow-500/20 text-yellow-400' 
                      : 'bg-bg-tertiary text-text-muted hover:text-text-secondary'
                  }`}
                >
                  <Star className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${showFavoritesOnly ? 'fill-yellow-400' : ''}`} />
                  {showFavoritesOnly ? 'Showing Favorites' : 'Show Favorites Only'}
                </button>
                
                {history.length > 0 && (
                  <button
                    onClick={() => {
                      if (confirm('Clear all history?')) {
                        onClearHistory?.();
                      }
                    }}
                    className="w-full flex items-center justify-center gap-1.5 sm:gap-2 py-1.5 sm:py-2 px-2.5 sm:px-3 rounded-lg text-[10px] sm:text-xs text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 transition-colors"
                  >
                    Clear All History
                  </button>
                )}
                
                {(showFavoritesOnly ? history.filter(h => h.isFavorite) : history)
                  .filter(item => !historySearch || item.prompt.toLowerCase().includes(historySearch.toLowerCase()))
                  .slice(0, historySearch ? 20 : 10)
                  .map((item) => (
                  <div key={item.id} className="flex items-start gap-1.5 sm:gap-2 group/histitem">
                    <button
                      onClick={() => setPrompt(item.prompt)}
                      className="flex-1 text-left p-2 sm:p-2.5 rounded-lg bg-bg-tertiary hover:bg-white/5 transition-colors text-[10px] sm:text-xs"
                    >
                      <p className="text-text-primary line-clamp-2">{item.prompt}</p>
                      <p className="text-text-muted mt-1 text-[9px] sm:text-[10px]">
                        {AI_PROVIDERS[item.model]?.icon} {item.model}
                        {item.isFavorite && <span className="ml-1 text-yellow-400">★ Pinned</span>}
                      </p>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(item.prompt).then(() => {
                          setCopiedHistoryId(item.id);
                          setTimeout(() => setCopiedHistoryId(null), 1500);
                        });
                      }}
                      className="p-1.5 sm:p-2 rounded-lg transition-colors min-w-[32px] sm:min-w-[36px] flex items-center justify-center text-text-muted hover:text-accent opacity-0 group-hover/histitem:opacity-100"
                      title="Copy prompt"
                      aria-label="Copy prompt to clipboard"
                    >
                      {copiedHistoryId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-green-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite?.(item.id);
                      }}
                      className={`p-1.5 sm:p-2 rounded-lg transition-colors min-w-[32px] sm:min-w-[36px] flex items-center justify-center ${
                        item.isFavorite
                          ? 'text-yellow-400 hover:text-yellow-300'
                          : 'text-text-muted hover:text-yellow-400 opacity-0 group-hover/histitem:opacity-100'
                      }`}
                      title={item.isFavorite ? "Unpin from top" : "Pin to top"}
                      aria-label={item.isFavorite ? "Unpin from top" : "Pin to top"}
                    >
                      <Star className={`w-3.5 h-3.5 ${item.isFavorite ? 'fill-yellow-400' : ''}`} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowShortcuts(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-bg-secondary rounded-xl border border-white/10 w-full max-w-sm overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <h3 className="font-heading text-lg font-semibold">Keyboard Shortcuts</h3>
              <button
                onClick={() => setShowShortcuts(false)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Generate UI</span>
                <kbd className="px-2 py-1 bg-bg-tertiary rounded text-xs text-text-primary">⌘ + Enter</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Clear canvas</span>
                <kbd className="px-2 py-1 bg-bg-tertiary rounded text-xs text-text-primary">⌘ + L</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Undo</span>
                <kbd className="px-2 py-1 bg-bg-tertiary rounded text-xs text-text-primary">⌘ + Z</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Redo</span>
                <kbd className="px-2 py-1 bg-bg-tertiary rounded text-xs text-text-primary">⌘ + Shift + Z</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Exit fullscreen</span>
                <kbd className="px-2 py-1 bg-bg-tertiary rounded text-xs text-text-primary">Esc</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Toggle code preview</span>
                <kbd className="px-2 py-1 bg-bg-tertiary rounded text-xs text-text-primary">⌘ + Shift + C</kbd>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Prompt Tips Modal */}
      {showTips && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowTips(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-bg-secondary rounded-xl border border-white/10 w-full max-w-sm overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <h3 className="font-heading text-lg font-semibold flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-400" />
                Writing Better Prompts
              </h3>
              <button
                onClick={() => setShowTips(false)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
              <div className="bg-accent-primary/10 rounded-lg p-3">
                <h4 className="text-sm font-medium text-accent-primary mb-1">🎯 Be Specific</h4>
                <p className="text-xs text-text-secondary">Describe exact colors, layouts, and components you want. "A dark dashboard with purple accents" is better than "a cool dashboard".</p>
              </div>
              <div className="bg-accent-secondary/10 rounded-lg p-3">
                <h4 className="text-sm font-medium text-accent-secondary mb-1">📐 Mention Dimensions</h4>
                <p className="text-xs text-text-secondary">Include sizes like "full-width", "compact cards", or specific dimensions for better results.</p>
              </div>
              <div className="bg-green-500/10 rounded-lg p-3">
                <h4 className="text-sm font-medium text-green-400 mb-1">✨ Use the Enhance Button</h4>
                <p className="text-xs text-text-secondary">The wand icon ✨ automatically improves your prompt for better, more detailed results.</p>
              </div>
              <div className="bg-cyan-500/10 rounded-lg p-3">
                <h4 className="text-sm font-medium text-cyan-400 mb-1">🔄 Iterate & Refine</h4>
                <p className="text-xs text-text-secondary">Generate, review, then ask for changes like "make the buttons rounder" or "change to a blue theme".</p>
              </div>
              <div className="bg-yellow-500/10 rounded-lg p-3">
                <h4 className="text-sm font-medium text-yellow-400 mb-1">📋 Use Templates</h4>
                <p className="text-xs text-text-secondary">Start with a template above to get a solid foundation, then customize it.</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* All Templates Modal */}
      {showAllTemplates && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowAllTemplates(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-bg-secondary rounded-xl border border-white/10 w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-white/5 flex-shrink-0">
              <h3 className="font-heading text-base sm:text-lg font-semibold">All Templates</h3>
              <button
                onClick={() => setShowAllTemplates(false)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-3 sm:p-4 overflow-y-auto">
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
                {TEMPLATES.map((template) => {
                  const Icon = template.icon;
                  return (
                    <button
                      key={template.id}
                      onClick={() => {
                        setPrompt(template.prompt);
                        setShowAllTemplates(false);
                      }}
                      className="flex flex-col items-center gap-2 p-3 sm:p-4 rounded-xl bg-bg-tertiary hover:bg-white/10 hover:scale-105 active:scale-95 transition-all"
                    >
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-accent-primary" />
                      <span className="text-[10px] sm:text-xs text-text-secondary font-medium text-center truncate w-full">{template.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
});

InputPanel.displayName = 'InputPanel';
