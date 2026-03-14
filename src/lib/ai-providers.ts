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
          { role: 'system', content: 'CRITICAL: Output ONLY raw HTML. Start your response with <!DOCTYPE html> or <html>. NO text before, NO text after, NO markdown, NO code blocks, NO explanations, NO "Here is", NOTHING except HTML. Your response will be used directly as a web page. If you include any non-HTML text, it will break. Render ONLY HTML.' },
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
          { role: 'system', content: 'CRITICAL: Output ONLY raw HTML. Start your response with <!DOCTYPE html> or <html>. NO text before, NO text after, NO markdown, NO code blocks, NO explanations. Your response will be used directly as a web page. Render ONLY HTML.' },
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

// Clean HTML output - AGGRESSIVELY extract ONLY HTML content
export const cleanHtmlOutput = (html: string): string => {
  console.log('🔍 Raw input to cleanHtmlOutput:', html.substring(0, 500));
  
  // Step 1: First, unescape any HTML entities that might have been double-escaped
  let cleaned = html
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
  
  // Also handle escaped backslashes
  cleaned = cleaned.replace(/\\</g, '<').replace(/\\>/g, '>');
  
  // Step 2: Strip markdown code blocks completely
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```[a-z]*\n?/, '');
    cleaned = cleaned.replace(/```$/, '');
  }
  
  // Step 3: AGGRESSIVE - ONLY accept content that STARTS with HTML tags
  // Trim and check what we're dealing with
  const trimmed = cleaned.trim();
  
  // If it starts with DOCTYPE, html, or body - accept it
  if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html') || trimmed.startsWith('<body')) {
    console.log('✅ HTML starts correctly with DOCTYPE/html/body');
    return trimmed;
  }
  
  // Step 4: Try to find and extract HTML starting from <html or <!DOCTYPE
  const htmlStartMatch = trimmed.match(/<!DOCTYPE<html[\s\S]*/i) || trimmed.match(/<html[\s\S]*/i);
  if (htmlStartMatch) {
    console.log('✅ Found HTML starting point, extracting');
    return htmlStartMatch[0];
  }
  
  // Step 5: If there's no valid HTML starting point, REJECT the entire response
  // This is the aggressive fix - don't try to salvage broken responses
  console.log('❌ REJECTED - Response does not start with valid HTML');
  throw new Error('Invalid AI response: Output does not start with HTML. Please try again.');
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
