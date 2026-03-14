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
  { id: 'anthropic/claude-3-5-haiku:free', name: 'Claude 3.5 Haiku', icon: '🎯' },
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

// Enhanced system prompt for better HTML generation
const SYSTEM_PROMPT = `You are an expert UI/UX designer and frontend developer. Your task is to generate beautiful, modern, and responsive HTML/CSS web components.

🎨 DESIGN REQUIREMENTS:
- Use a dark theme by default with colors: background #0f0f23, cards #1a1a2e, accents #8b5cf6 (violet) and #06b6d4 (cyan)
- Use modern CSS with flexbox and grid layouts
- Include smooth animations and transitions (300ms ease)
- Make it fully responsive (mobile, tablet, desktop)
- Use Tailwind CSS classes when possible, or inline styles with modern CSS
- Add subtle hover effects and micro-interactions

🔧 TECHNICAL REQUIREMENTS:
- Output ONLY raw HTML code - no markdown, no explanations, no code blocks
- Start with <!DOCTYPE html> or <html>
- Include all CSS in <style> tags in the <head>
- Include any needed JavaScript in <script> tags before </body>
- Use Google Fonts: Inter, Poppins, or similar modern fonts
- Ensure the design works in modern browsers

🎯 GENERATE STUNNING UI:
- Make it visually impressive with gradients, shadows, and modern styling
- Add appropriate icons (use Lucide icons CDN or similar)
- Include meaningful placeholder content
- Add loading states, hover states, and interactive elements
- Focus on one cohesive component or section

🚨 CRITICAL: Output NOTHING except HTML code. Your response will be rendered directly as a webpage. Any non-HTML text will break the preview.`;

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

📝 Additional style preferences to follow:
- Dark theme with rich, deep backgrounds
- Accent colors: violet (#8b5cf6), cyan (#06b6d4), or choose a complementary palette
- Modern, clean aesthetic with subtle glassmorphism effects
- Smooth animations on hover and interactions
- Responsive design that works on all screen sizes`;

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
    // Kimi API
    if (!kimiApiKey) {
      throw new Error('🌙 Please set your Kimi API key in settings to use Kimi K2.5');
    }
    response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${kimiApiKey}`
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
