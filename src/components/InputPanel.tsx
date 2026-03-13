import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Sparkles, ChevronDown, Clock, Key, Eye, EyeOff, X, BarChart3, Calendar, LayoutGrid, Activity, Keyboard, Sun, Moon, FileText, CreditCard, Monitor, Star, Table, Navigation, MessageSquare, User, Search, Layout, Square, Layers, Maximize2, Sidebar, AppWindow } from 'lucide-react';
import { ModelProvider, PromptHistory, StyleFrame } from '../types';
import { AI_PROVIDERS, setApiKey } from '../lib/ai-providers';

interface InputPanelProps {
  onGenerate: (prompt: string, model: ModelProvider) => void;
  isLoading: boolean;
  history: PromptHistory[];
  onClose?: () => void;
  prompt?: string;
  onPromptChange?: (prompt: string) => void;
  onToggleFavorite?: (id: string) => void;
  onClearHistory?: () => void;
  styleFrame?: StyleFrame;
  onStyleFrameChange?: (frame: StyleFrame) => void;
}

// Template definitions
const TEMPLATES = [
  {
    id: 'chart',
    name: 'Chart',
    icon: BarChart3,
    prompt: 'Create a beautiful interactive line chart showing monthly revenue data for 2024 with tooltips and a legend'
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

export function InputPanel({ onGenerate, isLoading, history, onClose, prompt: externalPrompt, onPromptChange, onToggleFavorite, onClearHistory, styleFrame, onStyleFrameChange }: InputPanelProps) {
  const [internalPrompt, setInternalPrompt] = useState('');
  const [model, setModel] = useState<ModelProvider>('openai');
  const [showHistory, setShowHistory] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [historySearch, setHistorySearch] = useState('');
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('visual-ai-dark-mode');
    return saved !== null ? saved === 'true' : true;
  });

  // Apply dark/light mode to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('visual-ai-dark-mode', String(darkMode));
  }, [darkMode]);

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
    }
  }, []);

  const handleSaveApiKey = () => {
    if (apiKeyInput.trim()) {
      localStorage.setItem('visual-ai-api-key', apiKeyInput.trim());
      setApiKey(apiKeyInput.trim());
      setApiKeyInput('');
      setShowSettings(false);
    }
  };

  const handleClearApiKey = () => {
    localStorage.removeItem('visual-ai-api-key');
    setApiKey('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      onGenerate(prompt, model);
      setPrompt('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <motion.div 
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-72 sm:w-80 h-full bg-bg-secondary border-r border-white/5 flex flex-col"
    >
      {/* Header */}
      <div className="p-3 sm:p-5 border-b border-white/5 sticky top-0 bg-bg-secondary z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center shadow-lg shadow-accent-primary/25">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h1 className="font-heading text-base sm:text-lg font-semibold gradient-text">Visual AI</h1>
              <p className="text-xs text-text-muted hidden xs:block">Generate stunning UIs</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 sm:p-2.5 hover:bg-white/10 rounded-xl transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-text-muted" />}
            </button>
            <button
              type="button"
              onClick={() => setShowShortcuts(true)}
              className="p-2.5 sm:p-2.5 hover:bg-white/10 rounded-xl transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Keyboard Shortcuts"
            >
              <Keyboard className="w-5 h-5 text-text-muted" />
            </button>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="lg:hidden p-2.5 sm:p-2.5 hover:bg-white/10 rounded-xl transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close sidebar"
                aria-hidden="true"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-text-secondary" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Templates Gallery */}
      <div className="px-3 sm:px-5 py-3 sm:py-4 border-b border-white/5">
        <label className="text-xs text-text-muted mb-3 block font-medium">Quick Start</label>
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
          {TEMPLATES.map((template, index) => {
            const Icon = template.icon;
            return (
              <motion.button
                key={template.id}
                type="button"
                onClick={() => {
                  setPrompt(template.prompt);
                }}
                disabled={isLoading}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-bg-tertiary hover:bg-white/10 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 min-h-[60px] group"
                title={template.name}
              >
                <Icon className="w-5 h-5 text-accent-primary group-hover:text-accent-secondary transition-colors" />
                <span className="text-[10px] text-text-secondary font-medium truncate w-full text-center">{template.name}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-3 sm:p-5 flex-1 flex flex-col gap-4 sm:gap-5">
        <div>
          <label className="text-sm text-text-secondary mb-2 block font-medium">Describe what you want</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g., Show me a line chart of sales data..."
            className="input-field h-28 sm:h-44 resize-none text-sm"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="text-sm text-text-secondary mb-2 block font-medium">AI Model</label>
          <div className="relative">
            <select
              value={model}
              onChange={(e) => setModel(e.target.value as ModelProvider)}
              className="select-field w-full text-sm"
              disabled={isLoading}
            >
              {Object.entries(AI_PROVIDERS).map(([key, { name, icon }]) => (
                <option key={key} value={key}>
                  {icon} {name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm text-text-secondary mb-2 block font-medium">Style Frame</label>
          <div className="grid grid-cols-5 gap-2">
            {STYLE_FRAMES.map((frame) => {
              const Icon = frame.icon;
              return (
                <button
                  key={frame.id}
                  type="button"
                  onClick={() => onStyleFrameChange?.(frame.id)}
                  disabled={isLoading}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all min-h-[52px] ${
                    styleFrame === frame.id
                      ? 'bg-accent-primary/20 text-accent-primary border border-accent-primary/50'
                      : 'bg-bg-tertiary text-text-secondary hover:bg-white/10 border border-transparent'
                  }`}
                  title={frame.label}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[10px]">{frame.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          disabled={!prompt.trim() || isLoading}
          className="btn-primary w-full flex items-center justify-center gap-2 min-h-[52px] sm:min-h-[52px] text-sm sm:text-base relative overflow-hidden group"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span className="hidden sm:inline">Generating...</span>
              <span className="sm:hidden">Generating</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              <span>Generate</span>
            </>
          )}
        </button>

        <p className="text-xs text-text-muted text-center">
          <span className="hidden sm:inline">Press ⌘ + Enter to submit</span>
          <span className="sm:hidden">⌘ + ↵ to submit</span>
        </p>
      </form>

      {/* Settings - API Key */}
      <div className="border-t border-white/5">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="w-full p-3 sm:p-4 flex items-center justify-between text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4" />
            <span className="hidden sm:inline">API Settings</span>
            <span className="sm:hidden">Settings</span>
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform ${showSettings ? 'rotate-180' : ''}`} />
        </button>
        
        {showSettings && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            className="px-3 sm:px-4 pb-3 sm:pb-4"
          >
            <p className="text-xs text-text-muted mb-2 sm:mb-3">
              Add your API key to enable real AI generation.
            </p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="sk-..."
                  className="input-field w-full pr-10 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleSaveApiKey}
                className="btn-primary flex-1 text-xs sm:text-sm py-2 sm:py-2.5 min-h-[40px] sm:min-h-[44px]"
              >
                Save
              </button>
              <button
                onClick={handleClearApiKey}
                className="px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm text-red-400 hover:text-red-300 border border-red-400/30 rounded-lg hover:bg-red-400/10 transition-colors min-h-[40px] sm:min-h-[44px]"
              >
                Clear
              </button>
            </div>
            <p className="text-xs text-text-muted mt-2">
              OpenAI, Anthropic, Gemini
            </p>
          </motion.div>
        )}
      </div>

      {/* History */}
      <div className="border-t border-white/5">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-full p-3 sm:p-4 flex items-center justify-between text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">Recent prompts</span>
            <span className="sm:hidden">History</span>
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform ${showHistory ? 'rotate-180' : ''}`} />
        </button>
        
        {showHistory && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            className="px-3 sm:px-4 pb-3 sm:pb-4"
          >
            {/* Search Input */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Search history..."
                className="input-field w-full pl-10 text-xs py-2"
              />
            </div>
            
            {history.length === 0 ? (
              <p className="text-xs text-text-muted text-center py-3 sm:py-4">No history yet</p>
            ) : (
              <div className="flex flex-col gap-2 max-h-40 sm:max-h-48 overflow-y-auto">
                {/* Filter toggle */}
                <button
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs transition-colors ${
                    showFavoritesOnly 
                      ? 'bg-yellow-500/20 text-yellow-400' 
                      : 'bg-bg-tertiary text-text-muted hover:text-text-secondary'
                  }`}
                >
                  <Star className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-yellow-400' : ''}`} />
                  {showFavoritesOnly ? 'Showing Favorites' : 'Show Favorites Only'}
                </button>
                
                {history.length > 0 && (
                  <button
                    onClick={() => {
                      if (confirm('Clear all history?')) {
                        onClearHistory?.();
                      }
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 transition-colors"
                  >
                    Clear All History
                  </button>
                )}
                
                {(showFavoritesOnly ? history.filter(h => h.isFavorite) : history).slice(0, 10).map((item) => {
                  // Filter by search term
                  if (historySearch && !item.prompt.toLowerCase().includes(historySearch.toLowerCase())) {
                    return null;
                  }
                  return (
                  <div key={item.id} className="flex items-start gap-2">
                    <button
                      onClick={() => setPrompt(item.prompt)}
                      className="flex-1 text-left p-2.5 sm:p-3 rounded-lg bg-bg-tertiary hover:bg-white/5 transition-colors text-xs"
                    >
                      <p className="text-text-primary line-clamp-2">{item.prompt}</p>
                      <p className="text-text-muted mt-1">{AI_PROVIDERS[item.model].icon} {item.model}</p>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite?.(item.id);
                      }}
                      className={`p-2 rounded-lg transition-colors min-w-[36px] flex items-center justify-center ${
                        item.isFavorite 
                          ? 'text-yellow-400 hover:text-yellow-300' 
                          : 'text-text-muted hover:text-yellow-400'
                      }`}
                      title={item.isFavorite ? "Remove from favorites" : "Add to favorites"}
                    >
                      <Star className={`w-4 h-4 ${item.isFavorite ? 'fill-yellow-400' : ''}`} />
                    </button>
                  </div>
                  );
                })}
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
    </motion.div>
  );
}
