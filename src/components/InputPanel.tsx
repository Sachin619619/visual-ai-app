import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Sparkles, ChevronDown, Clock } from 'lucide-react';
import { ModelProvider, PromptHistory } from '../types';
import { AI_PROVIDERS } from '../lib/ai-providers';

interface InputPanelProps {
  onGenerate: (prompt: string, model: ModelProvider) => void;
  isLoading: boolean;
  history: PromptHistory[];
}

export function InputPanel({ onGenerate, isLoading, history }: InputPanelProps) {
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState<ModelProvider>('openai');
  const [showHistory, setShowHistory] = useState(false);

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
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-heading text-lg font-semibold gradient-text">Visual AI</h1>
            <p className="text-xs text-text-muted">Generate stunning UIs</p>
          </div>
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
