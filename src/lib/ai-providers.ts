import { ModelProvider } from '../types';

// AI Provider configurations
export const AI_PROVIDERS: Record<ModelProvider, { name: string; icon: string }> = {
  openai: { name: 'OpenAI GPT-4', icon: '🤖' },
  claude: { name: 'Claude 3', icon: '🧠' },
  gemini: { name: 'Gemini Pro', icon: '✨' },
  openrouter: { name: 'OpenRouter (Free)', icon: '🔗' },
  kimi: { name: 'Kimi K2.5', icon: '🌙' },
  local: { name: 'Local Model', icon: '💻' },
};

// Separate API keys for different providers
let kimiApiKey = '';

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

// Check if API key is configured for any provider
export const isApiKeyConfigured = (): boolean => {
  return !!apiKey || !!kimiApiKey;
};

// Get provider status (configured or not)
export const getProviderStatus = (): Record<ModelProvider, boolean> => {
  return {
    openai: !!apiKey,
    claude: !!apiKey,
    gemini: !!apiKey,
    openrouter: true, // Uses free models
    kimi: !!kimiApiKey,
    local: false,
  };
};

// Generate UI based on prompt
export const generateUI = async (
  prompt: string,
  model: ModelProvider,
  contextHtml?: string
): Promise<string> => {
  if (!apiKey) {
    throw new Error('🔑 Please set your API key in settings to generate UI. Get your free API key from https://openrouter.ai/keys');
  }
  try {
    return await generateWithAI(prompt, model, apiKey, contextHtml);
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
- Think like an infographic designer: data becomes charts, concepts become diagrams, steps become timelines
- Every response should look like it belongs in a premium design portfolio
- The user should say "WOW" when they see your output

🎨 DESIGN SYSTEM:
- Dark theme: background #0a0a0f, cards #12121a, surface #1a1a2e
- Primary accent: #8b5cf6 (violet), secondary: #06b6d4 (cyan), success: #10b981, warning: #f59e0b
- Use rich gradients: linear-gradient(135deg, #8b5cf6, #06b6d4)
- Glassmorphism: backdrop-filter: blur(20px), rgba(255,255,255,0.05) backgrounds with border rgba(255,255,255,0.1)
- Typography: headings use gradient text (-webkit-background-clip: text), body uses system fonts

✨ CONTENT-TYPE RULES — choose the right visual for the content:
- EXPLANATIONS/CONCEPTS → Animated infographic with icons, sections, connecting arrows, visual hierarchy
- COMPARISONS (A vs B) → Side-by-side comparison cards with visual differentiators, pros/cons with colored indicators
- DATA/NUMBERS/STATS → Dashboard with stat cards (large colorful numbers), charts (bar/line/pie), progress rings
- PROCESSES/HOW-TO → Animated step-by-step flow with numbered circles, connector lines, icons per step
- TIMELINES/HISTORY → Vertical timeline with dates, icons, gradient connector line
- LISTS/CATEGORIES → Colorful card grid with icons, hover effects, gradient borders
- SCIENTIFIC/TECHNICAL → Diagram-style layout with labeled components, connecting lines, legend
- WORLD/GEO DATA → Visual map representation or regional breakdown with colored blocks
- CODE/TECHNICAL → Styled code blocks with syntax highlighting + explanatory diagrams

📊 CHART REQUIREMENTS (use Chart.js which is always available):
- Line charts for trends over time
- Bar charts for comparisons
- Pie/Doughnut charts for proportions
- Use beautiful color gradients for chart fills
- Always include legends, tooltips, and smooth animations
- Make charts responsive with proper aspect ratios

🎭 ANIMATION REQUIREMENTS:
- Entry animations: elements slide/fade in with staggered delays (100ms, 200ms, 300ms...)
- Use @keyframes for: fadeInUp, slideInLeft, countUp (for numbers), pulse, float
- Hover effects: scale(1.03) with glow shadows, color transitions
- Progress bars and rings should animate on load
- Counter animations for statistics (count up from 0)

🃏 COMPONENT STYLES:
- Stat cards: large gradient number, icon, label, trend indicator with arrow
- Info cards: glassmorphism bg, gradient top border, icon + title + content
- Timeline items: colored dot on gradient line, date badge, description
- Comparison cols: colored header band, feature list with checkmarks/crosses
- Process steps: numbered gradient circles, connecting animated dashed lines

🔧 TECHNICAL REQUIREMENTS:
- Output ONLY raw HTML — no markdown, no explanations, no code blocks, no backticks
- Start with <!DOCTYPE html>
- All CSS in <style> tags in <head>
- All JavaScript in <script> tags before </body>
- Chart.js is pre-loaded — use it for ALL data visualizations
- Google Fonts (Inter, Outfit, JetBrains Mono) are pre-loaded
- Make it fully responsive with CSS grid and flexbox
- Use CSS custom properties (variables) for theming

🚨 ABSOLUTE RULES:
1. ZERO plain text paragraphs — everything visual
2. ALWAYS include at least one chart/diagram/infographic element
3. ALWAYS use animations (CSS @keyframes or JS)
4. ALWAYS use the dark color palette
5. Output NOTHING except the complete HTML document
6. Make it genuinely beautiful — imagine it being shared on social media`;


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
  } else if (model === 'local') {
    // Local model - return a template message (not functional without local LLM setup)
    throw new Error('Local model requires a local LLM server. Use OpenRouter for free AI generation.');
  }
  
  // Clean up markdown code blocks if present
  return cleanHtmlOutput(rawHtml);
};

// Clean HTML output — robustly extract HTML from any AI response format
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

// Enhance prompt for better results
export const enhancePrompt = async (
  prompt: string,
  model: ModelProvider,
  apiKey: string
): Promise<string> => {
  const enhancementPrompt = `Transform this UI request into a detailed HTML generation prompt.
Focus on:
- Specific colors (dark theme, accent colors)
- Layout structure
- Interactive elements needed
- Data visualization if applicable

Keep it concise but detailed.`;
  
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
