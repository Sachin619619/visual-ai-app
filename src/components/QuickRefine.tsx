import React from 'react';
import { Wand2, Sparkles, Palette, Zap, Layout, Type, Grid, MousePointer, TrendingUp, AlignLeft, Star, Smartphone } from 'lucide-react';

interface QuickRefineProps {
  onRefine: (refinement: string) => void;
  isLoading: boolean;
}

const refinements = [
  { label: 'Modern', icon: Layout, prompt: 'make it more modern and sleek with glassmorphism effects, rounded corners, and contemporary styling' },
  { label: 'Colorful', icon: Palette, prompt: 'add more vibrant colors, gradient fills, and neon glow effects throughout' },
  { label: 'Minimal', icon: Type, prompt: 'simplify to minimal design with clean whitespace, subtle borders, and elegant typography' },
  { label: 'Dark Mode', icon: Zap, prompt: 'convert to premium dark mode with #0a0a0f background and violet/cyan neon accents' },
  { label: 'Grid', icon: Grid, prompt: 'organize into a beautiful responsive CSS grid layout with card components and visual hierarchy' },
  { label: 'Interactive', icon: MousePointer, prompt: 'add hover effects, click animations, smooth transitions, and interactive micro-animations throughout' },
  { label: 'Add Charts', icon: Sparkles, prompt: 'add 2-3 beautiful Chart.js charts (bar, line, doughnut) to visualize any data or metrics present' },
  { label: 'Bigger Stats', icon: Wand2, prompt: 'make stat numbers much larger (48-72px) with gradient text, add animated count-up from 0, and visual trend indicators' },
  { label: 'Add Timeline', icon: TrendingUp, prompt: 'add a visual timeline section showing chronological events, milestones, or steps with icons and dates' },
  { label: 'More Text', icon: AlignLeft, prompt: 'expand with more detailed descriptions, explanations, and context for each section while keeping it visual' },
  { label: 'Premium', icon: Star, prompt: 'elevate to premium quality: add subtle particle effects, ambient glow, refined typography with Outfit font, and award-winning polish' },
  { label: 'Mobile', icon: Smartphone, prompt: 'make fully responsive for mobile: stack grid to single column, increase font sizes, add touch-friendly spacing and 48px tap targets' },
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
  { label: 'Dashboard', prompt: 'Create a dark premium analytics dashboard — 4 stat cards with gradient numbers (Users 1.2M +12%, Revenue $84K +8%, Conversion 3.4% -1%, Bounce 28% -4%), a 30-day animated line chart for daily active users, traffic sources doughnut chart, and a sortable top pages data table. #0a0a0f background, violet/cyan accents, glassmorphism cards.' },
  { label: 'Landing', prompt: 'Design a high-converting SaaS landing page with: animated hero section with gradient headline and floating particles, feature grid with 6 icon cards and hover glow effects, 3-tier pricing table with "Most Popular" badge, 3 testimonial cards, and CTA footer. Dark premium theme with Outfit font headings.' },
  { label: 'Infographic', prompt: 'Create a stunning visual infographic about artificial intelligence — show AI types (narrow, general, super), key milestones timeline from 1950-2025, top AI companies market cap bar chart, real-world applications icon grid, and a neural network SVG diagram with animated connections.' },
  { label: 'Comparison', prompt: 'Design a beautiful 3-way comparison for iPhone 16 Pro vs Samsung Galaxy S25 vs Google Pixel 9 Pro — radar chart comparing 6 dimensions, feature table with checkmarks, price/specs stat cards, and a bar chart for camera ratings. Dark premium style with hover effects.' },
  { label: 'Card Grid', prompt: 'Build a beautiful stat card dashboard — 6 KPI cards with large gradient numbers (50-60px), sparkline Chart.js mini-charts inside each card, trend arrows, animated counter effects counting from 0, and a subtle top accent border. Dark glassmorphism style.' },
  { label: 'Profile', prompt: 'Create a stunning developer profile card — gradient avatar with ring, name + title, bio text, skills as animated tag badges, stat numbers (GitHub repos, stars, contributions), social links, and a contribution heatmap-style grid. Dark theme with accent glow.' },
  { label: 'Charts', prompt: 'Create a data visualization showcase with 6 different Chart.js chart types: gradient bar chart, area line chart, doughnut with center label, radar comparison, horizontal bar leaderboard, and bubble chart — all with smooth entry animations and dark theme.' },
  { label: 'Timeline', prompt: 'Build a stunning vertical timeline with 8 milestone entries — alternating left/right layout on desktop, date badges, connecting animated gradient line, emoji icon per step, hover highlight effect, and scroll-triggered fade-in animations. Dark premium style.' },
  { label: 'Crypto', prompt: 'Create a cryptocurrency dashboard showing BTC $95,420 (+3.2%), ETH $3,847 (+1.8%), SOL $215 (-0.5%) with animated price sparklines, portfolio pie chart, 7-day price line chart, fear & greed index gauge, and live ticker scrolling animation. Dark trading terminal theme.' },
  { label: 'Fitness', prompt: 'Create a fitness app dashboard — circular progress rings for calories/protein/water goals, 7-day workout streak calendar grid, heart rate line chart over 24h, sleep quality bar chart, and personal best records in stat cards. Sporty dark theme with green/orange accents.' },
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
