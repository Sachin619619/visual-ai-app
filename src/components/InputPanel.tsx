import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Sparkles, ChevronDown, Clock, Key, Eye, EyeOff, X, BarChart3, Calendar, LayoutGrid, Activity } from 'lucide-react';
import { ModelProvider, PromptHistory } from '../types';
import { AI_PROVIDERS, setApiKey } from '../lib/ai-providers';

interface InputPanelProps {
  onGenerate: (prompt: string, model: ModelProvider) => void;
  isLoading: boolean;
  history: PromptHistory[];
  onClose?: () => void;
  prompt?: string;
  onPromptChange?: (prompt: string) => void;
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
  }
];

export function InputPanel({ onGenerate, isLoading, history, onClose, prompt: externalPrompt, onPromptChange }: InputPanelProps) {
  const [internalPrompt, setInternalPrompt] = useState('');
  const [model, setModel] = useState<ModelProvider>('openai');
  const [showHistory, setShowHistory] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showSettings, setShowSettings] = useState(false);

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
      className="w-80 h-full bg-bg-secondary border-r border-white/5 flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-heading text-lg font-semibold gradient-text">Visual AI</h1>
              <p className="text-xs text-text-muted">Generate stunning UIs</p>
            </div>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Templates Gallery */}
      <div className="px-4 py-3 border-b border-white/5">
        <label className="text-xs text-text-muted mb-2 block">Quick Start Templates</label>
        <div className="grid grid-cols-4 gap-2">
          {TEMPLATES.map((template) => {
            const Icon = template.icon;
            return (
              <button
                key={template.id}
                type="button"
                onClick={() => {
                  setPrompt(template.prompt);
                }}
                disabled={isLoading}
                className="flex flex-col items-center gap-1 p-2 rounded-lg bg-bg-tertiary hover:bg-white/10 transition-colors disabled:opacity-50"
                title={template.name}
              >
                <Icon className="w-4 h-4 text-accent-primary" />
                <span className="text-[10px] text-text-secondary">{template.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4 flex-1 flex flex-col gap-4">
        <div>
          <label className="text-sm text-text-secondary mb-2 block">Describe what you want</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g., Show me a line chart of sales data, Create a timeline for my project, Display stats cards..."
            className="input-field h-40 resize-none"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="text-sm text-text-secondary mb-2 block">AI Model</label>
          <div className="relative">
            <select
              value={model}
              onChange={(e) => setModel(e.target.value as ModelProvider)}
              className="select-field w-full"
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

        <button
          type="submit"
          disabled={!prompt.trim() || isLoading}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Generate
            </>
          )}
        </button>

        <p className="text-xs text-text-muted text-center">
          Press ⌘ + Enter to submit
        </p>
      </form>

      {/* Settings - API Key */}
      <div className="border-t border-white/5">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="w-full p-4 flex items-center justify-between text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4" />
            API Settings
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform ${showSettings ? 'rotate-180' : ''}`} />
        </button>
        
        {showSettings && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            className="px-4 pb-4"
          >
            <p className="text-xs text-text-muted mb-3">
              Add your API key to enable real AI generation. Your key is stored locally.
            </p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="sk-..."
                  className="input-field w-full pr-10"
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
                className="btn-primary flex-1 text-sm py-2"
              >
                Save Key
              </button>
              <button
                onClick={handleClearApiKey}
                className="px-3 py-2 text-sm text-red-400 hover:text-red-300 border border-red-400/30 rounded-lg hover:bg-red-400/10 transition-colors"
              >
                Clear
              </button>
            </div>
            <p className="text-xs text-text-muted mt-2">
              Supported: OpenAI, Anthropic, Gemini
            </p>
          </motion.div>
        )}
      </div>

      {/* History */}
      <div className="border-t border-white/5">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-full p-4 flex items-center justify-between text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Recent prompts
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform ${showHistory ? 'rotate-180' : ''}`} />
        </button>
        
        {showHistory && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            className="px-4 pb-4"
          >
            {history.length === 0 ? (
              <p className="text-xs text-text-muted text-center py-4">No history yet</p>
            ) : (
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                {history.slice(0, 10).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setPrompt(item.prompt)}
                    className="text-left p-3 rounded-lg bg-bg-tertiary hover:bg-white/5 transition-colors text-xs"
                  >
                    <p className="text-text-primary line-clamp-2">{item.prompt}</p>
                    <p className="text-text-muted mt-1">{AI_PROVIDERS[item.model].icon} {item.model}</p>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
