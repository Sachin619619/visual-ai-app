import React from 'react';
import { Wand2, Sparkles, Palette, Zap, Layout, Type, Grid, MousePointer } from 'lucide-react';

interface QuickRefineProps {
  onRefine: (refinement: string) => void;
  isLoading: boolean;
}

const refinements = [
  { label: 'Modern', icon: Layout, prompt: 'make it more modern and sleek with glassmorphism effects' },
  { label: 'Colorful', icon: Palette, prompt: 'add more vibrant colors, gradient fills, and neon glow effects' },
  { label: 'Minimal', icon: Type, prompt: 'simplify to minimal design with clean whitespace and subtle borders' },
  { label: 'Dark Mode', icon: Zap, prompt: 'convert to premium dark mode with #0a0a0f background and violet/cyan neon accents' },
  { label: 'Grid', icon: Grid, prompt: 'organize into a beautiful responsive CSS grid layout with card components' },
  { label: 'Interactive', icon: MousePointer, prompt: 'add hover effects, click animations, and interactive micro-animations throughout' },
  { label: 'Add Charts', icon: Sparkles, prompt: 'add 2-3 beautiful Chart.js charts (bar, line, doughnut) to visualize any data present' },
  { label: 'Bigger Stats', icon: Wand2, prompt: 'make stat numbers much larger with gradient text, add animated count-up, and visual trend indicators' },
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
  { label: 'Dashboard', prompt: 'Create a dark premium analytics dashboard — stat cards with gradient numbers showing Users 1.2M, Revenue $84K, Conversion 3.4%, a 30-day line chart for daily active users, traffic sources doughnut chart, and a top pages data table. Use #0a0a0f background, violet/cyan accents.' },
  { label: 'Landing', prompt: 'Design a high-converting SaaS landing page with animated hero section with gradient headline, feature grid with 6 icon cards and hover effects, 3-tier pricing table, testimonials, and sticky CTA button. Dark premium theme.' },
  { label: 'Card Grid', prompt: 'Build a beautiful stat card dashboard — 4 KPI cards with large gradient numbers, sparkline mini-charts, trend indicators (↑↓), and animated counter effects. Dark glassmorphism style.' },
  { label: 'Form', prompt: 'Create a stunning multi-step form with progress indicator showing 3 steps, animated field transitions, success state, and modern input styling. Dark theme with violet accents.' },
  { label: 'Comparison', prompt: 'Design a beautiful comparison table for 3 products/plans with feature rows, checkmarks/X marks, price highlighting, and a "Most Popular" badge. Dark premium card design with hover effects.' },
  { label: 'Profile', prompt: 'Create a stunning user profile card with gradient avatar, bio, key stats (followers, posts, likes) as large numbers, recent activity feed, and follow button. Social media dark theme.' },
  { label: 'Charts', prompt: 'Create a data visualization showcase with 5 different Chart.js chart types: bar chart, line chart with area fill, doughnut, radar, and horizontal bar — all with gradient fills and dark theme.' },
  { label: 'Timeline', prompt: 'Build a stunning vertical timeline with 6 milestone entries, date badges, connecting gradient line, icon per step, and scroll-triggered fade-in animations. Dark premium style.' },
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
