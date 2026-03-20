import { memo, useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, RefreshCw, Download, Code, X, Copy, Check, Maximize2, Minimize2, FileCode, FileImage, Layout, Square, Layers, Sparkles, Wand2, FileType, Undo2, Redo2, Sun, Moon, Keyboard, Bookmark, Clipboard, Palette, Shuffle, MoreHorizontal, FileCode2, Share2, Upload, FileText, RotateCcw, Smartphone, Tablet, Monitor, MonitorPlay, Pause, Play, Star, GalleryHorizontal, ZoomIn, ZoomOut, ExternalLink } from 'lucide-react';
import { createSandboxContent } from '../lib/sanitizer';
import { ModelProvider, PreviewTheme, StyleFrame, GenerationStats, ViewportSize } from '../types';
import { AI_PROVIDERS, isApiKeyConfigured } from '../lib/ai-providers';

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
  onRegenerate?: () => void;
  onCancelGeneration?: () => void;
  lastPrompt?: string;
  onShare?: () => void;
  onExport?: () => void;
  onExportPNG?: () => void;
  onExportPDF?: () => void;
  onExportCodePen?: () => void;
  onExportJSFiddle?: () => void;
  onSaveFavorite?: () => void;
  onShowFavorites?: () => void;
  onShowGallery?: () => void;
  visualHistoryCount?: number;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  generationStats?: GenerationStats | null;
  onImproveUI?: () => void;
  isImproving?: boolean;
  improveStatus?: string | null;
}

// Quick start prompts for empty state cards — visual-first
const QUICK_PROMPTS = [
  // Visual explainers
  { key: 'photosynthesis', prompt: 'Create a stunning animated infographic explaining how photosynthesis works — show the sun, chloroplasts, CO2 in, O2 out, glucose production, with labeled diagram and step-by-step flow', label: '🌿 Photosynthesis' },
  { key: 'internet', prompt: 'Create a beautiful animated network diagram explaining how the internet works — show devices, routers, ISPs, DNS, servers with animated data packet flow between nodes', label: '🌐 How Internet Works' },
  { key: 'blockchain', prompt: 'Create a visual explainer for blockchain technology — show linked blocks with hashes, decentralized nodes, transaction flow, with animated chain building', label: '⛓️ Blockchain' },
  { key: 'solar-system', prompt: 'Create a stunning animated solar system infographic showing all planets with relative sizes, orbital paths, and key facts for each planet in info cards', label: '🪐 Solar System' },
  { key: 'brain', prompt: 'Create a beautiful visual infographic about the human brain — labeled diagram of brain regions with functions, animated neural connection sparks, key stats in gradient cards', label: '🧠 Human Brain' },
  // Data / Charts
  { key: 'world-population', prompt: 'Create a stunning dashboard showing world population by continent — use a large bar chart, pie chart showing percentages, and stat cards with population numbers for Asia, Africa, Europe, Americas, Oceania', label: '🌍 World Population' },
  { key: 'tech-companies', prompt: 'Create a beautiful data visualization comparing top tech companies (Apple, Microsoft, Google, Amazon, Meta) — show market cap, revenue, employees in bar charts and stat cards with logos as colored icons', label: '📊 Tech Giants' },
  { key: 'climate-data', prompt: 'Create a climate change data dashboard — show global temperature rise over decades as an animated line chart, CO2 levels chart, sea level rise chart, with alarming stat cards in red/orange theme', label: '🌡️ Climate Data' },
  { key: 'crypto-dashboard', prompt: 'Create a cryptocurrency portfolio dashboard — show price charts for BTC, ETH, SOL with sparklines, portfolio value, percentage changes with green/red indicators, and animated price ticker', label: '₿ Crypto Dashboard' },
  // Comparisons
  { key: 'iphone-android', prompt: 'Create a stunning visual comparison of iPhone vs Android — side-by-side cards with category scores (ecosystem, customization, privacy, price, camera), a radar chart, and feature comparison table with checkmarks', label: '📱 iPhone vs Android' },
  { key: 'react-vue', prompt: 'Create a beautiful visual comparison of React vs Vue vs Angular — compare performance, learning curve, ecosystem, popularity with charts, rating bars, and pros/cons cards per framework', label: '⚛️ React vs Vue vs Angular' },
  { key: 'diet-comparison', prompt: 'Create a visual comparison of popular diets (Keto, Mediterranean, Vegan, Intermittent Fasting) — compare macros with charts, health benefits with icon lists, difficulty ratings with star indicators', label: '🥗 Diet Comparison' },
  // Timelines
  { key: 'space-timeline', prompt: 'Create a stunning animated timeline of space exploration milestones — from Sputnik 1957 to Mars missions 2030s, with mission icons, key achievements, country flags, and animated connecting line', label: '🚀 Space Exploration' },
  { key: 'ai-timeline', prompt: 'Create a beautiful timeline of AI history from 1950 to 2025 — mark key events like Turing Test, Deep Blue, AlexNet, GPT, ChatGPT with icons, descriptions, and visual impact indicators', label: '🤖 AI History Timeline' },
  { key: 'internet-history', prompt: 'Create an animated timeline of the internet age from ARPANET 1969 to 2024 — show key inventions, major websites launch, mobile revolution, social media era with year markers and tech icons', label: '📡 Internet History' },
  // Dashboards
  { key: 'analytics', prompt: 'Create a beautiful dark analytics dashboard with: total users 1.2M (+12%), revenue $84K (+8%), conversion 3.4% (-1%), daily active users line chart over 30 days, traffic sources pie chart, top pages table', label: '📈 Analytics Dashboard' },
  { key: 'fitness', prompt: 'Create a fitness tracking dashboard — weekly workout streak calendar, calories burned bar chart, heart rate line chart, sleep quality ring chart, personal records stat cards, all in a sporty dark theme', label: '💪 Fitness Tracker' },
  { key: 'weather', prompt: 'Create a stunning weather dashboard — current temp with animated condition, 7-day forecast cards, humidity/wind/UV index gauges, hourly temperature line chart, all in a beautiful gradient blue/purple theme', label: '⛅ Weather Dashboard' },
  // Infographics
  { key: 'coffee', prompt: 'Create a beautiful infographic about coffee — show coffee bean to cup journey with illustrated steps, world top coffee producing countries bar chart, caffeine content comparison chart for different drinks, fun facts in info cards', label: '☕ Coffee Infographic' },
  { key: 'money', prompt: 'Create a visually stunning personal finance infographic — show income allocation pie chart (50/30/20 rule), compound interest growth line chart, savings milestones timeline, budgeting tips in icon cards', label: '💰 Personal Finance' },
  { key: 'ocean', prompt: 'Create a beautiful ocean depth infographic — show ocean zones from surface to hadal zone with gradient depth colors, creatures at each zone as icons, pressure and temperature data, amazing facts in floating cards', label: '🌊 Ocean Depths' },
  // Fun / Creative
  { key: 'pizza', prompt: 'Create a fun and beautiful pizza anatomy infographic — show ingredient layers as an exploded diagram, most popular topping rankings as a bar chart, pizza consumption by country, and fun facts in colorful cards', label: '🍕 Pizza Infographic' },
  { key: 'music', prompt: 'Create a music genres visual map — show genres as interconnected bubbles with size = popularity, timeline of music evolution, top streaming stats by genre in a bar chart, all in a neon dark theme', label: '🎵 Music Genres' },
  // Science & Nature
  { key: 'dna-infographic', prompt: 'Create a stunning animated infographic about DNA and genetics — show the double helix structure with labeled components, how DNA replication works step-by-step, key stats about the human genome, and CRISPR gene editing in a diagram', label: '🧬 DNA & Genetics' },
  { key: 'periodic-table-viz', prompt: 'Create a beautiful interactive visualization of the periodic table — show elements by category with color coding, key element properties as tooltips on hover, most abundant elements bar chart, and timeline of element discoveries', label: '⚗️ Periodic Table' },
  { key: 'black-hole', prompt: 'Create a visually stunning space infographic about black holes — show types (stellar, supermassive), Hawking radiation diagram, event horizon anatomy, famous black holes like Sagittarius A* with size comparison to our solar system, gravitational lensing effect', label: '🌑 Black Holes' },
  { key: 'human-body-systems', prompt: 'Create a beautiful infographic about human body systems — show 10 major systems (skeletal, muscular, nervous, circulatory, etc.) as icon cards with key facts, body system interaction diagram, most common diseases per system', label: '🫀 Human Body Systems' },
  // Technology & AI
  { key: 'machine-learning', prompt: 'Create a stunning visual explainer of machine learning — show supervised vs unsupervised vs reinforcement learning with diagrams, neural network layers visualization, training process flow, real-world applications in icon cards', label: '🤖 Machine Learning' },
  { key: 'cybersecurity', prompt: 'Create a cybersecurity threat landscape infographic — show attack types (phishing, ransomware, DDoS) with icons and descriptions, security framework layers diagram, global cybercrime cost bar chart by year, top industries targeted', label: '🔒 Cybersecurity' },
  { key: 'cloud-computing', prompt: 'Create a beautiful cloud computing explainer — show IaaS vs PaaS vs SaaS layers as a visual stack diagram, cloud market share pie chart (AWS, Azure, GCP), latency vs cost trade-offs, key benefits in animated stat cards', label: '☁️ Cloud Computing' },
  { key: 'ev-cars', prompt: 'Create a beautiful infographic comparing electric vs gas vehicles — show total cost of ownership line chart over 10 years, CO2 emissions comparison, charging time vs refuel time, top EV models by range in a horizontal bar chart, global EV adoption by country', label: '⚡ EV vs Gas Cars' },
  // Business & Economics
  { key: 'startup-stages', prompt: 'Create a startup funding journey infographic — show stages from idea to IPO (Pre-seed, Seed, Series A/B/C, IPO) as a visual timeline with typical funding amounts, equity dilution chart, success statistics at each stage, and key metrics investors look for', label: '🚀 Startup Journey' },
  { key: 'global-economy', prompt: 'Create a global economy dashboard — show GDP by country as a treemap, GDP growth line chart (last 20 years), top 10 economies bar chart, inflation vs unemployment scatter chart, trade balance comparison between major economies', label: '💹 Global Economy' },
  { key: 'supply-chain', prompt: 'Create a supply chain visualization — show the journey from raw materials to consumer with animated flow arrows, bottleneck indicators, key risks at each stage, disruption impact data from COVID-19, cost breakdown pie chart', label: '📦 Supply Chain' },
  // Health & Wellness
  { key: 'sleep-science', prompt: 'Create a sleep science infographic — show sleep cycle stages (REM, N1-N3) as an animated wave chart, optimal sleep duration by age bar chart, effects of sleep deprivation on health icon cards, tips for better sleep in numbered steps with icons', label: '😴 Sleep Science' },
  { key: 'nutrition-guide', prompt: 'Create a nutrition visual guide — show macronutrient breakdown (protein, carbs, fats) pie charts for different diets, vitamins & minerals reference table, daily calorie needs by activity level bar chart, food groups pyramid with serving sizes', label: '🥦 Nutrition Guide' },
  // Geography & Society
  { key: 'country-comparison', prompt: 'Create a country comparison dashboard for USA vs China vs EU — show GDP, population, military spending, renewable energy %, happiness index, CO2 emissions as a beautiful radar/spider chart and side-by-side stat cards with color-coded indicators', label: '🗺️ Country Comparison' },
  { key: 'languages-world', prompt: 'Create a world languages infographic — show top 10 languages by native speakers in a horizontal bar chart, language family tree diagram, most translated books chart, languages at risk of extinction timeline, and fun linguistics facts in icon cards', label: '🌐 World Languages' },
  // NEW prompts
  { key: 'gaming-stats', prompt: 'Create a gaming stats dashboard — player level XP progress bar, achievements grid with icons, match history with win/loss record, leaderboard ranking, and recent playtime stats. Dark theme with neon purple/cyan accents.', label: '🎮 Gaming Dashboard' },
  { key: 'food-delivery', prompt: 'Create a food delivery app homepage — restaurant cards with images, ratings, delivery time, and cuisine tags. Search bar at top, category filters, and promotional banner. Clean mobile-friendly design.', label: '🍔 Food Delivery' },
  { key: 'music-player', prompt: 'Create a sleek music player interface — album art, play/pause/skip controls, progress bar, volume slider, playlist queue, and currently playing info. Dark theme with gradient accents.', label: '🎧 Music Player' },
  { key: 'email-client', prompt: 'Create a modern email dashboard — inbox list with sender, subject, preview, and timestamp. Unread indicators, star/favorite toggle, and email preview panel. Professional dark theme.', label: '📧 Email Dashboard' },
  { key: 'health-metrics', prompt: 'Create a health metrics dashboard — heart rate chart over time, blood pressure indicators, step count with daily goal progress ring, calories burned, and sleep quality score. Clean medical-style design.', label: '🏥 Health Dashboard' },
  { key: 'real-estate', prompt: 'Create a property listing page — property cards with images, price, location, beds/baths/sqft, and agent contact button. Map view toggle, filters sidebar, and sort options. Modern card-based design.', label: '🏠 Real Estate' },
  { key: 'job-board', prompt: 'Create a job board dashboard — job cards with company logo, position title, salary range, location, and tags (remote, full-time, etc.). Search bar, filter by category, and application deadline indicators.', label: '💼 Job Board' },
  { key: 'ecommerce-admin', prompt: 'Create an e-commerce admin dashboard — orders table with status badges, revenue chart, top products list, customer stats, and inventory alerts. Professional dark admin theme.', label: '📊 E-commerce Admin' },
  // Additional prompts
  { key: 'social-media', prompt: 'Create a social media analytics dashboard — follower growth chart, engagement rate gauge, top posts list with likes/comments, demographics pie chart, and scheduled posts calendar. Professional dark theme.', label: '📱 Social Analytics' },
  { key: 'banking', prompt: 'Create a modern banking dashboard — account balances with gradient cards, recent transactions list with icons, spending categories pie chart, credit score gauge, and transfer money section. Dark premium theme.', label: '🏦 Banking Dashboard' },
  { key: 'education', prompt: 'Create an online learning dashboard — course progress cards with completion bars, video player with controls, quiz scores, certificates earned, and recommended next lessons. Modern dark design.', label: '🎓 Learning Platform' },
  { key: 'hotel-booking', prompt: 'Create a hotel booking interface — room cards with images, amenities icons, price per night, ratings, and "Book Now" button. Date picker, guest count selector, and filter by price/stars.', label: '🏨 Hotel Booking' },
  { key: 'flight-tracker', prompt: 'Create a flight tracking dashboard — live flight status cards with departure/arrival times, route map visualization, gate/terminal info, delay indicators, and nearby flights list.', label: '✈️ Flight Tracker' },
  { key: 'restaurant-reservation', prompt: 'Create a restaurant reservation page — restaurant cards with cuisine, rating, price range, available time slots grid, party size selector, and confirmation summary.', label: '🍽️ Restaurant Booking' },
  { key: 'todo-app', prompt: 'Create a beautiful todo app — task list with checkboxes, categories/tags, due dates, priority indicators, progress bar, and completed tasks section. Clean dark design with accent colors.', label: '✅ Todo App' },
  { key: 'notes-app', prompt: 'Create a notes application — card-based notes with title, preview text, color tags, last edited time, and search functionality. Grid layout with hover effects.', label: '📝 Notes App' },
  { key: 'calendar-app', prompt: 'Create a calendar dashboard — monthly view with event dots, upcoming events sidebar, create event form, color-coded event categories, and today indicator.', label: '📅 Calendar' },
  { key: 'file-manager', prompt: 'Create a file manager interface — folder/file grid with icons, breadcrumb navigation, storage usage bar, search bar, and view toggle (grid/list). Dark modern theme.', label: '📁 File Manager' },
  { key: 'code-editor', prompt: 'Create a code editor interface — file tabs, line-numbered code area with syntax highlighting, terminal panel, file explorer sidebar, and status bar. Dark VS Code-style theme.', label: '💻 Code Editor' },
  { key: 'api-dashboard', prompt: 'Create an API monitoring dashboard — endpoint status cards with response times, uptime percentage, error rate chart, request volume graph, and recent API calls log.', label: '🔌 API Monitor' },
  { key: 'server-metrics', prompt: 'Create a server metrics dashboard — CPU, memory, disk usage gauges, network traffic chart, active connections list, process table, and alert notifications.', label: '🖥️ Server Metrics' },
  { key: 'iot-dashboard', prompt: 'Create an IoT smart home dashboard — device cards with on/off status, temperature/humidity sensors, energy usage chart, automation rules list, and device controls.', label: '🏠 Smart Home' },
  { key: 'nft-gallery', prompt: 'Create an NFT gallery — collectible cards with artwork images, collection name, floor price, owners count, and activity history. Filter by collection, sort by price.', label: '🖼️ NFT Gallery' },
  { key: 'stock-trading', prompt: 'Create a stock trading interface — live price chart with candlesticks, buy/sell buttons, order book, position summary, watchlist, and recent trades. Professional trading theme.', label: '📈 Stock Trading' },
  // Science & Research
  { key: 'cell-biology', prompt: 'Create a stunning biology infographic about cell structure — labeled cell diagram with organelles, plant vs animal cell comparison table, key stats about cells in the human body. Dark emerald/teal theme.', label: '🧬 Cell Biology' },
  { key: 'sustainability', prompt: 'Create a sustainability metrics dashboard — carbon footprint gauge, renewable energy mix donut chart, emissions reduction line chart, top CO2 contributors leaderboard, and climate action goal progress bars. Dark green theme.', label: '🌿 Sustainability' },
  { key: 'astronomy', prompt: 'Create a stunning space infographic — planets size comparison horizontal bar chart, distance from sun visualization, space mission history timeline with key milestones, discovery stat cards. Deep space dark with indigo/cyan accents.', label: '🔭 Astronomy' },
  // Business
  { key: 'case-study', prompt: 'Create a business case study visual report — problem/solution/result flow with connecting arrows, before vs after metric comparison (revenue, costs, efficiency), implementation timeline, and Key Takeaways panel. Finance blue/green theme.', label: '📋 Case Study' },
  { key: 'okr-tracker', prompt: 'Create a company OKR tracker for Q1 2025 — 3 Objectives as header cards, Key Results with progress bars and % completion, team ownership badges, and a quarterly timeline. Professional dark blue theme.', label: '🎯 OKR Tracker' },
  // Security
  { key: 'security-audit', prompt: 'Create a cybersecurity audit report — vulnerability severity donut chart (critical/high/medium/low counts), OWASP top 10 threat checklist, risk score gauges, remediation timeline Gantt chart, and compliance framework status. Dark red/orange threat theme.', label: '🔒 Security Audit' },
  // Art & Culture
  { key: 'art-history', prompt: 'Create a visual timeline of art history movements from Renaissance (1400s) to Digital Art (2000s) — each era as a styled card showing defining traits, key artists, signature colors, and a movement evolution flow diagram. Warm artistic dark theme.', label: '🎨 Art History' },
  // Finance
  { key: 'budget-planner', prompt: 'Create a personal budget planner dashboard — monthly income vs expenses donut chart, spending by category bar chart (Housing 35%, Food 15%, Transport 12%, etc.), savings goal progress rings for Emergency Fund, Vacation, Retirement, and net worth trend line chart. Finance blue/green palette.', label: '💹 Budget Planner' },
  // AI & Future Tech
  { key: 'llm-comparison', prompt: 'Create a stunning AI model comparison dashboard — radar chart comparing GPT-4o, Claude 3.5, Gemini 1.5, Llama 3 across reasoning, coding, creativity, speed, and cost dimensions. Show context window sizes as a bar chart, pricing tiers as a table, and real-world benchmark scores. Dark tech cyan/violet theme.', label: '🧠 LLM Comparison' },
  { key: 'neural-network', prompt: 'Create an animated neural network architecture visualization — show input layer, hidden layers, output layer as glowing nodes with animated connection lines. Include forward/backprop flow arrows, activation function mini-charts (ReLU, sigmoid, tanh), and layer stats in glassmorphism cards. Deep tech dark theme.', label: '🔮 Neural Network' },
  { key: 'quantum-computing', prompt: 'Create a quantum computing explainer infographic — show qubit vs bit comparison, quantum superposition/entanglement diagrams, quantum gates circuit visualization, and a timeline of quantum milestones. Include use cases (cryptography, drug discovery, optimization) as icon cards. Deep indigo/cyan space theme.', label: '⚛️ Quantum Computing' },
  // India-specific
  { key: 'india-economy', prompt: 'Create a stunning India economy dashboard — GDP growth line chart (2015-2025), sector breakdown pie chart (agriculture, industry, services), FDI inflows bar chart, top export categories, UPI transaction growth chart, and key macro stats (inflation, forex reserves, unemployment) in gradient stat cards. Saffron/green/blue India theme.', label: '🇮🇳 India Economy' },
  { key: 'ipl-stats', prompt: 'Create a stunning IPL statistics dashboard — top run scorers bar chart, most wickets leaderboard, team win percentage radar chart, season-wise champions timeline, highest partnerships list, and Orange/Purple cap winners. Dark cricket stadium atmosphere with vibrant color accents.', label: '🏏 IPL Stats' },
  // Health & Biohacking
  { key: 'longevity-guide', prompt: 'Create a longevity and healthy aging infographic — show the 9 hallmarks of aging as an icon grid, Blue Zone habits comparison (Okinawa, Sardinia, etc.), lifespan vs healthspan line chart, top longevity interventions ranked by evidence strength, and daily habit checklist cards. Dark emerald/teal vitality theme.', label: '🧬 Longevity Guide' },
  // Visual explainers
  { key: 'how-gpt-works', prompt: 'Create a beautiful visual explainer of how ChatGPT/LLMs work — show tokenization step, transformer attention mechanism diagram, training data scale visualization, RLHF fine-tuning flow, and inference pipeline. Use animated connecting arrows between stages. Dark tech theme with violet/cyan.', label: '🤖 How GPT Works' },
  { key: 'options-trading', prompt: 'Create a stunning options trading visual guide — show call vs put payoff diagrams as line charts, options greeks (delta, gamma, theta, vega) as icon cards with explanations, strike price vs premium scatter plot, and popular strategies (covered call, straddle, iron condor) as visual P&L charts. Finance dark theme.', label: '📊 Options Trading' },
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
}) => {
  // Extract a short description from the prompt (after the first clause)
  const shortDesc = item.prompt.split('—')[1]?.trim().split(',')[0]?.replace(/^show|create|build|design/i, '').trim().slice(0, 40) || '';
  return (
    <motion.button
      key={item.key}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={() => onClick(item.prompt)}
      disabled={disabled}
      aria-label={`Generate: ${item.label}`}
      title={item.prompt.slice(0, 80) + (item.prompt.length > 80 ? '...' : '')}
      className="w-full p-2.5 sm:p-3 rounded-xl bg-bg-secondary/80 border border-white/5 hover:border-accent-primary/50 hover:bg-accent-primary/10 transition-all cursor-pointer disabled:opacity-50 group hover:scale-[1.02] active:scale-[0.98] min-h-[56px] sm:min-h-[64px] flex flex-col justify-center gap-0.5 text-left"
    >
      <p className="text-accent-primary text-[11px] sm:text-xs font-semibold group-hover:text-accent-secondary transition-colors leading-tight">{item.label}</p>
      {shortDesc && <p className="text-text-muted text-[9px] sm:text-[10px] leading-tight line-clamp-1 opacity-70">{shortDesc}</p>}
    </motion.button>
  );
});

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
}) => {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? items : items.slice(0, 12);
  return (
    <div>
      <div
        className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-2 text-left max-w-xs xs:max-w-sm sm:max-w-md mx-auto"
        role="list"
        aria-label="Quick start prompts"
      >
        {visible.map((item, index) => (
          <div key={item.key} role="listitem">
            <QuickStartButton
              item={item}
              index={index}
              onClick={onClick}
              disabled={disabled}
            />
          </div>
        ))}
      </div>
      {items.length > 12 && (
        <div className="flex justify-center mt-2">
          <button
            onClick={() => setShowAll(prev => !prev)}
            className="text-[10px] sm:text-xs text-text-muted hover:text-accent-primary transition-colors px-3 py-1 rounded-full hover:bg-accent-primary/10"
          >
            {showAll ? '↑ Show less' : `+ Show ${items.length - 12} more prompts`}
          </button>
        </div>
      )}
    </div>
  );
});

QuickStartGrid.displayName = 'QuickStartGrid';

// Cycling loading messages
const LOADING_MESSAGES = [
  'Painting your infographic...',
  'Building beautiful charts...',
  'Designing your visual story...',
  'Adding animations and glow...',
  'Composing the layout...',
  'Crafting gradient magic...',
  'Rendering your dashboard...',
  'Creating visual excellence...',
  'Blending colors and gradients...',
  'Weaving data into visuals...',
  'Polishing the pixel perfect details...',
  'Generating glassmorphism cards...',
  'Animating the timeline...',
  'Calibrating chart axes...',
  'Sprinkling D3 magic dust...',
  'Rendering neon glows...',
  'Assembling the data story...',
  'Tuning hover interactions...',
  'Crafting interactive charts...',
  'Adding smooth transitions...',
  'Styling with CSS mastery...',
  'Building animated visualizations...',
  'Designing comparison layouts...',
  'Creating radar charts...',
  'Generating data tables...',
  'Adding sparkle effects...',
  'Optimizing for wow moments...',
  'Bringing your vision to life...',
  'Fine-tuning color palettes...',
  'Wiring up tabs and accordions...',
  'Building interactive filters...',
  'Coding click animations...',
  'Setting up modal dialogs...',
  'Adding live search functionality...',
  'Programming sortable tables...',
  'Crafting topic-matched palette...',
  'Inserting key takeaways panel...',
  'Tuning glassmorphism layers...',
  'Building force-directed graph...',
  'Animating sunburst chart...',
  'Calculating treemap layout...',
  'Drawing SVG flow diagram...',
  'Rendering heatmap calendar...',
  'Composing the hero banner...',
  'Staggering entry animations...',
  'Finalizing the visual story...',
  'Laying out comparison cards...',
  'Building the force-directed graph...',
  'Generating the Gantt timeline...',
  'Wiring the VS comparison panel...',
  'Painting the gradient headlines...',
  'Assembling step tracker flow...',
  'Applying topic-matched dark theme...',
  'Crafting neon glow accents...',
  'Drawing the sunburst layers...',
  'Constructing alert banners...',
  'Placing chip tag pills...',
  'Polishing the above-the-fold hero...',
  // New messages
  'Sculpting circular gauge meters...',
  'Forging the kanban board lanes...',
  'Weaving the spotlight glow effect...',
  'Morphing the blob background shapes...',
  'Injecting the frosted badge pills...',
  'Calibrating the radar chart axes...',
  'Connecting the force-directed nodes...',
  'Spinning up the donut rings...',
  'Stitching the heatmap grid together...',
  'Scripting the tab-switch interactions...',
  'Stretching the sparkline curves...',
  'Casting the glassmorphism shadows...',
  'Firing up the Chart.js animations...',
  'Aligning the gradient text headers...',
  'Layering the ambient depth orbs...',
];

const BUILD_STAGES = [
  { label: 'Planning', icon: '🧠', threshold: 0 },
  { label: 'Building', icon: '🔨', threshold: 8 },
  { label: 'Polishing', icon: '✨', threshold: 18 },
];

const LoadingMessage = memo(() => {
  const [index, setIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(Date.now());
  useEffect(() => {
    startRef.current = Date.now();
    const msg = setInterval(() => setIndex(i => (i + 1) % LOADING_MESSAGES.length), 2200);
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - startRef.current) / 1000)), 1000);
    return () => { clearInterval(msg); clearInterval(timer); };
  }, []);
  const estimate = elapsed < 10 ? `~${20 - elapsed}s remaining` : elapsed < 30 ? 'almost there...' : 'taking longer than usual...';
  const activeStage = BUILD_STAGES.reduce((acc, s) => elapsed >= s.threshold ? s : acc, BUILD_STAGES[0]);

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Build stage indicator */}
      <div className="flex items-center gap-1.5 mb-1">
        {BUILD_STAGES.map((stage, i) => {
          const isActive = stage.label === activeStage.label;
          const isDone = BUILD_STAGES.indexOf(activeStage) > i;
          return (
            <div key={stage.label} className="flex items-center gap-1.5">
              <motion.div
                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium transition-all"
                animate={isActive ? { scale: [1, 1.06, 1] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{
                  background: isDone ? 'rgba(16,185,129,0.15)' : isActive ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${isDone ? 'rgba(16,185,129,0.4)' : isActive ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.08)'}`,
                  color: isDone ? '#34d399' : isActive ? '#c4b5fd' : '#475569',
                }}
              >
                <span>{isDone ? '✓' : stage.icon}</span>
                <span>{stage.label}</span>
                {isActive && (
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  >…</motion.span>
                )}
              </motion.div>
              {i < BUILD_STAGES.length - 1 && (
                <div className="w-3 h-px" style={{ background: isDone ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.1)' }} />
              )}
            </div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35 }}
          className="text-sm sm:text-base text-text-muted"
        >
          {LOADING_MESSAGES[index]}
        </motion.p>
      </AnimatePresence>
      <p className="text-[10px] sm:text-xs text-text-muted/50 tabular-nums">
        {elapsed}s elapsed · {estimate}
      </p>
    </div>
  );
});
LoadingMessage.displayName = 'LoadingMessage';

// Send HTML to the renderer.html page via postMessage — works reliably on all mobile browsers
// renderer.html is served from the same origin so no blob URL / CSP issues
//
// Protocol:
//   First load:  set iframe.src → renderer.html fires RENDERER_READY → parent sends SET_CONTENT
//   Subsequent:  parent sends PING_READY → renderer echoes RENDERER_READY → parent sends SET_CONTENT
//
// PING_READY is also handled when the renderer is mid-cycle (document.write in progress):
// the listener is dead during that window, so PING_READY is lost — but DATA_CHART_INIT_SCRIPT
// fires RENDERER_READY when the cycle completes, which the parent's pending handler catches.
//
// "Latest wins": if setIframeContent is called again before the previous delivery completes,
// the previous handler is cancelled and only the latest content is delivered.

let _activeHandler: ((e: MessageEvent) => void) | null = null;

function setIframeContent(iframe: HTMLIFrameElement, content: string) {
  const RENDERER = '/renderer.html';

  // Cancel any in-flight delivery — latest content wins
  if (_activeHandler) {
    window.removeEventListener('message', _activeHandler);
    _activeHandler = null;
  }

  // Wait for RENDERER_READY, then deliver content
  const handler = (event: MessageEvent) => {
    if (event.data?.type !== 'RENDERER_READY') return;
    window.removeEventListener('message', handler);
    if (_activeHandler === handler) _activeHandler = null;
    iframe.contentWindow?.postMessage({ type: 'SET_CONTENT', html: content }, '*');
  };
  _activeHandler = handler;
  window.addEventListener('message', handler);

  if (!iframe.src || !iframe.src.endsWith('/renderer.html')) {
    // First load — RENDERER_READY fires automatically when renderer.html loads
    iframe.src = RENDERER;
  } else {
    // Already loaded — ping the renderer to echo RENDERER_READY back
    // If renderer is mid-cycle (listener dead), PING_READY is silently lost,
    // but DATA_CHART_INIT_SCRIPT will fire RENDERER_READY when the cycle finishes
    iframe.contentWindow?.postMessage({ type: 'PING_READY' }, '*');
  }
}

export const VisualRenderer = memo(function VisualRenderer({ html, isLoading, onClear, onUndo, onRedo, onApplyCode, model, styleFrame = 'card', onStyleFrameChange, onQuickGenerate, onRefinePrompt, onRegenerate, onCancelGeneration, lastPrompt, onShare, onExport, onExportCodePen, onExportJSFiddle, onSaveFavorite, onShowFavorites, onShowGallery, visualHistoryCount, theme = 'dark', onToggleTheme, generationStats, onImproveUI, isImproving, improveStatus }: VisualRendererProps) {
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
  const [showRevisualizeMenu, setShowRevisualizeMenu] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);

  const handleZoomIn = useCallback(() => setZoomLevel(prev => Math.min(prev + 10, 200)), []);
  const handleZoomOut = useCallback(() => setZoomLevel(prev => Math.max(prev - 10, 25)), []);
  const handleZoomReset = useCallback(() => setZoomLevel(100), []);

  // Memoize syntax-highlighted HTML to avoid re-computing on every render
  const highlightedResult = useMemo(() => highlightHTML(html || ''), [html]);

  // Load saved viewport from localStorage on mount
  useEffect(() => {
    const savedViewport = localStorage.getItem('visual-ai-viewport');
    if (savedViewport && VIEWPORTS.some(v => v.id === savedViewport)) {
      setViewportSize(savedViewport as ViewportSize);
    }
  }, []);

  // Save viewport to localStorage when changed
  const handleViewportChange = (viewportId: ViewportSize) => {
    setViewportSize(viewportId);
    localStorage.setItem('visual-ai-viewport', viewportId);
    setShowViewportSelector(false);
  };

  // Color scheme definitions for instant theme switching
  const COLOR_SCHEMES = [
    { id: 'violet', name: 'Violet', primary: '#8b5cf6', secondary: '#06b6d4' },
    { id: 'rose', name: 'Rose', primary: '#f43f5e', secondary: '#f97316' },
    { id: 'emerald', name: 'Emerald', primary: '#10b981', secondary: '#06b6d4' },
    { id: 'amber', name: 'Amber', primary: '#f59e0b', secondary: '#ef4444' },
    { id: 'blue', name: 'Blue', primary: '#3b82f6', secondary: '#8b5cf6' },
    { id: 'pink', name: 'Pink', primary: '#ec4899', secondary: '#a855f7' },
    { id: 'teal', name: 'Teal', primary: '#14b8a6', secondary: '#3b82f6' },
    { id: 'orange', name: 'Orange', primary: '#f97316', secondary: '#eab308' },
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

    // Build a CSS override that broadly replaces violet (#8b5cf6) and cyan (#06b6d4)
    // with the selected scheme colors using targeted CSS variable overrides
    styleEl.textContent = `
      :root {
        --accent-primary: ${scheme.primary} !important;
        --accent-secondary: ${scheme.secondary} !important;
        --color-primary: ${scheme.primary} !important;
      }
      /* Tailwind-style accent overrides */
      .text-accent-primary, .text-violet-400, .text-purple-400, .text-purple-500 { color: ${scheme.primary} !important; }
      .bg-accent-primary, .bg-violet-500, .bg-purple-500, .bg-purple-600 { background-color: ${scheme.primary} !important; }
      .border-accent-primary, .border-violet-500, .border-purple-500 { border-color: ${scheme.primary} !important; }
      /* Gradient overrides */
      .bg-gradient-to-r, .gradient-bg { background: linear-gradient(135deg, ${scheme.primary}, ${scheme.secondary}) !important; }
      .btn, button[style*="#8b5cf6"], button[style*="8b5cf6"] { background: linear-gradient(135deg, ${scheme.primary}, ${scheme.secondary}) !important; }
      /* CSS variable-based colors in inline styles */
      [style*="color: #8b5cf6"], [style*="color:#8b5cf6"] { color: ${scheme.primary} !important; }
      [style*="background-color: #8b5cf6"], [style*="background-color:#8b5cf6"] { background-color: ${scheme.primary} !important; }
      [style*="background: #8b5cf6"], [style*="background:#8b5cf6"] { background: ${scheme.primary} !important; }
      [style*="border-color: #8b5cf6"], [style*="border-color:#8b5cf6"] { border-color: ${scheme.primary} !important; }
      [style*="stroke: #8b5cf6"], [style*="stroke:#8b5cf6"] { stroke: ${scheme.primary} !important; }
      [style*="fill: #8b5cf6"], [style*="fill:#8b5cf6"] { fill: ${scheme.primary} !important; }
      [style*="box-shadow"][style*="#8b5cf6"] { box-shadow: 0 0 20px ${scheme.primary}55 !important; }
    `;
    setColorScheme(schemeId);
    setShowColorSchemes(false);
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
    { keys: ['⌘', 'Shift', 'R'], description: 'Regenerate last prompt' },
    { keys: ['⌘', '/'], description: 'Show shortcuts' },
    { keys: ['Esc'], description: 'Exit fullscreen' },
    { keys: ['⌘', '+'], description: 'Zoom in' },
    { keys: ['⌘', '-'], description: 'Zoom out' },
    { keys: ['⌘', '0'], description: 'Reset zoom' },
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
      
      // Use html2canvas on the content (dynamic import to reduce initial bundle)
      const { default: html2canvas } = await import('html2canvas');
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
    // Safely encode HTML as a JSON string to avoid template literal injection
    const safeHtml = JSON.stringify(html);
    const reactCode = `import React from 'react';

export default function ${componentName}() {
  const html = ${safeHtml};
  return (
    <div dangerouslySetInnerHTML={{ __html: html }} />
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

  // Open in a new browser tab for full-screen clean preview
  const handleOpenInNewTab = useCallback(() => {
    if (!html) return;
    const content = createSandboxContent(html, previewTheme);
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const newTab = window.open(url, '_blank');
    // Revoke URL after the tab has had time to load
    if (newTab) {
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    }
  }, [html, previewTheme]);

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
      
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(container, {
        backgroundColor: previewTheme === 'dark' ? '#0f0f23' : '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
      });

      document.body.removeChild(container);

      // Create PDF with jsPDF (dynamic import)
      const { jsPDF } = await import('jspdf');
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
      'visual-ai-kimi-key',
      'visual-ai-minimax-key',
      'visual-ai-free-model',
      'visual-ai-model',
      'visual-ai-dark-mode',
      'visual-ai-theme',
      'visual-ai-auto-enhance',
      'visual-ai-templates',
      'visual-ai-favorites',
      'visual-ai-visual-history',
      'visual-ai-viewport',
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
          setIframeContent(iframeRef.current, sandboxedContent);
        } catch (err) {
          console.error('Failed to load file:', err);
        }
      }
    };
    reader.onerror = () => {
      console.error('Failed to read file:', file.name);
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
      // Extract key data/content from the current HTML (first 800 chars of body text)
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      const textContent = (tempDiv.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 400);

      // Randomly pick a remix style to avoid repetition
      const remixStyles = [
        'neon cyberpunk with bright magenta, electric blue, and hot pink accents on deep black background',
        'ocean theme with deep teal, coral, and aquamarine gradients on navy background',
        'sunset warm theme with amber, orange, crimson on deep brown/maroon background',
        'forest theme with emerald green, lime, and gold on very dark green background',
        'monochrome minimal with only white/grey tones on near-black background, maximizing typography',
        'aurora borealis theme with purple, green, pink swirling gradients',
      ];
      const style = remixStyles[Math.floor(Math.random() * remixStyles.length)];

      const remixPrompt = `Create a visually DIFFERENT remix of a dashboard/visualization about this topic: "${textContent}". Use a completely different color scheme: ${style}. Keep the same type of data and content, but change the layout, color palette, and visual style entirely. Make it stunning and portfolio-worthy.`;

      if (onQuickGenerate) {
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
      
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(container, {
        backgroundColor: previewTheme === 'dark' ? '#0f0f23' : '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
      });

      document.body.removeChild(container);

      canvas.toBlob(async (blob: Blob | null) => {
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

  // Cache the last sandbox content to avoid re-rendering when nothing changed
  const lastSandboxRef = useRef<{ html: string; theme: PreviewTheme; content: string } | null>(null);

  useEffect(() => {
    if (html && iframeRef.current) {
      try {
        // Skip re-render if content hasn't changed
        if (lastSandboxRef.current?.html === html && lastSandboxRef.current?.theme === previewTheme) {
          return;
        }
        const content = createSandboxContent(html, previewTheme);
        lastSandboxRef.current = { html, theme: previewTheme, content };
        setIframeContent(iframeRef.current, content);
        setError(null);
      } catch (err) {
        setError('Failed to render content');
        console.error(err);
      }
    }
  }, [html, previewTheme]);

  // Handle Escape key to exit fullscreen + zoom keyboard shortcuts
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
      // Cmd/Ctrl + = or + to zoom in
      if ((e.metaKey || e.ctrlKey) && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        setZoomLevel(prev => Math.min(prev + 10, 200));
      }
      // Cmd/Ctrl + - to zoom out
      if ((e.metaKey || e.ctrlKey) && e.key === '-') {
        e.preventDefault();
        setZoomLevel(prev => Math.max(prev - 10, 25));
      }
      // Cmd/Ctrl + 0 to reset zoom
      if ((e.metaKey || e.ctrlKey) && e.key === '0') {
        e.preventDefault();
        setZoomLevel(100);
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
        <div className="flex-1 flex items-center overflow-x-auto overflow-y-hidden scrollbar-hide min-w-0 px-1 sm:px-3 gap-0.5 sm:gap-1 [-webkit-overflow-scrolling:touch]">
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
            {/* Open in New Tab */}
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={handleOpenInNewTab}
              className="hidden sm:flex p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-bg-secondary/90 backdrop-blur-md text-text-secondary hover:text-accent-secondary transition-all min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] items-center justify-center hover:scale-105 active:scale-95"
              title="Open in New Tab (full-screen preview)"
            >
              <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.button>
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
            {/* Viewport Size Selector - visible on tablet+ directly, mobile via more menu */}
            <div className="relative hidden sm:block">
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
              {/* Viewport dimension indicator */}
              {viewportSize !== 'desktop' && (
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] text-accent-primary font-mono whitespace-nowrap">
                  {VIEWPORTS.find(v => v.id === viewportSize)?.width}×{VIEWPORTS.find(v => v.id === viewportSize)?.height}
                </div>
              )}
              {/* Viewport Dropdown */}
              {showViewportSelector && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="absolute top-full right-0 mt-2 p-2 bg-bg-secondary/95 backdrop-blur-md rounded-xl border border-white/10 shadow-xl z-20 min-w-[180px]"
                >
                  <p className="text-xs text-text-muted px-2 pb-2 mb-2 border-b border-white/5 flex items-center justify-between">
                    <span>Viewport</span>
                    {viewportSize !== 'desktop' && (
                      <span className="text-[10px] bg-accent-primary/20 px-1.5 py-0.5 rounded text-accent-primary">
                        {VIEWPORTS.find(v => v.id === viewportSize)?.width} × {VIEWPORTS.find(v => v.id === viewportSize)?.height}
                      </span>
                    )}
                  </p>
                  {VIEWPORTS.map((viewport) => {
                    const Icon = viewport.icon;
                    return (
                      <button
                        key={viewport.id}
                        onClick={() => handleViewportChange(viewport.id)}
                        className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                          viewportSize === viewport.id 
                            ? 'bg-accent-primary/20 text-accent-primary' 
                            : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          {viewport.name}
                        </div>
                        <span className="text-[10px] text-text-muted">{viewport.width}×{viewport.height}</span>
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
            {/* Regenerate Button - re-run the last prompt */}
            {html && onRegenerate && lastPrompt && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={onRegenerate}
                disabled={isLoading}
                className="hidden sm:flex p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-bg-secondary/90 backdrop-blur-md text-text-secondary hover:text-green-400 transition-all min-h-[36px] min-w-[36px] sm:min-h-[44px] sm:min-w-[44px] items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-50"
                title={`Regenerate (re-run last prompt)`}
              >
                <RefreshCw className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
              </motion.button>
            )}
            {/* AI Improve Button — screenshot + vision critique loop */}
            {html && onImproveUI && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={onImproveUI}
                disabled={isLoading || isImproving}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl bg-gradient-to-r from-violet-600/20 to-cyan-600/20 border border-violet-500/30 backdrop-blur-md text-violet-300 hover:text-white hover:border-violet-400/60 hover:from-violet-600/30 hover:to-cyan-600/30 transition-all min-h-[36px] sm:min-h-[44px] text-[11px] sm:text-xs font-medium hover:scale-105 active:scale-95 disabled:opacity-50"
                title="AI reviews the screenshot and generates an improved version"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isImproving ? 'animate-spin' : ''}`} />
                <span>{isImproving ? (improveStatus || 'Improving…') : 'AI Improve'}</span>
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
            {/* Re-visualize Button - convert to different format */}
            {html && (
              <div className="relative hidden md:block">
                <motion.button
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  onClick={() => setShowRevisualizeMenu(!showRevisualizeMenu)}
                  disabled={isRemixing}
                  className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-bg-secondary/90 backdrop-blur-md text-text-secondary hover:text-cyan-400 transition-all min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-50"
                  title="Re-visualize as different format"
                >
                  <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.button>
                {showRevisualizeMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="absolute top-full right-0 mt-2 p-2 bg-bg-secondary/95 backdrop-blur-md rounded-xl border border-white/10 shadow-xl z-30 min-w-[200px]"
                  >
                    <p className="text-xs text-text-muted px-2 pb-2 mb-1 border-b border-white/5 font-medium">Re-visualize as...</p>
                    {[
                      { label: 'Timeline', icon: '🗓️', prompt: 'Convert this into a beautiful animated vertical timeline with dates, icons, and milestone descriptions.' },
                      { label: 'Dashboard', icon: '📊', prompt: 'Convert this into a dark analytics dashboard with stat cards, charts, and data visualizations.' },
                      { label: 'Infographic', icon: '🎯', prompt: 'Convert this into a stunning infographic with icons, visual sections, and animated elements.' },
                      { label: 'Comparison', icon: '⚖️', prompt: 'Convert this into a visual side-by-side comparison with categories, ratings, and pros/cons cards.' },
                      { label: 'Mind Map', icon: '🧠', prompt: 'Convert this into a visual mind map / concept diagram with a central node and radiating connections.' },
                      { label: 'Data Story', icon: '📈', prompt: 'Convert this into a data story with charts, big numbers, trend indicators, and narrative sections.' },
                      { label: 'Leaderboard', icon: '🏆', prompt: 'Convert this into a ranked leaderboard / top-N list with animated score bars, rank badges, and trend indicators.' },
                      { label: 'Flow Diagram', icon: '⚙️', prompt: 'Convert this into a system architecture or process flow diagram with SVG arrows, connected boxes, and labeled stages.' },
                      { label: 'Report', icon: '📋', prompt: 'Convert this into a professional report-style layout with a cover header, section dividers, key findings in callout boxes, and summary stats.' },
                    ].map((item) => (
                      <button
                        key={item.label}
                        onClick={() => {
                          if (onQuickGenerate) {
                            onQuickGenerate(`${item.prompt}\n\nOriginal content context: Use this design as data source: create a completely new ${item.label.toLowerCase()} visual that presents the same information in a ${item.label.toLowerCase()} format.`);
                          }
                          setShowRevisualizeMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-secondary hover:bg-white/5 hover:text-text-primary transition-colors"
                      >
                        <span>{item.icon}</span> Show as {item.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>
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
                  {/* Open in New Tab - mobile */}
                  <button
                    onClick={() => { handleOpenInNewTab(); setShowMoreMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-secondary hover:bg-white/5 hover:text-accent-secondary transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" /> Open in New Tab
                  </button>
                  {/* Regenerate - mobile */}
                  {html && onRegenerate && lastPrompt && (
                    <button
                      onClick={() => { onRegenerate(); setShowMoreMenu(false); }}
                      disabled={isLoading}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-secondary hover:bg-white/5 hover:text-green-400 transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className="w-4 h-4" /> Regenerate
                    </button>
                  )}
                  {/* Viewport selector for mobile - in more menu */}
                  <button
                    onClick={() => { setShowViewportSelector(!showViewportSelector); setShowMoreMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-secondary hover:bg-white/5 hover:text-text-primary transition-colors"
                  >
                    {viewportSize === 'mobile' ? <Smartphone className="w-4 h-4" /> : viewportSize === 'tablet' ? <Tablet className="w-4 h-4" /> : viewportSize === 'wide' ? <MonitorPlay className="w-4 h-4" /> : <Monitor className="w-4 h-4" />} 
                    Viewport: {viewportSize.charAt(0).toUpperCase() + viewportSize.slice(1)}
                  </button>
                  {/* Viewport quick actions - mobile */}
                  <div className="flex gap-1 px-3 py-1">
                    {VIEWPORTS.map((vp) => (
                      <button
                        key={vp.id}
                        onClick={() => { handleViewportChange(vp.id); setShowMoreMenu(false); }}
                        className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-xs transition-colors ${
                          viewportSize === vp.id 
                            ? 'bg-accent-primary/20 text-accent-primary' 
                            : 'text-text-muted hover:bg-white/5 hover:text-text-primary'
                        }`}
                      >
                        {vp.id === 'mobile' && <Smartphone className="w-3 h-3" />}
                        {vp.id === 'tablet' && <Tablet className="w-3 h-3" />}
                        {vp.id === 'desktop' && <Monitor className="w-3 h-3" />}
                        {vp.id === 'wide' && <MonitorPlay className="w-3 h-3" />}
                      </button>
                    ))}
                  </div>
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
                      {onExportCodePen && (
                        <button
                          onClick={() => { onExportCodePen(); setShowMoreMenu(false); }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-secondary hover:bg-white/5 hover:text-accent-primary transition-colors"
                        >
                          <span className="w-4 h-4 flex items-center justify-center text-[10px] font-bold text-orange-400">CP</span> Open in CodePen
                        </button>
                      )}
                      {onExportJSFiddle && (
                        <button
                          onClick={() => { onExportJSFiddle(); setShowMoreMenu(false); }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-secondary hover:bg-white/5 hover:text-blue-400 transition-colors"
                        >
                          <span className="w-4 h-4 flex items-center justify-center text-[10px] font-bold text-blue-400">JF</span> Open in JSFiddle
                        </button>
                      )}
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
                  {/* Re-visualize - mobile */}
                  {html && (
                    <>
                      <div className="border-t border-white/10 my-1" />
                      <p className="text-[10px] text-text-muted px-3 py-1 uppercase tracking-wider">Re-visualize as</p>
                      {[
                        { label: 'Timeline', icon: '🗓️', prompt: 'Convert this into a beautiful animated vertical timeline.' },
                        { label: 'Dashboard', icon: '📊', prompt: 'Convert this into a dark analytics dashboard with stat cards and charts.' },
                        { label: 'Infographic', icon: '🎯', prompt: 'Convert this into a stunning infographic with icons and animated elements.' },
                        { label: 'Comparison', icon: '⚖️', prompt: 'Convert this into a visual side-by-side comparison.' },
                      ].map((item) => (
                        <button
                          key={item.label}
                          onClick={() => {
                            if (onQuickGenerate) onQuickGenerate(item.prompt);
                            setShowMoreMenu(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-secondary hover:bg-white/5 hover:text-cyan-400 transition-colors"
                        >
                          <span>{item.icon}</span> Show as {item.label}
                        </button>
                      ))}
                    </>
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
            {/* CodePen export - visible on tablet+ */}
            {onExportCodePen && html && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={onExportCodePen}
                className="hidden md:flex p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-bg-secondary/90 backdrop-blur-md text-text-secondary hover:text-orange-400 transition-all min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] items-center justify-center hover:scale-105 active:scale-95"
                title="Open in CodePen"
              >
                <span className="text-[10px] font-bold">CP</span>
              </motion.button>
            )}
            {/* JSFiddle export - visible on tablet+ */}
            {onExportJSFiddle && html && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={onExportJSFiddle}
                className="hidden md:flex p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-bg-secondary/90 backdrop-blur-md text-text-secondary hover:text-blue-400 transition-all min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] items-center justify-center hover:scale-105 active:scale-95"
                title="Open in JSFiddle"
              >
                <span className="text-[10px] font-bold">JF</span>
              </motion.button>
            )}
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

      {/* Generation progress bar — thin animated line under toolbar */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-none h-[3px] bg-bg-secondary/50 overflow-hidden relative"
          >
            <motion.div
              className="absolute inset-y-0 left-0 w-1/2 rounded-full"
              style={{ background: 'linear-gradient(90deg, transparent, #8b5cf6, #06b6d4, transparent)' }}
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Area */}
      <div className="flex-1 relative min-h-0 overflow-hidden">
      {/* Code Preview Panel - Enhanced with Line Numbers */}
      <AnimatePresence>
        {showCode && html && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-16 sm:bottom-4 left-1 right-1 sm:left-4 sm:right-4 z-20 max-h-[50vh] sm:max-h-80 bg-bg-secondary/95 backdrop-blur-glass rounded-xl border border-white/10 overflow-hidden"
            style={{ maxHeight: 'calc(50vh - env(safe-area-inset-bottom, 0px))' }}
          >
            <div className="flex items-center justify-between px-3 sm:px-4 py-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm text-text-secondary">{isEditingCode ? 'Edit Code' : 'Generated HTML'}</span>
                {!isEditingCode && (
                  <span className="text-[10px] sm:text-xs text-text-muted bg-bg-tertiary px-1.5 py-0.5 rounded">
                    {highlightedResult.lineCount} lines
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
              <div className="flex overflow-auto max-h-[40vh] sm:max-h-60">
                <textarea
                  value={editedCode}
                  onChange={(e) => setEditedCode(e.target.value)}
                  className="flex-1 p-3 sm:p-4 bg-bg-primary text-text-primary text-xs sm:text-sm font-mono whitespace-pre leading-5 sm:leading-6 resize-none focus:outline-none min-h-[200px]"
                  style={{ fontSize: '14px' }}
                  spellCheck={false}
                  placeholder="Edit your HTML code here..."
                />
              </div>
            ) : (
              <div className="flex overflow-auto max-h-[35vh] sm:max-h-44" style={{ maxHeight: 'calc(35vh - env(safe-area-inset-bottom, 0px))' }}>
                {/* Line Numbers */}
                <div className="flex-shrink-0 py-2 sm:py-4 px-2 sm:px-3 bg-bg-primary/50 text-right select-none border-r border-white/5">
                  {Array.from({ length: highlightedResult.lineCount }, (_, i) => (
                    <div key={i} className="text-[10px] sm:text-xs font-mono text-text-muted leading-5 sm:leading-6">
                      {i + 1}
                    </div>
                  ))}
                </div>
                {/* Code Content */}
                <pre className="flex-1 p-2 sm:p-4 overflow-x-auto text-xs sm:text-sm font-mono whitespace-pre leading-5 sm:leading-6" dangerouslySetInnerHTML={{ __html: highlightedResult.html }}>
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
            className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-md"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}
          >
            <div className="absolute inset-0" onClick={() => setShowRefine(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative bg-bg-secondary rounded-xl border border-white/10 w-full max-w-md overflow-hidden max-h-[85vh] flex flex-col"
              style={{ maxHeight: 'calc(85vh - env(safe-area-inset-bottom, 0px))' }}
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
              <div className="p-3 sm:p-4 space-y-4 overflow-y-auto flex-1" style={{ maxHeight: 'calc(85vh - 120px)' }}>
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
            className="absolute inset-0 z-20 flex items-center justify-center bg-bg-primary overflow-hidden"
            style={{ paddingBottom: '80px' }}
          >
            {/* Animated background grid */}
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: 'linear-gradient(rgba(139,92,246,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.3) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
              animation: 'gridScroll 4s linear infinite'
            }} />
            {/* Ambient glow orbs */}
            <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-accent-primary/10 blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-accent-secondary/10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

            <div className="relative flex flex-col items-center gap-6 sm:gap-8 z-10">
              {/* Visual building animation */}
              <div className="relative w-48 h-32 sm:w-64 sm:h-40">
                {/* Animated bars building up like a chart */}
                {[
                  { h: '60%', delay: '0s', color: '#8b5cf6' },
                  { h: '90%', delay: '0.15s', color: '#7c3aed' },
                  { h: '45%', delay: '0.3s', color: '#06b6d4' },
                  { h: '75%', delay: '0.45s', color: '#0891b2' },
                  { h: '100%', delay: '0.6s', color: '#8b5cf6' },
                  { h: '55%', delay: '0.75s', color: '#10b981' },
                  { h: '80%', delay: '0.9s', color: '#06b6d4' },
                ].map((bar, i) => (
                  <div key={i} className="absolute bottom-0 flex flex-col justify-end"
                    style={{ left: `${i * 14 + 1}%`, width: '10%', height: '100%' }}>
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: bar.h, opacity: 0.85 }}
                      transition={{ duration: 0.6, delay: parseFloat(bar.delay), repeat: Infinity, repeatType: 'reverse', repeatDelay: 1.5, ease: 'easeOut' }}
                      style={{ background: `linear-gradient(180deg, ${bar.color}, ${bar.color}88)`, borderRadius: '4px 4px 2px 2px', boxShadow: `0 0 10px ${bar.color}44` }}
                    />
                  </div>
                ))}
                {/* Baseline */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-white/20" />
                {/* Sparkle elements */}
                {[
                  { top: '10%', left: '15%', delay: '0.2s' },
                  { top: '20%', left: '70%', delay: '0.7s' },
                  { top: '5%', left: '50%', delay: '1.1s' },
                ].map((spark, i) => (
                  <motion.div key={i}
                    className="absolute w-1.5 h-1.5 rounded-full bg-accent-primary"
                    style={{ top: spark.top, left: spark.left }}
                    animate={{ scale: [0, 1.5, 0], opacity: [0, 1, 0] }}
                    transition={{ duration: 1.2, delay: parseFloat(spark.delay), repeat: Infinity, repeatDelay: 0.8 }}
                  />
                ))}
              </div>

              <div className="text-center px-4">
                <motion.p
                  className="text-lg sm:text-xl font-semibold text-text-primary mb-2"
                  animate={{ opacity: [1, 0.6, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Crafting your visual...
                </motion.p>
                <LoadingMessage />
              </div>

              {/* Animated progress bar */}
              <div className="w-48 sm:w-64 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #8b5cf6, #06b6d4)' }}
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                />
              </div>

              {/* Cancel button */}
              {onCancelGeneration && (
                <motion.button
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 3 }}
                  onClick={onCancelGeneration}
                  className="mt-2 px-4 py-2 text-xs text-text-muted hover:text-red-400 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 rounded-lg transition-all"
                >
                  Cancel generation
                </motion.button>
              )}
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
            className="absolute inset-0 overflow-auto py-4 sm:py-8 px-3 sm:px-4 flex flex-col items-center justify-start"
          >
          <div className="text-center max-w-3xl w-full mx-auto">
            {/* API Key Setup Guide - shows if no API key configured */}
            {!isApiKeyConfigured() && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-left max-w-md mx-auto"
              >
                <div className="flex items-start gap-3">
                  <span className="text-amber-400 text-xl flex-shrink-0">🔑</span>
                  <div>
                    <p className="text-amber-300 font-semibold text-sm mb-1">No API Key Configured</p>
                    <p className="text-amber-200/70 text-xs mb-2">Add your API key in the sidebar settings to start generating visuals. It's free to get started!</p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <a
                        href="https://openrouter.ai/keys"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg transition-colors border border-amber-500/30"
                      >
                        Get Free Key (OpenRouter) →
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            {/* Hero section */}
            <motion.div
              className="mb-4 sm:mb-6"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {/* Quick category buttons — clickable to generate */}
              <div className="hidden sm:flex justify-center gap-3 mb-4">
                {[
                  { icon: '📊', label: 'Charts & Dashboards', prompt: 'Create a beautiful dark analytics dashboard with stat cards (Users 1.2M, Revenue $84K, Conversion 3.4%), a 30-day animated line chart, traffic sources doughnut chart, and a top pages table. Violet/cyan accents.' },
                  { icon: '🗺️', label: 'Diagrams & Maps', prompt: 'Create a beautiful world map visualization showing top countries by GDP with color-coded choropleth shading, legend, and key stats for the top 5 economies.' },
                  { icon: '🎯', label: 'Infographics', prompt: 'Create a stunning animated infographic about artificial intelligence — show AI types, key milestones timeline from 1950 to 2025, top AI companies, and real-world applications grid.' },
                  { icon: '🎨', label: 'Creative Visuals', prompt: 'Create a visually stunning creative showcase page — flowing gradient hero section, animated particle effects, bold typography, layered card compositions, and neon glow accents.' },
                  { icon: '📈', label: 'Data Stories', prompt: 'Create a data story about climate change — narrative text sections combined with animated charts showing global temperature rise, CO2 levels, sea level changes, and future projections.' },
                  { icon: '⚡', label: 'Animations', prompt: 'Create a showcase of beautiful CSS animations — bouncing elements, spinning loaders, morphing shapes, gradient transitions, particle systems, and parallax scrolling effects. Dark theme.' },
                ].map((item, i) => (
                  <motion.button
                    key={item.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.07 }}
                    onClick={() => onQuickGenerate && onQuickGenerate(item.prompt)}
                    disabled={isLoading}
                    className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl bg-bg-secondary/60 border border-white/5 hover:border-accent-primary/40 hover:bg-accent-primary/10 hover:opacity-100 opacity-70 transition-all cursor-pointer disabled:cursor-not-allowed"
                    title={item.label}
                    aria-label={item.label}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-[10px] text-text-muted">{item.label}</span>
                  </motion.button>
                ))}
              </div>

              <div className="relative mb-2 mx-auto w-14 h-14 sm:w-20 sm:h-20">
                <motion.div
                  className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent-primary/40 to-accent-secondary/40 blur-xl"
                  animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                  className="relative w-full h-full rounded-2xl bg-gradient-to-br from-accent-primary/25 to-accent-secondary/25 flex items-center justify-center border border-white/15 backdrop-blur-sm"
                  animate={{ scale: [1, 1.04, 1], rotate: [0, 1, -1, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <motion.span
                    className="text-2xl sm:text-4xl"
                    animate={{ y: [0, -4, 0], scale: [1, 1.08, 1] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                  >✨</motion.span>
                </motion.div>
              </div>

              <h2 className="font-heading text-base sm:text-2xl font-bold mb-1 gradient-text">
                Transform Any Topic into a Visual
              </h2>
              <p className="text-text-secondary text-xs sm:text-sm max-w-sm mx-auto">
                Ask about anything — get a <span className="text-accent-primary font-medium">beautiful infographic, chart, or dashboard</span> instead of a wall of text.
              </p>
            </motion.div>

            {/* Example prompt chips */}
            <motion.div
              className="hidden sm:flex flex-wrap justify-center gap-2 mb-5 max-w-lg mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {[
                { label: '🌍 World GDP', prompt: 'Create a stunning world GDP dashboard with bar chart showing top 10 economies, growth trends line chart, and regional breakdown pie chart' },
                { label: '📱 iPhone vs Android', prompt: 'Create a beautiful side-by-side comparison of iPhone vs Android — radar chart, feature table, pricing tiers, market share pie' },
                { label: '🤖 AI History', prompt: 'Create a stunning animated timeline of AI milestones from 1950 to 2025 with icons, year markers, and key events' },
                { label: '☕ Coffee Facts', prompt: 'Create a beautiful infographic about coffee — origin to cup journey, caffeine content comparison chart, top producer countries' },
                { label: '💹 Crypto Dash', prompt: 'Create a dark cryptocurrency dashboard with BTC, ETH, SOL price sparklines, portfolio pie chart, and fear & greed gauge' },
                { label: '🧬 DNA Explainer', prompt: 'Create a stunning animated infographic about DNA and genetics — double helix diagram, replication steps, genome stats' },
              ].map((ex, i) => (
                <button
                  key={ex.label}
                  onClick={() => onQuickGenerate && onQuickGenerate(ex.prompt)}
                  disabled={isLoading}
                  className="px-3 py-1.5 text-xs rounded-full bg-bg-secondary/80 border border-white/8 text-text-secondary hover:border-accent-primary/50 hover:text-accent-primary hover:bg-accent-primary/10 transition-all disabled:opacity-50"
                  style={{ transitionDelay: `${i * 30}ms` }}
                >
                  {ex.label}
                </button>
              ))}
            </motion.div>

            {/* Quick Start Grid */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <p className="text-[10px] sm:text-xs text-text-muted uppercase tracking-wider font-medium">
                  Or try one of these
                </p>
                {onQuickGenerate && (
                  <button
                    onClick={() => {
                      const random = QUICK_PROMPTS[Math.floor(Math.random() * QUICK_PROMPTS.length)];
                      onQuickGenerate(random.prompt);
                    }}
                    disabled={isLoading}
                    className="flex items-center gap-1.5 text-[10px] sm:text-xs text-accent-primary hover:text-accent-secondary transition-colors disabled:opacity-50 px-2 py-1 rounded-lg hover:bg-accent-primary/10"
                  >
                    <Shuffle className="w-3 h-3" />
                    Surprise me!
                  </button>
                )}
              </div>
              <QuickStartGrid
                items={QUICK_PROMPTS}
                onClick={onQuickGenerate!}
                disabled={isLoading}
              />
            </motion.div>

            {/* Saved Templates Section */}
            {savedTemplates.length > 0 && (
              <div className="mt-6 max-w-sm mx-auto">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-text-secondary text-sm font-medium">My Templates</h3>
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
                            setIframeContent(iframeRef.current, content);
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

            {/* Keyboard shortcut hint */}
            <p className="text-xs text-text-muted mt-5 flex items-center justify-center gap-2">
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
                <span className="text-[10px] ml-1">to generate</span>
              </span>
            </p>
          </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Iframe Renderer */}
      <div
        className="w-full h-full flex items-center justify-center overflow-auto p-4 relative"
        style={{
          background: viewportSize !== 'desktop' ? 'repeating-linear-gradient(45deg, #1a1a24 25%, transparent 25%, transparent 75%, #1a1a24 75%, #1a1a24), repeating-linear-gradient(45deg, #1a1a24 25%, #0a0a0f 25%, #0a0a0f 75%, #1a1a24 75%, #1a1a24)' : undefined,
          backgroundPosition: '0 0, 10px 10px',
          backgroundSize: '20px 20px'
        }}
      >
        {/* Zoom Controls - bottom left */}
        {html && !isLoading && (
          <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1 bg-bg-secondary/90 backdrop-blur-md rounded-xl border border-white/10 p-1 shadow-lg">
            <button
              onClick={handleZoomOut}
              className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/10 transition-all"
              title="Zoom out (⌘-)"
              disabled={zoomLevel <= 25}
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomReset}
              className="px-2 py-1 text-xs font-mono text-text-secondary hover:text-accent-primary transition-colors min-w-[42px] text-center"
              title="Reset zoom (⌘0)"
            >
              {zoomLevel}%
            </button>
            <button
              onClick={handleZoomIn}
              className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/10 transition-all"
              title="Zoom in (⌘+)"
              disabled={zoomLevel >= 200}
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        )}
        <div
          className="transition-all duration-300 ease-out shadow-2xl"
          style={{
            width: viewportSize === 'desktop' ? '100%' : `${VIEWPORTS.find(v => v.id === viewportSize)?.width || 1280}px`,
            height: viewportSize === 'desktop' ? '100%' : `${VIEWPORTS.find(v => v.id === viewportSize)?.height || 800}px`,
            maxWidth: '100%',
            maxHeight: '100%',
            borderRadius: viewportSize !== 'desktop' ? '12px' : '0',
            overflow: 'hidden',
            transform: zoomLevel !== 100 ? `scale(${zoomLevel / 100})` : undefined,
            transformOrigin: 'top center'
          }}
        >
          <iframe
            ref={iframeRef}
            title="Visual Output"
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
            bottom: 'calc(env(safe-area-inset-bottom, 20px) + 16px)',
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
