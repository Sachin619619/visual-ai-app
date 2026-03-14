import { ModelProvider } from '../types';

// AI Provider configurations
export const AI_PROVIDERS: Record<ModelProvider, { name: string; icon: string }> = {
  openai: { name: 'OpenAI GPT-4', icon: '🤖' },
  claude: { name: 'Claude 3', icon: '🧠' },
  gemini: { name: 'Gemini Pro', icon: '✨' },
  openrouter: { name: 'OpenRouter (Free)', icon: '🔗' },
  local: { name: 'Local Model', icon: '💻' },
};

// Free models available via OpenRouter
export interface FreeModel {
  id: string;
  name: string;
  icon: string;
}

export const FREE_MODELS: FreeModel[] = [
  { id: 'deepseek/deepseek-chat-v3-0324:free', name: 'DeepSeek V3', icon: '💡' },
  { id: 'meta-llama/llama-4-maverick:free', name: 'Llama 4 Maverick', icon: '🦙' },
  { id: 'google/gemma-3-27b-it:free', name: 'Gemma 3 27B', icon: '🌟' },
  { id: 'microsoft/phi-4-reasoning:free', name: 'Phi-4 Reasoning', icon: '⚡' },
  { id: 'qwen/qwen2.5-vl-72b-instruct:free', name: 'Qwen 2.5 72B', icon: '🧑‍💻' },
  { id: 'mistralai/mistral-small-3.1-24b-instruct:free', name: 'Mistral Small 3.1', icon: '🌀' },
  { id: 'anthropic/claude-3-haiku:free', name: 'Claude 3 Haiku', icon: '🧠' },
  { id: 'openai/gpt-4o-mini:free', name: 'GPT-4o Mini', icon: '🤖' },
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
    throw new Error('Please set your API key in settings to generate UI.');
  }
  try {
    return await generateWithAI(prompt, model, apiKey, contextHtml);
  } catch (error: any) {
    console.error('AI generation failed:', error);
    // Re-throw with the original message so the UI can show it
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

// Generate with AI
const generateWithAI = async (
  prompt: string,
  model: ModelProvider,
  apiKey: string,
  contextHtml?: string
): Promise<string> => {
  // Build context from previous HTML if provided
  const contextSection = contextHtml 
    ? `\n\nREFERENCE DESIGN (use as inspiration but create something new):\n${contextHtml.substring(0, 2000)}`
    : '';
  
  const uiPrompt = `${prompt}${contextSection}

🚨 STRICT INSTRUCTION: Output NOTHING except HTML code. Start with <!DOCTYPE html> or <html>. End with </html>. NO other text allowed. Your output will be rendered directly as a webpage. Any non-HTML text will break the preview. Do NOT include explanations, markdown, or code blocks. ONLY HTML.`;

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
          { role: 'system', content: 'Output ONLY raw HTML code. Start with <!DOCTYPE html>. No explanations, no markdown, no code fences. Just HTML.' },
          { role: 'user', content: uiPrompt }
        ],
        temperature: 0.3,
        max_tokens: 8000
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
          { role: 'system', content: 'CRITICAL: Output ONLY raw HTML. Start your response with <!DOCTYPE html> or <html>. NO text before, NO text after, NO markdown, NO code blocks, NO explanations. Your response will be used directly as a web page. Render ONLY HTML.' },
          { role: 'user', content: uiPrompt }
        ],
        temperature: 0.3,
        max_tokens: 8192
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
        contents: [{ parts: [{ text: uiPrompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 8192 }
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
        system: 'CRITICAL: Output ONLY raw HTML. Start your response with <!DOCTYPE html> or <html>. NO text before, NO text after, NO markdown, NO code blocks. ONLY HTML.',
        messages: [
          { role: 'user', content: uiPrompt }
        ],
        max_tokens: 8192
      })
    });
    
    const data = await response.json();
    if (data.error) throw new Error(`Anthropic error: ${data.error?.message || JSON.stringify(data.error)}`);
    rawHtml = data.content?.[0]?.text || '';
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
