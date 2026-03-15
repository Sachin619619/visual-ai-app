import { ModelProvider } from '../types';
import { OPENAI_TOOLS, needsSearch, executeTool, ToolCall } from './tools';

// AI Provider configurations
export const AI_PROVIDERS: Record<ModelProvider, { name: string; icon: string }> = {
  openai: { name: 'OpenAI GPT-4', icon: '🤖' },
  claude: { name: 'Claude 3', icon: '🧠' },
  gemini: { name: 'Gemini Pro', icon: '✨' },
  openrouter: { name: 'OpenRouter (Free)', icon: '🔗' },
  kimi: { name: 'Kimi K2.5', icon: '🌙' },
  minimax: { name: 'MiniMax M2.5', icon: '🔮' },
  local: { name: 'Local Model', icon: '💻' },
};

// Separate API keys for different providers
let kimiApiKey = '';
let minimaxApiKey = '';
let braveSearchKey = '';

export const setMinimaxApiKey = (key: string) => {
  minimaxApiKey = key;
};

export const getMinimaxApiKey = () => minimaxApiKey;

export const setBraveSearchKey = (key: string) => { braveSearchKey = key; };
export const getBraveSearchKey = () => braveSearchKey;

export const setKimiApiKey = (key: string) => {
  kimiApiKey = key;
};

export const getKimiApiKey = () => kimiApiKey;

// Free models available via OpenRouter
export interface FreeModel {
  id: string;
  name: string;
  icon: string;
}

export const FREE_MODELS: FreeModel[] = [
  { id: 'deepseek/deepseek-chat-v3-0324:free', name: 'DeepSeek V3', icon: '💡' },
  { id: 'moonshotai/kimi-k2.5', name: 'Kimi K2.5', icon: '🌙' },
  { id: 'meta-llama/llama-4-maverick:free', name: 'Llama 4 Maverick', icon: '🦙' },
  { id: 'google/gemma-3-27b-it:free', name: 'Gemma 3 27B', icon: '🌟' },
  { id: 'microsoft/phi-4-reasoning:free', name: 'Phi-4 Reasoning', icon: '⚡' },
  { id: 'qwen/qwen2.5-vl-72b-instruct:free', name: 'Qwen 2.5 72B', icon: '🧑‍💻' },
  { id: 'mistralai/mistral-small-3.1-24b-instruct:free', name: 'Mistral Small 3.1', icon: '🌀' },
  { id: 'anthropic/claude-3-haiku:free', name: 'Claude 3 Haiku', icon: '🧠' },
  { id: 'openai/gpt-4o-mini:free', name: 'GPT-4o Mini', icon: '🤖' },
  { id: 'google/gemini-2.0-flash-exp:free', name: 'Gemini 2.0 Flash', icon: '🚀' },
  { id: 'deepseek/deepseek-prover:free', name: 'DeepSeek Prover', icon: '🧮' },
  { id: 'nvidia/llama-3.1-nemotron-70b-instruct:free', name: 'Nemotron 70B', icon: '🔷' },
  { id: 'qwen/qwen3-8b:free', name: 'Qwen 3 8B', icon: '🔍' },
  { id: 'google/gemma-3-4b-it:free', name: 'Gemma 3 4B', icon: '💎' },
  { id: 'deepseek/deepseek-coder-v2:free', name: 'DeepSeek Coder V2', icon: '💻' },
  { id: 'anthropic/claude-3.5-haiku:free', name: 'Claude 3.5 Haiku', icon: '🎯' },
  // Newer models added
  { id: 'google/gemini-2.5-pro:free', name: 'Gemini 2.5 Pro', icon: '✨' },
  { id: 'deepseek/deepseek-r1:free', name: 'DeepSeek R1', icon: '🧠' },
  { id: 'qwen/qwen3-32b:free', name: 'Qwen 3 32B', icon: '🔢' },
  { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B', icon: '🦙' },
  { id: 'xai/grok-3-beta:free', name: 'Grok 3 Beta', icon: '🚀' },
  { id: 'Perplexity/llama-3.1-sonar-small-128k-online:free', name: 'Llama 3.1 Online', icon: '🌐' },
  { id: '01-ai/yi-1.5-34b-chat:free', name: 'Yi 1.5 34B', icon: '☀️' },
  { id: 'cohere/command-a-03-2025:free', name: 'Command A', icon: '💬' },
  { id: 'meta-llama/llama-4-scout:free', name: 'Llama 4 Scout', icon: '🔭' },
  { id: 'qwen/qwen3-14b:free', name: 'Qwen 3 14B', icon: '🧩' },
  { id: 'mistralai/mistral-nemo:free', name: 'Mistral Nemo', icon: '🌊' },
  { id: 'google/gemini-flash-1.5:free', name: 'Gemini Flash 1.5', icon: '⚡' },
  { id: 'deepseek/deepseek-r1-0528:free', name: 'DeepSeek R1 0528', icon: '🔬' },
];

// Global model selection for OpenRouter free models
let selectedFreeModel = FREE_MODELS[0].id;

export const setFreeModel = (modelId: string) => {
  selectedFreeModel = modelId;
};

export const getFreeModel = () => selectedFreeModel;

// Global API key storage
let apiKey = '';

export const setApiKey = (key: string) => {
  apiKey = key;
};

export const getApiKey = () => apiKey;

/**
 * Returns true if at least one API key (main or Kimi) is configured.
 * OpenRouter provider is always considered configured (uses free models).
 */
export const isApiKeyConfigured = (): boolean => {
  return !!apiKey || !!kimiApiKey || !!minimaxApiKey;
};

/**
 * Returns a map of provider names to their configuration status.
 * OpenRouter is always true; local is always false.
 */
export const getProviderStatus = (): Record<ModelProvider, boolean> => {
  return {
    openai: !!apiKey,
    claude: !!apiKey,
    gemini: !!apiKey,
    openrouter: true, // Uses free models
    kimi: !!kimiApiKey,
    minimax: !!minimaxApiKey,
    local: false,
  };
};

/**
 * Generates HTML UI based on the provided prompt and model.
 * Throws a descriptive error if the API key is missing or the API call fails.
 * @param prompt - The user's description of the desired UI
 * @param model - The AI provider to use for generation
 * @param contextHtml - Optional existing HTML to use as reference/context
 */
export const generateUI = async (
  prompt: string,
  model: ModelProvider,
  contextHtml?: string,
  signal?: AbortSignal,
  onChunk?: (partial: string) => void,
  onSearching?: (query: string | null) => void
): Promise<string> => {
  // Check the correct key for the selected provider
  if (model === 'kimi' && !kimiApiKey && !apiKey) {
    throw new Error('🌙 Please set your Kimi API key in settings to use Kimi K2.5. Get your key at moonshot.cn');
  }
  if (model === 'minimax' && !minimaxApiKey) {
    throw new Error('🔮 Please set your MiniMax API key in settings to use MiniMax M2.5. Get your key at minimax.io');
  }
  if (model !== 'kimi' && model !== 'minimax' && model !== 'openrouter' && !apiKey) {
    throw new Error('🔑 Please set your API key in settings to generate UI. Get your free API key from https://openrouter.ai/keys');
  }
  // OpenRouter is always available (free models)
  try {
    // MiniMax is a reasoning model and needs more time
    const timeoutMs = model === 'minimax' ? 180000 : 90000;
    const timeoutLabel = model === 'minimax' ? '180 seconds' : '90 seconds';
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`⏱️ Generation timed out after ${timeoutLabel}. Try a shorter prompt or faster model.`)), timeoutMs);
    });
    return await Promise.race([
      generateWithAI(prompt, model, apiKey, contextHtml, signal, onChunk, onSearching),
      timeoutPromise
    ]);
  } catch (error: any) {
    console.error('AI generation failed:', error);
    const msg = error?.message || String(error);
    
    // Provide more helpful error messages
    if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('network')) {
      throw new Error('🌐 Network error. Check your internet connection and try again.');
    }
    if (msg.includes('rate limit') || msg.includes('429')) {
      throw new Error('⏳ Rate limit reached. Wait a moment or try a different model.');
    }
    if (msg.includes('Insufficient credits') || msg.includes('insufficient credits') || msg.includes('quota')) {
      throw new Error('💳 API credits exhausted. Get a free key from https://openrouter.ai/keys');
    }
    if (msg.includes('Invalid API key') || msg.includes('Unauthorized') || msg.includes('401')) {
      throw new Error('🔐 Invalid API key. Please check your key in settings.');
    }
    if (msg.includes('timeout') || msg.includes('Timeout')) {
      throw new Error('⏱️ Request timed out. Try again or use a faster model.');
    }
    
    throw error instanceof Error ? error : new Error(String(error));
  }
}

// Chat with AI
export const chatWithAI = async (message: string): Promise<string> => {
  if (!apiKey) {
    return "Please set your API key in settings to use the chat feature.";
  }
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful AI assistant that helps generate UI components. Keep responses short and friendly.' },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 200
      })
    });
    
    const data = await response.json();
    return data.choices?.[0]?.message?.content || "Sorry, I couldn't process that.";
  } catch (error) {
    console.error('Chat error:', error);
    return "Chat error. Please check your API key.";
  }
};

// Enhanced system prompt for stunning visual-first HTML generation
const SYSTEM_PROMPT = `You are a world-class data visualization expert and UI designer. Your SOLE purpose is to transform any topic or question into a BREATHTAKING visual HTML experience — never plain text.

🌟 VISUAL-FIRST PHILOSOPHY:
- NEVER output plain text paragraphs — every piece of information MUST be visual
- Think like an award-winning infographic designer: data becomes charts, concepts become diagrams, steps become timelines
- Every response should look like it belongs in a premium design portfolio or Dribbble showcase
- The user should say "WOW" when they see your output — aim for magazine-cover quality
- Use rich micro-interactions and hover animations to delight users

🎨 DESIGN SYSTEM — Premium Dark Theme:
- Background: #0a0a0f, cards: #12121a, surface: #1a1a2e, elevated: #1e1e2e
- Primary: #8b5cf6 (violet), secondary: #06b6d4 (cyan), success: #10b981, warning: #f59e0b, danger: #ef4444
- Pink: #ec4899, orange: #f97316, teal: #14b8a6
- Rich gradients: linear-gradient(135deg, #8b5cf6, #06b6d4), linear-gradient(135deg, #f43f5e, #f97316)
- Glassmorphism: backdrop-filter: blur(20px), rgba(255,255,255,0.04) with border rgba(255,255,255,0.1)
- Typography: headings → 'Outfit' font with gradient text (-webkit-background-clip: text)
- Shadows: 0 0 30px rgba(139,92,246,0.3) for glow, 0 20px 60px rgba(0,0,0,0.5) for depth

🆕 NEW CSS UTILITIES AVAILABLE (use these for stunning visuals!):
- Gradient classes: .gradient-sunset, .gradient-ocean, .gradient-forest, .gradient-aurora, .gradient-fire, .gradient-candy, .gradient-midnight, .gradient-pastel, .gradient-animate
- Glow classes: .glow-violet, .glow-cyan, .glow-green, .glow-orange, .glow-pink, .glow-yellow, .glow-blue, .glow-white, .glow-xl, .glow-double
- Text glow: .text-glow-violet, .text-glow-cyan, .text-glow-orange, .text-glow-pink, .text-glow-yellow
- Glass variants: .glass-card, .glass-light, .glass-dark, .glass-accent, .glass-cyan
- Effects: .border-animate, .shine-hover, .pulse-dot
- Icon boxes: .icon-box, .icon-box-sm, .icon-box-lg
- Animation: .counter-animate, .animate-pulse-glow, .delay-100 through .delay-800

🎯 DESIGN BEST PRACTICES:
- Use generous whitespace (padding 24-48px) between sections
- Prefer cards with subtle borders and soft shadows over flat designs
- Add entry animations with staggered delays for visual interest
- Use consistent border-radius (8-16px) throughout
- Include subtle hover states on all interactive elements
- Prefer gradient text for headings over solid colors
- Add glassmorphism effects for overlays and floating elements
- Use animated counters for statistics to draw attention
- Include contextual icons that match the content theme
- Make data visualizations the centerpiece with generous sizing

✨ CONTENT-TYPE RULES — choose the RIGHT visual for each content type:
- EXPLANATIONS/CONCEPTS → Animated infographic with icons, sections, connecting arrows, visual hierarchy
- COMPARISONS (A vs B) → Side-by-side cards with visual differentiators, radar/spider chart, pros/cons with colored indicators
- DATA/NUMBERS/STATS → Dashboard with stat cards (large gradient numbers), multiple Chart.js charts, progress rings
- PROCESSES/HOW-TO → Animated step-by-step flow with numbered gradient circles, connector animated lines, icons per step
- TIMELINES/HISTORY → Vertical timeline with dates, icons, gradient connector line, milestone cards
- LISTS/CATEGORIES → Masonry/grid card layout with icons, hover glow effects, gradient accent borders
- SCIENTIFIC/TECHNICAL → Diagram-style with labeled SVG components, connecting lines, color-coded legend
- WORLD/GEO DATA → Visual regional breakdown with colored blocks and comparative bar/pie charts
- CODE/TECHNICAL → Syntax-highlighted code blocks + architecture diagrams, animated flow arrows
- HIERARCHICAL DATA → D3 sunburst or treemap for nested categories, org charts, file systems, budgets
- ACTIVITY/PATTERNS → D3 heatmap calendar for day-by-day or time-series activity data
- NETWORK/RELATIONSHIPS → D3 force-directed graph for connections, dependencies, social graphs
- RANKINGS/TOP-N → Numbered leaderboard with animated progress bars and score badges
- ARCHITECTURE/SYSTEMS → SVG arrow flow diagram connecting boxes with dashed connector lines

📊 CHART.JS EXCELLENCE (Chart.js v4 is always available as window.Chart):
Always use Chart.js for ALL data visualizations. Here are complete examples:

BAR CHART with gradient fill:
<canvas id="barChart"></canvas>
<script>
const ctx = document.getElementById('barChart').getContext('2d');
const grad = ctx.createLinearGradient(0,0,0,300);
grad.addColorStop(0,'rgba(139,92,246,0.9)');
grad.addColorStop(1,'rgba(139,92,246,0.1)');
new Chart(ctx, {type:'bar', data:{labels:['Jan','Feb','Mar','Apr','May'],datasets:[{label:'Revenue',data:[42,58,73,61,89],backgroundColor:grad,borderColor:'#8b5cf6',borderWidth:2,borderRadius:8}]},options:{responsive:true,maintainAspectRatio:false,animation:{duration:1200,easing:'easeOutQuart'},plugins:{legend:{labels:{color:'#f8fafc'}}},scales:{x:{ticks:{color:'#94a3b8'},grid:{color:'rgba(255,255,255,0.05)'}},y:{ticks:{color:'#94a3b8'},grid:{color:'rgba(255,255,255,0.05)'}}}}});
</script>

LINE CHART with area fill:
<canvas id="lineChart"></canvas>
<script>
const ctx2 = document.getElementById('lineChart').getContext('2d');
const areaGrad = ctx2.createLinearGradient(0,0,0,250);
areaGrad.addColorStop(0,'rgba(6,182,212,0.3)');
areaGrad.addColorStop(1,'rgba(6,182,212,0)');
new Chart(ctx2, {type:'line', data:{labels:['Q1','Q2','Q3','Q4'],datasets:[{label:'Growth',data:[30,52,68,94],borderColor:'#06b6d4',backgroundColor:areaGrad,fill:true,tension:0.4,pointBackgroundColor:'#06b6d4',pointRadius:6}]},options:{responsive:true,plugins:{legend:{labels:{color:'#f8fafc'}}},scales:{x:{ticks:{color:'#94a3b8'},grid:{color:'rgba(255,255,255,0.05)'}},y:{ticks:{color:'#94a3b8'},grid:{color:'rgba(255,255,255,0.05)'}}}}});
</script>

DOUGHNUT CHART with custom colors:
<canvas id="donut" style="max-height:280px"></canvas>
<script>
new Chart(document.getElementById('donut'), {type:'doughnut', data:{labels:['Product A','Product B','Product C','Product D'],datasets:[{data:[35,28,22,15],backgroundColor:['#8b5cf6','#06b6d4','#10b981','#f59e0b'],borderWidth:0,hoverOffset:8}]},options:{responsive:true,cutout:'70%',plugins:{legend:{position:'right',labels:{color:'#f8fafc',padding:16}}}}});
</script>

RADAR CHART for comparisons:
<canvas id="radar"></canvas>
<script>
new Chart(document.getElementById('radar'), {type:'radar', data:{labels:['Speed','Power','Ease','Price','Support'],datasets:[{label:'Product A',data:[90,75,85,60,80],borderColor:'#8b5cf6',backgroundColor:'rgba(139,92,246,0.2)',pointBackgroundColor:'#8b5cf6'},{label:'Product B',data:[70,85,60,90,65],borderColor:'#06b6d4',backgroundColor:'rgba(6,182,212,0.2)',pointBackgroundColor:'#06b6d4'}]},options:{responsive:true,plugins:{legend:{labels:{color:'#f8fafc'}}},scales:{r:{ticks:{color:'#94a3b8',backdropColor:'transparent'},grid:{color:'rgba(255,255,255,0.1)'},pointLabels:{color:'#94a3b8'}}}}});
</script>

MIXED BAR + LINE chart:
<canvas id="mixed"></canvas>
<script>
new Chart(document.getElementById('mixed'), {type:'bar', data:{labels:['Jan','Feb','Mar','Apr','May','Jun'],datasets:[{type:'bar',label:'Revenue',data:[120,145,132,178,156,210],backgroundColor:'rgba(139,92,246,0.7)',borderRadius:6},{type:'line',label:'Profit',data:[20,35,28,52,40,68],borderColor:'#10b981',backgroundColor:'rgba(16,185,129,0.1)',fill:true,tension:0.4,yAxisID:'y1'}]},options:{responsive:true,plugins:{legend:{labels:{color:'#f8fafc'}}},scales:{x:{ticks:{color:'#94a3b8'},grid:{display:false}},y:{ticks:{color:'#94a3b8'},grid:{color:'rgba(255,255,255,0.05)'}},y1:{type:'linear',position:'right',ticks:{color:'#10b981'}}}}});
</script>

POLAR AREA chart (for comparing categories visually):
<canvas id="polar" style="max-height:300px"></canvas>
<script>
new Chart(document.getElementById('polar'), {type:'polarArea', data:{labels:['Innovation','Design','Performance','Reliability','Support'],datasets:[{data:[85,92,78,88,71],backgroundColor:['rgba(139,92,246,0.7)','rgba(6,182,212,0.7)','rgba(16,185,129,0.7)','rgba(245,158,11,0.7)','rgba(236,72,153,0.7)'],borderColor:['#8b5cf6','#06b6d4','#10b981','#f59e0b','#ec4899'],borderWidth:2}]},options:{responsive:true,plugins:{legend:{position:'right',labels:{color:'#f8fafc',padding:12}}},scales:{r:{ticks:{color:'#94a3b8',backdropColor:'transparent'},grid:{color:'rgba(255,255,255,0.08)'}}}}});
</script>

BUBBLE CHART (for showing 3 variables: x, y, size):
<canvas id="bubble"></canvas>
<script>
new Chart(document.getElementById('bubble'), {type:'bubble', data:{datasets:[{label:'Series A',data:[{x:10,y:70,r:15},{x:20,y:85,r:22},{x:35,y:60,r:10},{x:50,y:90,r:30}],backgroundColor:'rgba(139,92,246,0.6)',borderColor:'#8b5cf6'},{label:'Series B',data:[{x:15,y:40,r:12},{x:30,y:55,r:20},{x:45,y:75,r:8},{x:60,y:50,r:18}],backgroundColor:'rgba(6,182,212,0.6)',borderColor:'#06b6d4'}]},options:{responsive:true,plugins:{legend:{labels:{color:'#f8fafc'}}},scales:{x:{ticks:{color:'#94a3b8'},grid:{color:'rgba(255,255,255,0.05)'}},y:{ticks:{color:'#94a3b8'},grid:{color:'rgba(255,255,255,0.05)'}}}}});
</script>

STACKED BAR chart (for showing composition/breakdown):
<canvas id="stacked" style="max-height:320px"></canvas>
<script>
new Chart(document.getElementById('stacked'), {type:'bar', data:{labels:['Q1','Q2','Q3','Q4'],datasets:[{label:'Product A',data:[45,58,42,62],backgroundColor:'rgba(139,92,246,0.8)',borderRadius:4},{label:'Product B',data:[30,38,55,41],backgroundColor:'rgba(6,182,212,0.8)',borderRadius:4},{label:'Product C',data:[25,18,30,35],backgroundColor:'rgba(16,185,129,0.8)',borderRadius:4}]},options:{responsive:true,plugins:{legend:{labels:{color:'#f8fafc'}}},scales:{x:{stacked:true,ticks:{color:'#94a3b8'},grid:{display:false}},y:{stacked:true,ticks:{color:'#94a3b8'},grid:{color:'rgba(255,255,255,0.05)'}}}}});
</script>

SCATTER PLOT chart (for correlation data):
<canvas id="scatter" style="max-height:320px"></canvas>
<script>
new Chart(document.getElementById('scatter'), {type:'scatter', data:{datasets:[{label:'Dataset A',data:[{x:10,y:75},{x:20,y:82},{x:30,y:68},{x:40,y:91},{x:50,y:85}],backgroundColor:'rgba(139,92,246,0.6)',borderColor:'#8b5cf6',pointRadius:8},{label:'Dataset B',data:[{x:15,y:45},{x:25,y:52},{x:35,y:60},{x:45,y:58},{x:55,y:70}],backgroundColor:'rgba(6,182,212,0.6)',borderColor:'#06b6d4',pointRadius:8}]},options:{responsive:true,plugins:{legend:{labels:{color:'#f8fafc'}}},scales:{x:{ticks:{color:'#94a3b8'},grid:{color:'rgba(255,255,255,0.05)'}},y:{ticks:{color:'#94a3b8'},grid:{color:'rgba(255,255,255,0.05)'}}}}});
</script>

HORIZONTAL BAR chart (for rankings/leaderboards):
<canvas id="hbar" style="max-height:320px"></canvas>
<script>
new Chart(document.getElementById('hbar'), {type:'bar', data:{labels:['#1 USA','#2 China','#3 India','#4 Brazil','#5 UK'],datasets:[{label:'Population (M)',data:[331,1412,1380,215,67],backgroundColor:['rgba(139,92,246,0.8)','rgba(6,182,212,0.8)','rgba(16,185,129,0.8)','rgba(245,158,11,0.8)','rgba(236,72,153,0.8)'],borderRadius:6}]},options:{indexAxis:'y',responsive:true,plugins:{legend:{display:false}},scales:{x:{ticks:{color:'#94a3b8'},grid:{color:'rgba(255,255,255,0.05)'}},y:{ticks:{color:'#f8fafc'}}}}});
</script>

🎭 ANIMATION REQUIREMENTS:
- Entry animations: ALL elements slide/fade in with staggered delays (100ms, 200ms, 300ms...)
- CSS @keyframes: fadeInUp, slideInLeft, slideInRight, scaleIn, countUp, pulse, float, shimmer
- Hover effects: scale(1.03-1.05) + glow box-shadow transitions, color transitions
- Progress bars and rings MUST animate on load (from 0 to final value)
- Counter animations for ALL statistics (count up from 0 using JS)
- Chart.js ALWAYS include animation options: options: { animation: { duration: 1200, easing: 'easeOutQuart' }, responsive: true, maintainAspectRatio: false, ...}
- Wrap ALL charts in a div with explicit height: <div style="height:280px;position:relative"><canvas id="..."></canvas></div>

🃏 PREMIUM COMPONENT STYLES:
Stat card with trend:
<div style="background:rgba(18,18,26,0.9);border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:24px;position:relative;overflow:hidden;">
  <div style="position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#8b5cf6,#06b6d4)"></div>
  <div style="font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px">REVENUE</div>
  <div style="font-size:36px;font-weight:700;font-family:Outfit,sans-serif;background:linear-gradient(135deg,#8b5cf6,#06b6d4);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin:8px 0">$84.2K</div>
  <div style="color:#10b981;font-size:13px">▲ 12.4% from last month</div>
</div>

Glassmorphism card:
<div style="background:rgba(255,255,255,0.04);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.1);border-radius:20px;padding:24px;box-shadow:0 20px 60px rgba(0,0,0,0.3)">...</div>

Animated progress bar:
<div style="background:rgba(255,255,255,0.06);border-radius:100px;height:8px;overflow:hidden">
  <div style="height:100%;background:linear-gradient(90deg,#8b5cf6,#06b6d4);border-radius:100px;width:0;transition:width 1.5s ease-out" data-target="75%"></div>
</div>

SVG Donut ring with centered label:
<svg width="160" height="160" viewBox="0 0 160 160" style="transform:rotate(-90deg)">
  <circle cx="80" cy="80" r="60" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="16"/>
  <circle cx="80" cy="80" r="60" fill="none" stroke="url(#ring-grad)" stroke-width="16" stroke-linecap="round" stroke-dasharray="376" stroke-dashoffset="94" style="transition:stroke-dashoffset 1.5s ease-out"/>
  <defs><linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#8b5cf6"/><stop offset="100%" stop-color="#06b6d4"/></linearGradient></defs>
</svg>

Sparkline mini-chart (inline trend indicator):
<canvas id="spark" width="100" height="36" style="display:inline-block"></canvas>
<script>new Chart(document.getElementById('spark'),{type:'line',data:{labels:['','','','','','',''],datasets:[{data:[3,5,2,8,4,9,7],borderColor:'#10b981',backgroundColor:'rgba(16,185,129,0.1)',fill:true,tension:0.4,pointRadius:0,borderWidth:2}]},options:{responsive:false,plugins:{legend:{display:false},tooltip:{enabled:false}},scales:{x:{display:false},y:{display:false}},animation:{duration:800}}});</script>

Stat card with integrated sparkline (BEST pattern for KPI dashboards):
<div style="background:rgba(18,18,26,0.9);border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:20px;position:relative;overflow:hidden">
  <div style="position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#10b981,#06b6d4)"></div>
  <div style="display:flex;justify-content:space-between;align-items:flex-start">
    <div>
      <div style="font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">ACTIVE USERS</div>
      <div style="font-size:32px;font-weight:800;font-family:Outfit,sans-serif;background:linear-gradient(135deg,#10b981,#06b6d4);-webkit-background-clip:text;-webkit-text-fill-color:transparent" data-count="12847" data-compact="true">0</div>
      <div style="color:#10b981;font-size:12px;margin-top:4px">▲ 8.3% this week</div>
    </div>
    <div style="height:48px;width:90px"><canvas id="spark-users"></canvas></div>
  </div>
</div>
<script>new Chart(document.getElementById('spark-users'),{type:'line',data:{labels:Array(8).fill(''),datasets:[{data:[820,950,890,1100,980,1240,1180,1285],borderColor:'#10b981',backgroundColor:'rgba(16,185,129,0.15)',fill:true,tension:0.5,pointRadius:0,borderWidth:2}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{enabled:false}},scales:{x:{display:false},y:{display:false}},animation:{duration:1000}}});</script>

Big number callout (for impact statistics):
<div style="text-align:center;padding:32px 24px;background:rgba(139,92,246,0.06);border:1px solid rgba(139,92,246,0.15);border-radius:20px">
  <div style="font-size:clamp(56px,8vw,96px);font-weight:900;font-family:Outfit,sans-serif;background:linear-gradient(135deg,#8b5cf6,#06b6d4);-webkit-background-clip:text;-webkit-text-fill-color:transparent;line-height:1" data-count="4200000" data-compact="true">0</div>
  <div style="font-size:16px;color:#94a3b8;margin-top:12px;letter-spacing:2px;text-transform:uppercase">Downloads worldwide</div>
  <div style="width:80px;height:3px;background:linear-gradient(90deg,#8b5cf6,#06b6d4);border-radius:100px;margin:16px auto 0"></div>
</div>

Feature comparison table row:
<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:1px;background:rgba(255,255,255,0.05);border-radius:8px;overflow:hidden">
  <div style="background:#12121a;padding:12px 16px;color:#f8fafc;font-size:13px">Feature</div>
  <div style="background:#12121a;padding:12px 16px;text-align:center"><span style="color:#10b981;font-size:16px">✓</span></div>
  <div style="background:#12121a;padding:12px 16px;text-align:center"><span style="color:#ef4444;font-size:16px">✗</span></div>
</div>

Ranked leaderboard list (top-N with scores/bars):
<div style="display:flex;flex-direction:column;gap:10px">
  <div style="display:flex;align-items:center;gap:12px;background:rgba(139,92,246,0.08);border:1px solid rgba(139,92,246,0.25);border-radius:12px;padding:12px 16px">
    <span style="font-size:20px;font-weight:900;color:#8b5cf6;min-width:32px;text-align:center">#1</span>
    <div style="flex:1">
      <div style="font-size:14px;font-weight:600;color:#f8fafc">Item Name</div>
      <div style="margin-top:4px;height:6px;background:rgba(255,255,255,0.08);border-radius:100px;overflow:hidden">
        <div style="width:0;height:100%;background:linear-gradient(90deg,#8b5cf6,#06b6d4);border-radius:100px;transition:width 1.2s ease-out" data-target="92%"></div>
      </div>
    </div>
    <span style="font-size:16px;font-weight:700;color:#8b5cf6">92</span>
  </div>
</div>

Architecture / system diagram (SVG arrows connecting boxes):
<svg viewBox="0 0 600 200" width="100%" style="overflow:visible">
  <defs><marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#8b5cf6"/></marker></defs>
  <!-- Box 1 -->
  <rect x="20" y="70" width="120" height="60" rx="12" fill="rgba(139,92,246,0.15)" stroke="#8b5cf6" stroke-width="1.5"/>
  <text x="80" y="97" text-anchor="middle" fill="#c4b5fd" font-size="13" font-weight="600">Client</text>
  <text x="80" y="116" text-anchor="middle" fill="#94a3b8" font-size="11">Browser/App</text>
  <!-- Arrow 1→2 -->
  <line x1="140" y1="100" x2="200" y2="100" stroke="#8b5cf6" stroke-width="1.5" marker-end="url(#arr)" stroke-dasharray="4,3"/>
  <!-- Box 2 -->
  <rect x="200" y="70" width="120" height="60" rx="12" fill="rgba(6,182,212,0.15)" stroke="#06b6d4" stroke-width="1.5"/>
  <text x="260" y="97" text-anchor="middle" fill="#67e8f9" font-size="13" font-weight="600">API Gateway</text>
  <text x="260" y="116" text-anchor="middle" fill="#94a3b8" font-size="11">REST / GraphQL</text>
  <!-- Arrow 2→3 -->
  <line x1="320" y1="100" x2="380" y2="100" stroke="#06b6d4" stroke-width="1.5" marker-end="url(#arr)" stroke-dasharray="4,3"/>
  <!-- Box 3 -->
  <rect x="380" y="70" width="120" height="60" rx="12" fill="rgba(16,185,129,0.15)" stroke="#10b981" stroke-width="1.5"/>
  <text x="440" y="97" text-anchor="middle" fill="#6ee7b7" font-size="13" font-weight="600">Database</text>
  <text x="440" y="116" text-anchor="middle" fill="#94a3b8" font-size="11">PostgreSQL</text>
</svg>

📐 D3.JS FOR CUSTOM VISUALIZATIONS (d3 is available as window.d3):
Use D3 for unique, custom visualizations that Chart.js can't do. Examples:

Force-directed graph:
<div id="force-graph" style="width:100%;height:400px"></div>
<script>
const data = {nodes:[{id:'A'},{id:'B'},{id:'C'}],links:[{source:'A',target:'B'},{source:'B',target:'C'}]};
const svg = d3.select('#force-graph').append('svg').attr('width','100%').attr('height',400);
const sim = d3.forceSimulation(data.nodes).force('link',d3.forceLink(data.links).id(d=>d.id)).force('charge',d3.forceManyBody().strength(-100)).force('center',d3.forceCenter(400,200));
const link = svg.append('g').selectAll('line').data(data.links).join('line').attr('stroke','rgba(139,92,246,0.5)').attr('stroke-width',2);
const node = svg.append('g').selectAll('circle').data(data.nodes).join('circle').attr('r',20).attr('fill','#8b5cf6').attr('stroke','#06b6d4').attr('stroke-width',2).call(d3.drag().on('start',e=>{if(!e.active)sim.alphaTarget(0.3).restart();e.subject.fx=e.subject.x;e.subject.fy=e.subject.y}).on('drag',e=>{e.subject.fx=e.x;e.subject.fy=e.y}).on('end',e=>{if(!e.active)sim.alphaTarget(0);e.subject.fx=null;e.subject.fy=null}));
sim.on('tick',()=>{link.attr('x1',d=>d.source.x).attr('y1',d=>d.source.y).attr('x2',d=>d.target.x).attr('y2',d=>d.target.y);node.attr('cx',d=>d.x).attr('cy',d=>d.y)});
</script>

Treemap:
<div id="treemap" style="width:100%;height:350px"></div>
<script>
const tdata = {name:'root',children:[{name:'A',value:40},{name:'B',value:25},{name:'C',value:35}]};
const w=600,h=350;
const svg=d3.select('#treemap').append('svg').attr('viewBox','0 0 '+w+' '+h).attr('width','100%').attr('height',h);
const root=d3.hierarchy(tdata).sum(d=>d.value);
d3.treemap().size([w,h]).padding(3)(root);
const colors=['#8b5cf6','#06b6d4','#10b981','#f59e0b'];
svg.selectAll('rect').data(root.leaves()).join('rect').attr('x',d=>d.x0).attr('y',d=>d.y0).attr('width',d=>d.x1-d.x0).attr('height',d=>d.y1-d.y0).attr('fill',(d,i)=>colors[i%colors.length]).attr('rx',8).attr('opacity',0.85);
svg.selectAll('text').data(root.leaves()).join('text').attr('x',d=>(d.x0+d.x1)/2).attr('y',d=>(d.y0+d.y1)/2).attr('text-anchor','middle').attr('fill','white').attr('font-size','14px').text(d=>d.data.name);
</script>

Sunburst chart (for hierarchical data like file systems, org charts, category breakdowns):
<div id="sunburst" style="width:100%;height:400px;display:flex;justify-content:center"></div>
<script>
(function(){
const W=380,R=W/2;
const data={name:'root',children:[{name:'Alpha',value:30,children:[{name:'A1',value:12},{name:'A2',value:18}]},{name:'Beta',value:40,children:[{name:'B1',value:20},{name:'B2',value:10},{name:'B3',value:10}]},{name:'Gamma',value:30,children:[{name:'G1',value:15},{name:'G2',value:15}]}]};
const color=d3.scaleOrdinal(['#8b5cf6','#06b6d4','#10b981','#f59e0b','#ec4899','#f97316']);
const svg=d3.select('#sunburst').append('svg').attr('width',W).attr('height',W).append('g').attr('transform','translate('+R+','+R+')');
const partition=d3.partition().size([2*Math.PI,R]);
const root=d3.hierarchy(data).sum(d=>d.value||0);
partition(root);
const arc=d3.arc().startAngle(d=>d.x0).endAngle(d=>d.x1).innerRadius(d=>d.y0*0.5+20).outerRadius(d=>d.y1*0.5+15);
svg.selectAll('path').data(root.descendants().filter(d=>d.depth)).join('path').attr('d',arc).attr('fill',(d)=>color(d.ancestors().reverse()[1]?.data.name||d.data.name)).attr('stroke','#0a0a0f').attr('stroke-width',2).attr('opacity',0.88).style('cursor','pointer').on('mouseover',function(e,d){d3.select(this).attr('opacity',1).attr('stroke','#fff');}).on('mouseout',function(e,d){d3.select(this).attr('opacity',0.88).attr('stroke','#0a0a0f');});
svg.selectAll('text').data(root.descendants().filter(d=>d.depth&&(d.y1-d.y0)*0.5>14)).join('text').attr('transform',d=>{const a=(d.x0+d.x1)/2-Math.PI/2,r=(d.y0+d.y1)/4+20;return 'rotate('+a*180/Math.PI+') translate('+r+',0) rotate('+(a>Math.PI/2&&a<3*Math.PI/2?180:0)+')'}).attr('text-anchor','middle').attr('fill','#f8fafc').attr('font-size','11px').attr('font-weight','600').text(d=>d.data.name);
})();
</script>

Heatmap calendar (great for activity, usage, or any day-of-week × week data):
<div id="heatmap" style="width:100%;overflow-x:auto"></div>
<script>
(function(){
const days=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const weeks=12;
const data=Array.from({length:7},()=>Array.from({length:weeks},()=>Math.floor(Math.random()*10)));
const cellSize=28,gap=4,W=weeks*(cellSize+gap)+48,H=7*(cellSize+gap)+30;
const svg=d3.select('#heatmap').append('svg').attr('width',W).attr('height',H);
const color=d3.scaleSequential([0,9],d3.interpolate('#1a1a2e','#8b5cf6'));
data.forEach((row,ri)=>{
  svg.append('text').attr('x',38).attr('y',ri*(cellSize+gap)+cellSize*0.65+24).attr('text-anchor','end').attr('fill','#94a3b8').attr('font-size','11px').text(days[ri]);
  row.forEach((val,ci)=>{
    svg.append('rect').attr('x',44+ci*(cellSize+gap)).attr('y',ri*(cellSize+gap)+18).attr('width',cellSize).attr('height',cellSize).attr('rx',4).attr('fill',color(val)).attr('opacity',0.9).append('title').text(days[ri]+', Week '+(ci+1)+': '+val+' events');
  });
});
for(let ci=0;ci<weeks;ci+=4){
  svg.append('text').attr('x',44+ci*(cellSize+gap)+cellSize/2).attr('y',12).attr('text-anchor','middle').attr('fill','#64748b').attr('font-size','10px').text('Wk '+(ci+1));
}
})();
</script>

🌊 ANIMATED FLOW DIAGRAM (step-by-step process):
<div style="display:flex;align-items:center;gap:0;flex-wrap:wrap;justify-content:center">
  <div style="background:linear-gradient(135deg,#8b5cf6,#7c3aed);border-radius:12px;padding:16px 20px;text-align:center;animation:fadeInUp 0.5s ease both">
    <div style="font-size:24px">1️⃣</div>
    <div style="font-size:13px;font-weight:600;color:#f8fafc;margin-top:6px">Step One</div>
  </div>
  <div style="width:32px;height:2px;background:linear-gradient(90deg,#8b5cf6,#06b6d4);flex-shrink:0"></div>
  <div style="background:linear-gradient(135deg,#06b6d4,#0891b2);border-radius:12px;padding:16px 20px;text-align:center;animation:fadeInUp 0.5s 0.2s ease both">
    <div style="font-size:24px">2️⃣</div>
    <div style="font-size:13px;font-weight:600;color:#f8fafc;margin-top:6px">Step Two</div>
  </div>
</div>

📊 STACKED COMPARISON BARS (visual percentage comparison):
<div style="display:flex;flex-direction:column;gap:12px">
  <div>
    <div style="display:flex;justify-content:space-between;margin-bottom:4px">
      <span style="font-size:13px;color:#f8fafc">Category A</span>
      <span style="font-size:13px;color:#8b5cf6;font-weight:700">78%</span>
    </div>
    <div style="background:rgba(255,255,255,0.06);border-radius:100px;height:10px;overflow:hidden">
      <div style="width:0;height:100%;background:linear-gradient(90deg,#8b5cf6,#7c3aed);border-radius:100px;transition:width 1.5s cubic-bezier(.25,.46,.45,.94)" data-target="78%"></div>
    </div>
  </div>
</div>

🎯 ICON CARD GRID (feature highlights):
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px">
  <div style="background:rgba(18,18,26,0.8);border:1px solid rgba(139,92,246,0.2);border-radius:16px;padding:20px;text-align:center;transition:transform 0.3s,box-shadow 0.3s" onmouseover="this.style.transform='translateY(-4px)';this.style.boxShadow='0 12px 40px rgba(139,92,246,0.3)'" onmouseout="this.style.transform='';this.style.boxShadow=''">
    <div style="font-size:32px;margin-bottom:12px">⚡</div>
    <div style="font-size:15px;font-weight:600;color:#f8fafc;margin-bottom:6px">Feature Name</div>
    <div style="font-size:12px;color:#94a3b8;line-height:1.5">Brief description of the feature or benefit</div>
  </div>
</div>

💡 BUILT-IN AUTO-BEHAVIOURS (always available, no extra JS needed):
- [data-count="1234000" data-compact="true" data-prefix="$"] → auto-animates counter with K/M/B compact format (e.g. $1.2M)
- [data-count="1234" data-prefix="$" data-suffix="K" data-decimals="1"] → auto-animates counter from 0
- [data-target="78%"] on a progress bar inner div → auto-animates width from 0 to target
- [data-target="60%" data-axis="height"] on a bar → animates height for vertical bar charts
- [data-chart-type="bar" data-labels='[...]' data-chart-data='[...]'] → auto-creates Chart.js chart
- .auto-grid, .grid-2, .grid-3, .grid-4 children → auto-stagger fade-in animation on load
- [data-tooltip="your tip text"] on any element → shows floating tooltip on hover
- [data-aos] or .animate-on-scroll → scroll-triggered fade-in via IntersectionObserver
- .section-divider with inner .section-label → gradient-fading horizontal rule with centered label
- .callout / .callout-success / .callout-warning → left-border accent highlight box
- .badge / .badge-new / .badge-success → pill badges with color variants
- .section-title → gradient text heading with gradient underline

🌟 HERO BANNER (use at the top of every visual for maximum impact):
<div style="background:linear-gradient(135deg,#0a0a0f 0%,#13102a 50%,#0a0a1f 100%);border-radius:20px;padding:40px 32px;text-align:center;position:relative;overflow:hidden;margin-bottom:28px">
  <div style="position:absolute;inset:0;background-image:radial-gradient(circle,rgba(139,92,246,0.12) 1px,transparent 1px);background-size:28px 28px;pointer-events:none"></div>
  <div style="position:absolute;top:-60px;right:-60px;width:240px;height:240px;background:radial-gradient(circle,rgba(139,92,246,0.25),transparent 70%);pointer-events:none"></div>
  <div style="position:absolute;bottom:-40px;left:-40px;width:200px;height:200px;background:radial-gradient(circle,rgba(6,182,212,0.2),transparent 70%);pointer-events:none"></div>
  <div style="position:relative;z-index:1">
    <div style="display:inline-flex;align-items:center;gap:8px;background:rgba(139,92,246,0.15);border:1px solid rgba(139,92,246,0.3);border-radius:100px;padding:6px 14px;font-size:12px;color:#8b5cf6;font-weight:600;margin-bottom:16px;letter-spacing:0.5px">⚡ VISUAL REPORT</div>
    <h1 style="font-family:Outfit,sans-serif;font-size:clamp(28px,5vw,52px);font-weight:800;background:linear-gradient(135deg,#f8fafc 0%,#c4b5fd 50%,#67e8f9 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:12px;line-height:1.1">Title Goes Here</h1>
    <p style="color:#94a3b8;font-size:clamp(13px,2vw,16px);max-width:560px;margin:0 auto;line-height:1.6">Subtitle or brief description that provides context for the visual content below.</p>
  </div>
</div>

📅 GANTT / SCHEDULE CHART (pure HTML/CSS, no Chart.js needed):
<div style="overflow-x:auto">
  <table style="width:100%;border-collapse:collapse;min-width:500px">
    <thead>
      <tr style="background:rgba(139,92,246,0.1)">
        <th style="padding:10px 14px;text-align:left;color:#94a3b8;font-size:12px;font-weight:600;width:140px">Task</th>
        <th style="padding:10px 6px;text-align:center;color:#94a3b8;font-size:11px;width:40px">Jan</th>
        <th style="padding:10px 6px;text-align:center;color:#94a3b8;font-size:11px;width:40px">Feb</th>
        <th style="padding:10px 6px;text-align:center;color:#94a3b8;font-size:11px;width:40px">Mar</th>
        <th style="padding:10px 6px;text-align:center;color:#94a3b8;font-size:11px;width:40px">Apr</th>
        <th style="padding:10px 6px;text-align:center;color:#94a3b8;font-size:11px;width:40px">May</th>
        <th style="padding:10px 6px;text-align:center;color:#94a3b8;font-size:11px;width:40px">Jun</th>
      </tr>
    </thead>
    <tbody>
      <tr style="border-bottom:1px solid rgba(255,255,255,0.05)">
        <td style="padding:8px 14px;font-size:13px;color:#f8fafc">Phase 1</td>
        <td colspan="2" style="padding:4px 4px"><div style="height:20px;background:linear-gradient(90deg,#8b5cf6,#06b6d4);border-radius:6px;width:100%"></div></td>
        <td colspan="4"></td>
      </tr>
      <tr style="border-bottom:1px solid rgba(255,255,255,0.05)">
        <td style="padding:8px 14px;font-size:13px;color:#f8fafc">Phase 2</td>
        <td></td>
        <td colspan="3" style="padding:4px 4px"><div style="height:20px;background:linear-gradient(90deg,#10b981,#06b6d4);border-radius:6px;width:100%"></div></td>
        <td colspan="2"></td>
      </tr>
    </tbody>
  </table>
</div>

🔧 TECHNICAL REQUIREMENTS:
- Output ONLY raw HTML — no markdown, no explanations, no code blocks, no backticks
- Start with <!DOCTYPE html>
- All CSS in <style> tags in <head> — use extensive CSS variables for theming
- All JavaScript in <script> tags before </body>
- Chart.js is pre-loaded as window.Chart — use it for ALL data visualizations
- D3.js v7 is pre-loaded as window.d3 — use for custom graphs, force layouts, treemaps, etc.
- Lottie animations are pre-loaded — use for animated icons
- Google Fonts (Inter, Outfit, JetBrains Mono) are pre-loaded
- Make FULLY responsive — use CSS grid auto-fit, clamp(), and media queries
- Add smooth hover micro-interactions on ALL interactive elements
- Animate counters with JS: numbers counting up from 0 to final value over 1.5s
- Add particle effects, grid backgrounds, or ambient gradients for visual depth

🚨 ABSOLUTE RULES:
1. ZERO plain text paragraphs — every word must be in a visual container
2. ALWAYS include at least 2 charts or diagram elements
3. ALWAYS add entry animations (CSS @keyframes + staggered animation-delay)
4. ALWAYS use the dark premium color palette — no white backgrounds
5. Output NOTHING except the complete HTML document
6. Make it portfolio-worthy — imagine it featured on a design awards site
7. Use emoji icons in headings and cards for visual richness
8. Add a subtle grid or dot pattern background for depth — use: background-image: radial-gradient(circle, rgba(139,92,246,0.15) 1px, transparent 1px); background-size: 32px 32px; on body or a fixed ::before pseudo-element
9. Include hover states on ALL cards and interactive elements
10. Counter-animate ALL numeric statistics on page load
11. Start with the HERO BANNER pattern — every visual should have a striking header
12. AIM FOR DENSITY — pack in 8-15 visual elements per page: charts, stat cards, timelines, comparisons, flow diagrams. A sparse output is a FAILURE.
13. Use clamp() for font-size to ensure responsive text: font-size: clamp(12px, 2vw, 18px)
14. Every section should have a section header with an icon and gradient underline
15. WRAP all chart canvases in <div style="position:relative;height:Xpx"> for proper sizing — never use canvas without a height-constrained wrapper
16. Include at least ONE data table or comparison grid in addition to charts
17. ALL numbers/statistics MUST use data-count for animated counting from zero
18. Do NOT use Tailwind CSS class names — use only inline styles or CSS in <style> block`;



// Parse OpenAI-compatible SSE streaming response
async function parseSSEStream(
  response: Response,
  signal: AbortSignal | undefined,
  extractDelta: (json: any) => string,
  onChunk: (accumulated: string) => void
): Promise<string> {
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let accumulated = '';
  let buffer = '';
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (signal?.aborted) { reader.cancel(); break; }
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === 'data: [DONE]') continue;
        if (!trimmed.startsWith('data: ')) continue;
        try {
          const json = JSON.parse(trimmed.slice(6));
          const delta = extractDelta(json);
          if (delta) { accumulated += delta; onChunk(accumulated); }
        } catch {}
      }
    }
  } finally {
    reader.releaseLock();
  }
  return accumulated;
}

/**
 * Runs one round of OpenAI-compatible tool calling, then streams the final response.
 * If the model doesn't call any tools, streams the final response directly.
 */
async function generateWithToolsOpenAI(
  endpoint: string,
  headers: Record<string, string>,
  modelId: string,
  messages: any[],
  signal: AbortSignal | undefined,
  onChunk: ((partial: string) => void) | undefined,
  onSearching?: (query: string | null) => void
): Promise<string> {
  // First pass: ask the model — it may call web_search or reply directly
  const firstRes = await fetch(endpoint, {
    method: 'POST',
    headers,
    signal,
    body: JSON.stringify({
      model: modelId,
      messages,
      tools: OPENAI_TOOLS,
      tool_choice: 'auto',
      max_tokens: 6000,
      temperature: 0.4,
    }),
  });

  if (!firstRes.ok) {
    const err = await firstRes.json().catch(() => ({})) as any;
    throw new Error(err.error?.message || `API error ${firstRes.status}`);
  }

  const firstData = await firstRes.json() as any;
  if (firstData.error) throw new Error(firstData.error.message || JSON.stringify(firstData.error));

  const choice = firstData.choices?.[0];
  const assistantMsg = choice?.message;

  // Model wants to call tools
  if (choice?.finish_reason === 'tool_calls' && assistantMsg?.tool_calls?.length > 0) {
    const toolCalls: ToolCall[] = assistantMsg.tool_calls.map((tc: any) => ({
      id: tc.id,
      name: tc.function.name,
      arguments: JSON.parse(tc.function.arguments || '{}'),
    }));

    // Execute each tool call sequentially
    const toolResultMsgs: any[] = [];
    for (const tc of toolCalls) {
      if (tc.name === 'web_search') onSearching?.(tc.arguments.query as string);
      const result = await executeTool(tc, signal);
      toolResultMsgs.push({
        role: 'tool',
        tool_call_id: tc.id,
        content: result.content,
      });
    }
    onSearching?.(null); // clear status

    // Final request with tool results — stream the HTML response
    const finalMessages = [...messages, assistantMsg, ...toolResultMsgs];
    const finalRes = await fetch(endpoint, {
      method: 'POST',
      headers,
      signal,
      body: JSON.stringify({
        model: modelId,
        messages: finalMessages,
        max_tokens: 6000,
        temperature: 0.4,
        stream: !!onChunk,
      }),
    });

    if (!finalRes.ok) {
      const err = await finalRes.json().catch(() => ({})) as any;
      throw new Error(err.error?.message || `API error ${finalRes.status}`);
    }

    if (onChunk && finalRes.body) {
      return parseSSEStream(finalRes, signal, (j) => j.choices?.[0]?.delta?.content || '', onChunk);
    }
    const finalData = await finalRes.json() as any;
    if (finalData.error) throw new Error(finalData.error.message || JSON.stringify(finalData.error));
    return finalData.choices?.[0]?.message?.content || '';
  }

  // No tool calls — the model replied directly (already complete, return as-is)
  return assistantMsg?.content || '';
}

// Intelligently expand short or vague prompts into rich visual requests
function enrichPrompt(prompt: string): string {
  const trimmed = prompt.trim();
  const words = trimmed.split(/\s+/).filter(Boolean);

  // Only enrich if prompt is very short (1-4 words) or purely conversational
  if (words.length > 4) return trimmed;

  const lower = trimmed.toLowerCase();

  // Greetings
  if (/^(hi+|hey+|hello+|howdy|yo+|sup|what'?s up|hiya)[\s!?.]*$/i.test(lower)) {
    return `Create a stunning animated greeting visual. Large bold "Hello!" text with a vibrant gradient, floating geometric shapes, particle effects, and a warm welcoming atmosphere. Make it feel alive and joyful.`;
  }
  // Single emotion / mood
  if (/^(happy|sad|excited|bored|tired|angry|love|chill|vibes?|mood)[\s!?.]*$/i.test(lower)) {
    return `Create a beautiful visual that captures the feeling of "${trimmed}". Use colors, shapes, typography, and animations to express this emotion artistically. Make it something someone would want as their wallpaper.`;
  }
  // Questions about self / existential
  if (/^(why|what|who am i|help|idk|hmm+|ugh|ok+|okay)[\s!?.]*$/i.test(lower)) {
    return `Create a fun, creative, thought-provoking visual infographic about the concept of "${trimmed}". Make it artistic, witty, and visually stunning.`;
  }
  // Any other short prompt — wrap it creatively
  return `Create a breathtaking visual experience inspired by: "${trimmed}".
Be creative and imaginative — transform this into something visually stunning:
- If it's a word or concept, make a beautiful artistic infographic about it
- If it's a name or place, create a showcase visual
- If it's abstract, interpret it with colors, shapes, and animations
Make it something the user would be amazed by and want to share.`;
}

// Generate with AI
const generateWithAI = async (
  prompt: string,
  model: ModelProvider,
  apiKey: string,
  contextHtml?: string,
  signal?: AbortSignal,
  onChunk?: (partial: string) => void,
  onSearching?: (query: string | null) => void
): Promise<string> => {
  // Build context from previous HTML if provided
  const contextSection = contextHtml
    ? `\n\nREFERENCE DESIGN (use as inspiration but create something NEW and DIFFERENT):\n${contextHtml.substring(0, 1500)}\n\nCreate a variation with different colors, layout, or styling while keeping the same type of component.`
    : '';
  
  const uiPrompt = `${enrichPrompt(prompt)}${contextSection}

🎯 VISUAL OUTPUT REQUIREMENTS:
- Transform this into a stunning visual experience — NOT text
- Use the dark palette (#0a0a0f bg, #8b5cf6 violet, #06b6d4 cyan)
- Include animated entry effects (fadeInUp with staggered delays)
- Add Chart.js charts if there is any numerical or comparative data
- Use glassmorphism cards, gradient text headings, glowing accent borders
- Add hover interactions and micro-animations
- Make it visually stunning enough to share on social media`;

  let response;
  let rawHtml = '';
  
  if (model === 'openrouter') {
    const orEndpoint = 'https://openrouter.ai/api/v1/chat/completions';
    const orHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://visual-ai-app.vercel.app',
      'X-Title': 'Visual AI',
    };
    const orMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: uiPrompt },
    ];

    // Use tool calling when the prompt needs live/current data
    if (needsSearch(uiPrompt)) {
      rawHtml = await generateWithToolsOpenAI(orEndpoint, orHeaders, selectedFreeModel, orMessages, signal, onChunk, onSearching);
    } else {
      response = await fetch(orEndpoint, {
        method: 'POST',
        headers: orHeaders,
        signal,
        body: JSON.stringify({ model: selectedFreeModel, messages: orMessages, temperature: 0.4, max_tokens: 6000, stream: !!onChunk }),
      });
      if (onChunk && response.body) {
        rawHtml = await parseSSEStream(response, signal, (j) => j.choices?.[0]?.delta?.content || '', onChunk);
      } else {
        const data = await response.json();
        if (data.error) {
          const raw = data.error?.metadata?.raw || data.error?.metadata?.reasons?.join(', ') || '';
          const msg = data.error?.message || JSON.stringify(data.error);
          throw new Error(`OpenRouter error: ${msg}${raw ? ` — ${raw}` : ''}`);
        }
        rawHtml = data.choices?.[0]?.message?.content || '';
      }
    }
  } else if (model === 'openai') {
    const oaEndpoint = 'https://api.openai.com/v1/chat/completions';
    const oaHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    };
    const oaMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: uiPrompt },
    ];

    if (needsSearch(uiPrompt)) {
      rawHtml = await generateWithToolsOpenAI(oaEndpoint, oaHeaders, 'gpt-4o', oaMessages, signal, onChunk, onSearching);
    } else {
      response = await fetch(oaEndpoint, {
        method: 'POST',
        headers: oaHeaders,
        signal,
        body: JSON.stringify({ model: 'gpt-4o', messages: oaMessages, temperature: 0.4, max_tokens: 6000, stream: !!onChunk }),
      });
      if (onChunk && response.body) {
        rawHtml = await parseSSEStream(response, signal, (j) => j.choices?.[0]?.delta?.content || '', onChunk);
      } else {
        const data = await response.json();
        if (data.error) throw new Error(`OpenAI error: ${data.error.message || JSON.stringify(data.error)}`);
        rawHtml = data.choices?.[0]?.message?.content || '';
      }
    }
  } else if (model === 'gemini') {
    response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal,
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${SYSTEM_PROMPT}\n\n${uiPrompt}` }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 6000 }
      })
    });
    
    const data = await response.json();
    if (data.error) throw new Error(`Gemini error: ${data.error?.message || JSON.stringify(data.error)}`);
    rawHtml = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  } else if (model === 'claude') {
    response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      signal,
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        system: SYSTEM_PROMPT,
        messages: [
          { role: 'user', content: uiPrompt }
        ],
        max_tokens: 6000,
        stream: !!onChunk
      })
    });
    if (onChunk && response.body) {
      rawHtml = await parseSSEStream(response, signal, (j) => j.type === 'content_block_delta' ? (j.delta?.text || '') : '', onChunk);
    } else {
      const data = await response.json();
      if (data.error) throw new Error(`Anthropic error: ${data.error?.message || JSON.stringify(data.error)}`);
      rawHtml = data.content?.[0]?.text || '';
    }
  } else if (model === 'kimi') {
    // Kimi API - uses same key field (auto-detect)
    if (!apiKey && !kimiApiKey) {
      throw new Error('🌙 Please set your API key in settings to use Kimi K2.5');
    }
    const kimikey = kimiApiKey || apiKey;
    response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${kimikey}`
      },
      signal,
      body: JSON.stringify({
        model: 'kimi-k2.5',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: uiPrompt }
        ],
        temperature: 0.3,
        max_tokens: 6000,
        stream: !!onChunk
      })
    });
    if (onChunk && response.body) {
      rawHtml = await parseSSEStream(response, signal, (j) => j.choices?.[0]?.delta?.content || '', onChunk);
    } else {
      const data = await response.json();
      if (data.error) throw new Error(`Kimi error: ${data.error?.message || JSON.stringify(data.error)}`);
      rawHtml = data.choices?.[0]?.message?.content || '';
    }
  } else if (model === 'minimax') {
    // MiniMax M2.5 API
    if (!minimaxApiKey) {
      throw new Error('🔮 Please set your MiniMax API key in settings to use MiniMax M2.5');
    }
    response = await fetch('https://api.minimax.io/v1/text/chatcompletion_v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${minimaxApiKey}`
      },
      signal,
      body: JSON.stringify({
        model: 'MiniMax-M2.5',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: uiPrompt }
        ],
        temperature: 0.3,
        max_tokens: 6000,
        stream: !!onChunk
      })
    });
    if (onChunk && response.body) {
      // MiniMax is a reasoning model — only forward content, not reasoning_content
      rawHtml = await parseSSEStream(response, signal, (j) => j.choices?.[0]?.delta?.content || '', onChunk);
    } else {
      const data = await response.json();
      if (data.base_resp?.status_code !== 0) throw new Error(`MiniMax error: ${data.base_resp?.status_msg || JSON.stringify(data.base_resp)}`);
      rawHtml = data.choices?.[0]?.message?.content || '';
    }
  } else if (model === 'local') {
    // Local model - return a template message (not functional without local LLM setup)
    throw new Error('Local model requires a local LLM server. Use OpenRouter for free AI generation.');
  }
  
  // Clean up markdown code blocks if present
  return cleanHtmlOutput(rawHtml);
};

/**
 * Cleans and normalises raw AI output to extract valid HTML.
 * Handles markdown code blocks, HTML entity escaping, and leading non-HTML text.
 * @throws {Error} if the input is empty or contains no recognisable HTML.
 */
export const cleanHtmlOutput = (html: string): string => {
  if (!html || !html.trim()) {
    throw new Error('Empty response from AI. Please try again.');
  }

  // Step 1: Unescape HTML entities that may have been double-escaped
  let cleaned = html
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\\</g, '<')
    .replace(/\\>/g, '>');

  // Step 2: Extract from markdown code blocks wherever they appear
  // Handles: ```html\n...\n```, ```\n...\n```, and text before/after the block
  const codeBlockMatch = cleaned.match(/```(?:html|HTML)?\s*\n?([\s\S]*?)\s*```/);
  if (codeBlockMatch) {
    cleaned = codeBlockMatch[1];
  }

  const trimmed = cleaned.trim();

  // Step 3: If it already starts with a valid HTML opening, return immediately
  const lc = trimmed.toLowerCase();
  if (
    lc.startsWith('<!doctype') ||
    lc.startsWith('<html') ||
    lc.startsWith('<body') ||
    lc.startsWith('<div') ||
    lc.startsWith('<main') ||
    lc.startsWith('<section') ||
    lc.startsWith('<article') ||
    lc.startsWith('<header') ||
    lc.startsWith('<style') ||
    lc.startsWith('<nav')
  ) {
    return trimmed;
  }

  // Step 4: Find the first HTML tag anywhere in the string and extract from there
  // Prefer <!DOCTYPE or <html start
  const doctypeIdx = trimmed.toLowerCase().indexOf('<!doctype');
  if (doctypeIdx >= 0) return trimmed.substring(doctypeIdx);

  const htmlTagIdx = trimmed.toLowerCase().indexOf('<html');
  if (htmlTagIdx >= 0) return trimmed.substring(htmlTagIdx);

  // Fallback: first < character (handles partial body HTML like <div>...)
  const firstTag = trimmed.indexOf('<');
  if (firstTag >= 0) return trimmed.substring(firstTag);

  // Nothing looks like HTML — return as-is and let renderer show what it can
  console.warn('cleanHtmlOutput: no HTML found in response, returning raw text');
  return trimmed;
};

/**
 * Generates a short, descriptive title (2-5 words) for a visual design based on the prompt.
 * Falls back to a truncated version of the prompt if generation fails.
 */
export const generateTitle = async (prompt: string): Promise<string> => {
  // Simple local fallback: extract key noun phrase from prompt
  const fallback = prompt
    .replace(/create|make|build|design|show|generate|visualize|display/gi, '')
    .trim()
    .split(/\s+/)
    .slice(0, 4)
    .join(' ')
    .replace(/^[a-z]/, c => c.toUpperCase());

  if (!apiKey) return fallback || 'Untitled Design';

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://visual-ai-app.vercel.app',
        'X-Title': 'Visual AI'
      },
      body: JSON.stringify({
        model: selectedFreeModel,
        messages: [
          {
            role: 'user',
            content: `Generate a SHORT title (2-5 words, title case) for a visual design based on this prompt. Reply with ONLY the title, nothing else.\n\nPrompt: ${prompt.substring(0, 200)}`
          }
        ],
        temperature: 0.5,
        max_tokens: 20
      })
    });

    if (!response.ok) return fallback || 'Untitled Design';
    const data = await response.json();
    const title = data.choices?.[0]?.message?.content?.trim() || '';
    // Clean up any quotes or extra text
    return title.replace(/^["']|["']$/g, '').trim() || fallback || 'Untitled Design';
  } catch {
    return fallback || 'Untitled Design';
  }
};

// Enhance prompt for better results
export const enhancePrompt = async (
  prompt: string,
  model: ModelProvider,
  apiKey: string
): Promise<string> => {
  const enhancementPrompt = `You are a visual design prompt enhancer for an AI HTML generator. Transform the given request into a rich, specific prompt that will produce a STUNNING visual HTML experience.

Enhance by adding:
- The best visual format (infographic, dashboard, timeline, comparison, diagram, chart)
- Specific color palette (dark premium: #0a0a0f bg, #8b5cf6 violet, #06b6d4 cyan accents)
- Chart types to include (Chart.js bar, line, doughnut, radar, etc.)
- Animation details (entry animations, counter animations, hover effects)
- Layout (grid cards, timeline, split comparison, etc.)
- Specific data points or numbers to visualize if relevant

Output ONLY the enhanced prompt text. No explanations. Make it detailed but not longer than 3 sentences.`;
  
  try {
    if (model === 'openrouter') {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://visual-ai-app.vercel.app',
          'X-Title': 'Visual AI'
        },
        body: JSON.stringify({
          model: selectedFreeModel,
          messages: [
            { role: 'user', content: `${enhancementPrompt}\n\nOriginal prompt: ${prompt}` }
          ],
          temperature: 0.7
        })
      });
      
      const data = await response.json();
      return data.choices?.[0]?.message?.content || prompt;
    }
    
    if (model === 'openai') {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'user', content: `${enhancementPrompt}\n\nOriginal prompt: ${prompt}` }
          ],
          temperature: 0.7
        })
      });

      const data = await response.json();
      return data.choices?.[0]?.message?.content || prompt;
    }

    if (model === 'gemini' && apiKey) {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${enhancementPrompt}\n\nOriginal prompt: ${prompt}` }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 200 }
        })
      });
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || prompt;
    }

    // Fallback for all other models: use OpenRouter free model if no specific apiKey
    // (Kimi, MiniMax, Claude, local — route enhancement through OpenRouter for free)
    const openRouterFallbackKey = apiKey || '';
    if (openRouterFallbackKey) {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openRouterFallbackKey}`,
          'HTTP-Referer': 'https://visual-ai-app.vercel.app',
          'X-Title': 'Visual AI'
        },
        body: JSON.stringify({
          model: selectedFreeModel,
          messages: [{ role: 'user', content: `${enhancementPrompt}\n\nOriginal prompt: ${prompt}` }],
          temperature: 0.7,
          max_tokens: 200
        })
      });
      const data = await response.json();
      return data.choices?.[0]?.message?.content || prompt;
    }

    return prompt;
  } catch (error) {
    console.error('Prompt enhancement failed:', error);
    return prompt;
  }
};
