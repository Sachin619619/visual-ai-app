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
  { id: 'deepseek/deepseek-chat:free', name: 'DeepSeek', icon: '💡' },
  { id: 'qwen/qwen3-coder:free', name: 'Qwen Coder', icon: '🧑‍💻' },
  { id: 'google/gemma-3-4b-it:free', name: 'Gemma 3', icon: '🌟' },
  { id: 'microsoft/phi-4-mini:free', name: 'Phi 4 Mini', icon: '⚡' },
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
  // If API key is set, use real AI
  if (apiKey) {
    try {
      const result = await generateWithAI(prompt, model, apiKey, contextHtml);
      return result;
    } catch (error) {
      console.error('AI generation failed:', error);
      throw new Error('AI generation failed. Please check your API key and try again.');
    }
  }
  
  // No API key - show error instead of hardcoded demo
  throw new Error('Please set your API key in settings to generate UI.');
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
  // Enhance prompt for better UI generation
  const enhancedPrompt = await enhancePrompt(prompt, model, apiKey);
  
  // Build context from previous HTML if provided
  const contextSection = contextHtml 
    ? `\n\nREFERENCE DESIGN (use as inspiration but create something new):\n${contextHtml.substring(0, 2000)}`
    : '';
  
  const uiPrompt = `${enhancedPrompt}${contextSection}

CRITICAL: You MUST output ONLY raw HTML code. NO markdown, NO explanations, NO text before or after.

Your response must:
- Start EXACTLY with <!DOCTYPE html> or <html>
- End with </html>
- Contain ONLY valid HTML with inline CSS/JS
- Work immediately when saved as .html file

Do NOT wrap in code blocks. Do NOT add explanations. Do NOT use markdown. Output ONLY the raw HTML.`;

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
          { role: 'system', content: 'STRICT OUTPUT RULE - ABSOLUTE REQUIREMENT: You are an HTML generator. Your ENTIRE response must be ONLY raw HTML code. Start with <!DOCTYPE html> or <html>. Do NOT include ANY text before, after, or around the HTML. No markdown, no code blocks (```), no explanations, no "Here is the HTML", nothing. Just pure HTML that works when saved as .html. Include Tailwind CSS via CDN. Dark theme. Make it visually stunning.' },
          { role: 'user', content: uiPrompt }
        ],
        temperature: 0.1,
        max_tokens: 4000,
        stop: ['```', 'Explanation:', 'Here is', 'Here\'s', 'Sure,', 'Here\'s the']
      })
    });
    
    const data = await response.json();
    console.log('📡 OpenRouter raw response:', data.choices?.[0]?.message?.content?.substring(0, 500));
    rawHtml = data.choices?.[0]?.message?.content || uiPrompt;
  } else if (model === 'openai') {
    response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'STRICT OUTPUT RULE: Your ONLY output must be raw HTML code starting with <!DOCTYPE html> or <html>. NEVER output markdown, NEVER output explanations. Output ONLY valid HTML with inline CSS/JS that works immediately.' },
          { role: 'user', content: uiPrompt }
        ],
        temperature: 0.3
      })
    });
    
    const data = await response.json();
    rawHtml = data.choices?.[0]?.message?.content || uiPrompt;
  } else if (model === 'gemini') {
    response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: uiPrompt }] }]
      })
    });
    
    const data = await response.json();
    rawHtml = data.candidates?.[0]?.content?.parts?.[0]?.text || uiPrompt;
  } else if (model === 'claude') {
    response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-opus-20240229',
        messages: [
          { role: 'user', content: uiPrompt }
        ],
        max_tokens: 2000
      })
    });
    
    const data = await response.json();
    rawHtml = data.content?.[0]?.text || uiPrompt;
  } else {
    rawHtml = uiPrompt;
  }
  
  // Clean up markdown code blocks if present
  return cleanHtmlOutput(rawHtml);
};

// Clean HTML output - aggressively extract HTML from any AI response
const cleanHtmlOutput = (html: string): string => {
  console.log('🔍 Raw input to cleanHtmlOutput:', html.substring(0, 300));
  
  // First, check if it's already valid HTML - return as-is if it looks good
  if (html.trim().startsWith('<!DOCTYPE html') || html.trim().startsWith('<html')) {
    console.log('✅ HTML already valid, returning as-is');
    return html;
  }
  
  // Remove markdown code block wrappers
  let cleaned = html.replace(/^```html\n/, '').replace(/^```\n/, '');
  cleaned = cleaned.replace(/\n```$/, '');
  
  // If still wrapped in code block, try generic removal
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```[a-z]*\n?/, '');
    cleaned = cleaned.replace(/```$/, '');
  }
  
  // Also remove common text prefixes AI might add
  cleaned = cleaned.replace(/^(Here's|Here is|Sure,|Of course|Here you go|Here is the|Here\'s the|Here is a|As requested|Below is|I\'ve created|Created|Done|Generated).*?(\n|$)/i, '');
  
  // Find HTML content and extract it
  const htmlMatch = cleaned.match(/<html[\s\S]*<\/html>/i);
  if (htmlMatch) {
    console.log('✅ Extracted HTML with <html> tags');
    return htmlMatch[0];
  }
  
  const doctypeMatch = cleaned.match(/<!DOCTYPE html>[\s\S]*/i);
  if (doctypeMatch) {
    console.log('✅ Extracted HTML with DOCTYPE');
    return doctypeMatch[0];
  }
  
  // Last resort: look for any HTML-like content with body tags
  const bodyMatch = cleaned.match(/<body[\s\S]*<\/body>/i);
  if (bodyMatch) {
    console.log('⚠️ Extracted from <body> tags, wrapping in HTML');
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><script src="https://cdn.tailwindcss.com"><\/script></head>${bodyMatch[0]}</html>`;
  }
  
  // If nothing found, log warning and return cleaned
  console.log('⚠️ No HTML structure found, returning cleaned text');
  return cleaned;
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
