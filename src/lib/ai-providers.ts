import { ModelProvider } from '../types';

// AI Provider configurations
export const AI_PROVIDERS: Record<ModelProvider, { name: string; icon: string }> = {
  openai: { name: 'OpenAI GPT-4', icon: '🤖' },
  claude: { name: 'Claude 3', icon: '🧠' },
  gemini: { name: 'Gemini Pro', icon: '✨' },
  openrouter: { name: 'OpenRouter (Free)', icon: '🔗' },
  local: { name: 'Local Model', icon: '💻' },
};

// Global API key storage
let apiKey = '';

export const setApiKey = (key: string) => {
  apiKey = key;
};

export const getApiKey = () => apiKey;

// Generate UI based on prompt
export const generateUI = async (
  prompt: string,
  model: ModelProvider
): Promise<string> => {
  // If API key is set, use real AI
  if (apiKey) {
    try {
      const result = await generateWithAI(prompt, model, apiKey);
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
        model: 'google/gemma-3-4b-it:free',
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
  apiKey: string
): Promise<string> => {
  // Enhance prompt for better UI generation
  const enhancedPrompt = await enhancePrompt(prompt, model, apiKey);
  
  const uiPrompt = `${enhancedPrompt}

IMPORTANT: You must output ONLY raw HTML code. No explanations, no markdown, no text.

Generate a complete, single-file HTML UI component with:
1. Inline CSS in <style> tags
2. Inline JavaScript in <script> tags
3. Dark theme with modern styling
4. Tailwind CSS via CDN
5. Make it visually stunning and interactive

Output ONLY the raw HTML code - nothing else.`;

  let response;
  
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
        model: 'google/gemma-3-4b-it:free',
        messages: [
          { role: 'system', content: 'You are an expert UI designer. Generate beautiful, modern HTML/CSS/JS UIs.' },
          { role: 'user', content: uiPrompt }
        ],
        temperature: 0.7
      })
    });
    
    const data = await response.json();
    return data.choices?.[0]?.message?.content || uiPrompt;
  }
  
  if (model === 'openai') {
    response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert UI designer. Generate beautiful, modern HTML/CSS/JS UIs.' },
          { role: 'user', content: uiPrompt }
        ],
        temperature: 0.7
      })
    });
    
    const data = await response.json();
    return data.choices?.[0]?.message?.content || uiPrompt;
  }
  
  if (model === 'gemini') {
    response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: uiPrompt }] }]
      })
    });
    
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || uiPrompt;
  }
  
  if (model === 'claude') {
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
    return data.content?.[0]?.text || uiPrompt;
  }
  
  return uiPrompt;
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
          model: 'google/gemma-3-4b-it:free',
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
