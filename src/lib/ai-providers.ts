import { ModelProvider } from '../types';

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

export const setMinimaxApiKey = (key: string) => {
  minimaxApiKey = key;
};

export const getMinimaxApiKey = () => minimaxApiKey;

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
  contextHtml?: string
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
    // Add 90-second timeout to prevent hanging requests
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('⏱️ Generation timed out after 90 seconds. Try a shorter prompt or faster model.')), 90000);
    });
    return await Promise.race([
      generateWithAI(prompt, model, apiKey, contextHtml),
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

📊 CHART.JS EXCELLENCE (Chart.js v4 is always available as window.Chart):
Always use Chart.js for ALL data visualizations. Here are complete examples:

BAR CHART with gradient fill:
<canvas id="barChart"></canvas>
<script>
const ctx = document.getElementById('barChart').getContext('2d');
const grad = ctx.createLinearGradient(0,0,0,300);
grad.addColorStop(0,'rgba(139,92,246,0.9)');
grad.addColorStop(1,'rgba(139,92,246,0.1)');
new Chart(ctx, {type:'bar', data:{labels:['Jan','Feb','Mar','Apr','May'],datasets:[{label:'Revenue',data:[42,58,73,61,89],backgroundColor:grad,borderColor:'#8b5cf6',borderWidth:2,borderRadius:8}]},options:{responsive:true,plugins:{legend:{labels:{color:'#f8fafc'}}},scales:{x:{ticks:{color:'#94a3b8'},grid:{color:'rgba(255,255,255,0.05)'}},y:{ticks:{color:'#94a3b8'},grid:{color:'rgba(255,255,255,0.05)'}}}}});
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
- Chart.js animations: use animation duration 1200ms with easing 'easeOutQuart'

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

Feature comparison table row:
<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:1px;background:rgba(255,255,255,0.05);border-radius:8px;overflow:hidden">
  <div style="background:#12121a;padding:12px 16px;color:#f8fafc;font-size:13px">Feature</div>
  <div style="background:#12121a;padding:12px 16px;text-align:center"><span style="color:#10b981;font-size:16px">✓</span></div>
  <div style="background:#12121a;padding:12px 16px;text-align:center"><span style="color:#ef4444;font-size:16px">✗</span></div>
</div>

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
8. Add a subtle grid or dot pattern background for depth
9. Include hover states on ALL cards and interactive elements
10. Counter-animate ALL numeric statistics on page load`;


// Generate with AI
const generateWithAI = async (
  prompt: string,
  model: ModelProvider,
  apiKey: string,
  contextHtml?: string
): Promise<string> => {
  // Build context from previous HTML if provided
  const contextSection = contextHtml 
    ? `\n\nREFERENCE DESIGN (use as inspiration but create something NEW and DIFFERENT):\n${contextHtml.substring(0, 1500)}\n\nCreate a variation with different colors, layout, or styling while keeping the same type of component.`
    : '';
  
  const uiPrompt = `${prompt}${contextSection}

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
    // Use OpenRouter API - allows browser calls
    response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
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
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: uiPrompt }
        ],
        temperature: 0.4,
        max_tokens: 10000
      })
    });
    
    const data = await response.json();
    if (data.error) {
      const raw = data.error?.metadata?.raw || data.error?.metadata?.reasons?.join(', ') || '';
      const msg = data.error?.message || JSON.stringify(data.error);
      throw new Error(`OpenRouter error: ${msg}${raw ? ` — ${raw}` : ''}`);
    }
    rawHtml = data.choices?.[0]?.message?.content || '';
  } else if (model === 'openai') {
    response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: uiPrompt }
        ],
        temperature: 0.4,
        max_tokens: 10000
      })
    });
    
    const data = await response.json();
    if (data.error) throw new Error(`OpenAI error: ${data.error.message || JSON.stringify(data.error)}`);
    rawHtml = data.choices?.[0]?.message?.content || '';
  } else if (model === 'gemini') {
    response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${SYSTEM_PROMPT}\n\n${uiPrompt}` }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 10000 }
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
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        system: SYSTEM_PROMPT,
        messages: [
          { role: 'user', content: uiPrompt }
        ],
        max_tokens: 10000
      })
    });
    
    const data = await response.json();
    if (data.error) throw new Error(`Anthropic error: ${data.error?.message || JSON.stringify(data.error)}`);
    rawHtml = data.content?.[0]?.text || '';
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
      body: JSON.stringify({
        model: 'kimi-k2.5',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: uiPrompt }
        ],
        temperature: 0.3,
        max_tokens: 10000
      })
    });
    
    const data = await response.json();
    if (data.error) throw new Error(`Kimi error: ${data.error?.message || JSON.stringify(data.error)}`);
    rawHtml = data.choices?.[0]?.message?.content || '';
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
      body: JSON.stringify({
        model: 'MiniMax-M2.5',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: uiPrompt }
        ],
        temperature: 0.3,
        max_tokens: 10000
      })
    });

    const data = await response.json();
    if (data.base_resp?.status_code !== 0) throw new Error(`MiniMax error: ${data.base_resp?.status_msg || JSON.stringify(data.base_resp)}`);
    rawHtml = data.choices?.[0]?.message?.content || '';
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
    
    return prompt;
  } catch (error) {
    console.error('Prompt enhancement failed:', error);
    return prompt;
  }
};
