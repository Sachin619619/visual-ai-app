import React from 'react';
import { Wand2, Sparkles, Palette, Zap, Layout, Type, Grid, MousePointer, TrendingUp, AlignLeft, Star, Smartphone, BarChart3, Map, Table2, Layers, ChevronDown } from 'lucide-react';

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
  { label: 'Add Table', icon: Table2, prompt: 'add a styled data table with sortable headers, alternating row colors, and relevant comparison data' },
  { label: 'Denser', icon: Layers, prompt: 'pack in more visual elements: add 3-4 more stat cards, an extra chart, and fill any blank areas with relevant data or icons' },
  { label: 'Map View', icon: Map, prompt: 'add a geographic map or world/country breakdown using color-coded blocks and regional stat cards' },
  { label: 'Bar Chart', icon: BarChart3, prompt: 'add a horizontal bar chart ranking/leaderboard showing top items by value with animated bars and rank numbers' },
];

export const QuickRefine: React.FC<QuickRefineProps> = ({ onRefine, isLoading }) => {
  const [showAll, setShowAll] = React.useState(false);
  const visible = showAll ? refinements : refinements.slice(0, 12);

  return (
    <div className="p-3 border-t border-white/5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-accent-primary" />
          <span className="text-xs font-medium text-text-secondary uppercase tracking-wide">Quick Refine</span>
        </div>
        {refinements.length > 12 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-[10px] text-text-muted hover:text-accent-primary transition-colors flex items-center gap-0.5"
          >
            {showAll ? 'Less' : `+${refinements.length - 12} more`}
            <ChevronDown className={`w-3 h-3 transition-transform ${showAll ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {visible.map((item) => (
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
  { label: '📊 Dashboard', category: 'Data', prompt: 'Create a dark premium analytics dashboard — 4 stat cards with gradient numbers (Users 1.2M +12%, Revenue $84K +8%, Conversion 3.4% -1%, Bounce 28% -4%), a 30-day animated line chart for daily active users, traffic sources doughnut chart, and a sortable top pages data table. #0a0a0f background, violet/cyan accents, glassmorphism cards.' },
  { label: '🚀 Landing Page', category: 'UI', prompt: 'Design a high-converting SaaS landing page with: animated hero section with gradient headline and floating particles, feature grid with 6 icon cards and hover glow effects, 3-tier pricing table with "Most Popular" badge, 3 testimonial cards, and CTA footer. Dark premium theme with Outfit font headings.' },
  { label: '🎯 Infographic', category: 'Visual', prompt: 'Create a stunning visual infographic about artificial intelligence — show AI types (narrow, general, super), key milestones timeline from 1950-2025, top AI companies market cap bar chart, real-world applications icon grid, and a neural network SVG diagram with animated connections.' },
  { label: '⚖️ Comparison', category: 'Data', prompt: 'Design a beautiful 3-way comparison for iPhone 16 Pro vs Samsung Galaxy S25 vs Google Pixel 9 Pro — radar chart comparing 6 dimensions, feature table with checkmarks, price/specs stat cards, and a bar chart for camera ratings. Dark premium style with hover effects.' },
  { label: '📈 Stat Cards', category: 'Data', prompt: 'Build a beautiful stat card dashboard — 6 KPI cards with large gradient numbers (50-60px), sparkline Chart.js mini-charts inside each card, trend arrows, animated counter effects counting from 0, and a subtle top accent border. Dark glassmorphism style.' },
  { label: '👤 Profile', category: 'UI', prompt: 'Create a stunning developer profile card — gradient avatar with ring, name + title, bio text, skills as animated tag badges, stat numbers (GitHub repos, stars, contributions), social links, and a contribution heatmap-style grid. Dark theme with accent glow.' },
  { label: '📉 Charts Showcase', category: 'Data', prompt: 'Create a data visualization showcase with 6 different Chart.js chart types: gradient bar chart, area line chart, doughnut with center label, radar comparison, horizontal bar leaderboard, and bubble chart — all with smooth entry animations and dark theme.' },
  { label: '🗓️ Timeline', category: 'Visual', prompt: 'Build a stunning vertical timeline with 8 milestone entries — alternating left/right layout on desktop, date badges, connecting animated gradient line, emoji icon per step, hover highlight effect, and scroll-triggered fade-in animations. Dark premium style.' },
  { label: '₿ Crypto', category: 'Data', prompt: 'Create a cryptocurrency dashboard showing BTC $95,420 (+3.2%), ETH $3,847 (+1.8%), SOL $215 (-0.5%) with animated price sparklines, portfolio pie chart, 7-day price line chart, fear & greed index gauge, and live ticker scrolling animation. Dark trading terminal theme.' },
  { label: '💪 Fitness', category: 'Data', prompt: 'Create a fitness app dashboard — circular progress rings for calories/protein/water goals, 7-day workout streak calendar grid, heart rate line chart over 24h, sleep quality bar chart, and personal best records in stat cards. Sporty dark theme with green/orange accents.' },
  { label: '🏆 Leaderboard', category: 'Data', prompt: 'Create a ranked leaderboard page for a gaming/coding competition — top 10 list with animated score bars, rank number badges (#1 gold, #2 silver, #3 bronze), avatar initials, score with compact formatting, and trend arrows. Dark theme with gold accent.' },
  { label: '⚙️ System Diagram', category: 'Technical', prompt: 'Create a system architecture diagram for a modern web app — SVG flow diagram with client, CDN, API gateway, microservices, database, and cache boxes connected by dashed arrows, color-coded by layer, with latency/throughput stats in side cards.' },
];

export const PromptTemplates: React.FC<PromptTemplatesProps> = ({ onSelect, isLoading }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [activeCategory, setActiveCategory] = React.useState<string>('All');

  const categories = ['All', ...Array.from(new Set(templates.map(t => t.category)))];
  const filtered = activeCategory === 'All' ? templates : templates.filter(t => t.category === activeCategory);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="flex items-center gap-2 px-3 py-2 bg-bg-tertiary hover:bg-accent-primary/20 border border-white/5 hover:border-accent-primary/30 rounded-lg text-sm text-text-secondary hover:text-accent-primary transition-all disabled:opacity-50"
      >
        <Sparkles className="w-4 h-4" />
        Templates
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-2 w-72 bg-bg-secondary border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">
            {/* Category filter */}
            <div className="flex gap-1 p-2 border-b border-white/5 overflow-x-auto scrollbar-hide">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-accent-primary/20 text-accent-primary border border-accent-primary/30' : 'text-text-muted hover:text-text-primary hover:bg-white/5'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="p-2 max-h-64 overflow-y-auto">
              {filtered.map((template) => (
                <button
                  key={template.label}
                  onClick={() => {
                    onSelect(template.prompt);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-bg-tertiary rounded-lg transition-colors text-sm text-text-secondary hover:text-white flex items-center justify-between group"
                >
                  <span>{template.label}</span>
                  <span className="text-[9px] text-text-muted bg-white/5 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">{template.category}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
