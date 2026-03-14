import React from 'react';
import { Wand2, Sparkles, Palette, Zap, Layout, Type, Grid, MousePointer } from 'lucide-react';

interface QuickRefineProps {
  onRefine: (refinement: string) => void;
  isLoading: boolean;
}

const refinements = [
  { label: 'Modern', icon: Layout, prompt: 'make it more modern and sleek' },
  { label: 'Colorful', icon: Palette, prompt: 'add more vibrant colors and gradients' },
  { label: 'Minimal', icon: Type, prompt: 'simplify to minimal design with clean whitespace' },
  { label: 'Dark Mode', icon: Zap, prompt: 'convert to dark mode with neon accents' },
  { label: 'Grid', icon: Grid, prompt: 'organize into a structured grid layout' },
  { label: 'Interactive', icon: MousePointer, prompt: 'add hover effects and interactivity' },
];

export const QuickRefine: React.FC<QuickRefineProps> = ({ onRefine, isLoading }) => {
  return (
    <div className="p-3 border-t border-white/5">
      <div className="flex items-center gap-2 mb-3">
        <Wand2 className="w-4 h-4 text-accent-primary" />
        <span className="text-xs font-medium text-text-secondary uppercase tracking-wide">Quick Refine</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {refinements.map((item) => (
          <button
            key={item.label}
            onClick={() => onRefine(item.prompt)}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-bg-tertiary hover:bg-accent-primary/20 border border-white/5 hover:border-accent-primary/30 rounded-lg text-xs text-text-secondary hover:text-accent-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <item.icon className="w-3 h-3" />
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};

interface PromptTemplatesProps {
  onSelect: (template: string) => void;
  isLoading: boolean;
}

const templates = [
  { label: 'Dashboard', prompt: 'Create a modern analytics dashboard with sidebar navigation, stats cards showing key metrics with charts, recent activity feed, and a data table with sorting options. Use a clean dark theme with accent colors.' },
  { label: 'Landing', prompt: 'Design a high-converting SaaS landing page with hero section, feature grid, pricing cards, testimonial carousel, and call-to-action buttons. Modern gradient design.' },
  { label: 'Card Grid', prompt: 'Build a responsive card grid layout with product cards featuring image, title, price, and add-to-cart button. Clean e-commerce style with hover effects.' },
  { label: 'Form', prompt: 'Create a multi-step registration form with input validation, progress indicator, and social login options. Modern and user-friendly design.' },
  { label: 'Chat UI', prompt: 'Design a chat interface with message bubbles, user avatars, typing indicator, input field with emoji picker, and online status indicators.' },
  { label: 'Profile', prompt: 'Create a user profile page with cover photo, avatar, bio section, stats, activity timeline, and settings tabs. Social media style.' },
];

export const PromptTemplates: React.FC<PromptTemplatesProps> = ({ onSelect, isLoading }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="flex items-center gap-2 px-3 py-2 bg-bg-tertiary hover:bg-accent-primary/20 border border-white/5 hover:border-accent-primary/30 rounded-lg text-sm text-text-secondary hover:text-accent-primary transition-all disabled:opacity-50"
      >
        <Sparkles className="w-4 h-4" />
        Templates
      </button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-2 w-64 bg-bg-secondary border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">
            <div className="p-2 max-h-64 overflow-y-auto">
              {templates.map((template) => (
                <button
                  key={template.label}
                  onClick={() => {
                    onSelect(template.prompt);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-bg-tertiary rounded-lg transition-colors text-sm text-text-secondary hover:text-white"
                >
                  {template.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
