import { describe, it, expect, beforeEach } from 'vitest';
import {
  AI_PROVIDERS,
  FREE_MODELS,
  setApiKey,
  getApiKey,
  setKimiApiKey,
  getKimiApiKey,
  setFreeModel,
  getFreeModel,
  isApiKeyConfigured,
  getProviderStatus,
  cleanHtmlOutput,
} from './ai-providers';

describe('AI_PROVIDERS', () => {
  it('should contain all required providers', () => {
    expect(AI_PROVIDERS).toHaveProperty('openai');
    expect(AI_PROVIDERS).toHaveProperty('claude');
    expect(AI_PROVIDERS).toHaveProperty('gemini');
    expect(AI_PROVIDERS).toHaveProperty('openrouter');
    expect(AI_PROVIDERS).toHaveProperty('kimi');
    expect(AI_PROVIDERS).toHaveProperty('local');
  });

  it('should have name and icon for each provider', () => {
    Object.values(AI_PROVIDERS).forEach(provider => {
      expect(provider).toHaveProperty('name');
      expect(provider).toHaveProperty('icon');
      expect(typeof provider.name).toBe('string');
      expect(provider.name.length).toBeGreaterThan(0);
    });
  });

  it('should have correct provider names', () => {
    expect(AI_PROVIDERS.openai.name).toBe('OpenAI GPT-4');
    expect(AI_PROVIDERS.claude.name).toBe('Claude 3');
    expect(AI_PROVIDERS.gemini.name).toBe('Gemini Pro');
    expect(AI_PROVIDERS.openrouter.name).toBe('OpenRouter (Free)');
    expect(AI_PROVIDERS.kimi.name).toBe('Kimi K2.5');
    expect(AI_PROVIDERS.local.name).toBe('Local Model');
  });
});

describe('FREE_MODELS', () => {
  it('should be a non-empty array', () => {
    expect(Array.isArray(FREE_MODELS)).toBe(true);
    expect(FREE_MODELS.length).toBeGreaterThan(0);
  });

  it('should have required fields for each model', () => {
    FREE_MODELS.forEach(model => {
      expect(model).toHaveProperty('id');
      expect(model).toHaveProperty('name');
      expect(model).toHaveProperty('icon');
      expect(typeof model.id).toBe('string');
      expect(typeof model.name).toBe('string');
      expect(model.id.length).toBeGreaterThan(0);
    });
  });

  it('should contain DeepSeek V3 model', () => {
    const deepseek = FREE_MODELS.find(m => m.name === 'DeepSeek V3');
    expect(deepseek).toBeDefined();
  });

  it('should contain Kimi K2.5 model', () => {
    const kimi = FREE_MODELS.find(m => m.name === 'Kimi K2.5');
    expect(kimi).toBeDefined();
  });

  it('should have unique model IDs', () => {
    const ids = FREE_MODELS.map(m => m.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});

describe('API Key Management', () => {
  beforeEach(() => {
    // Reset keys before each test
    setApiKey('');
    setKimiApiKey('');
  });

  it('should set and get API key', () => {
    setApiKey('test-key-123');
    expect(getApiKey()).toBe('test-key-123');
  });

  it('should set and get Kimi API key', () => {
    setKimiApiKey('kimi-key-456');
    expect(getKimiApiKey()).toBe('kimi-key-456');
  });

  it('should return empty string when no key is set', () => {
    expect(getApiKey()).toBe('');
    expect(getKimiApiKey()).toBe('');
  });

  it('should overwrite previous key when set again', () => {
    setApiKey('first-key');
    setApiKey('second-key');
    expect(getApiKey()).toBe('second-key');
  });
});

describe('isApiKeyConfigured', () => {
  beforeEach(() => {
    setApiKey('');
    setKimiApiKey('');
  });

  it('should return false when no keys are set', () => {
    expect(isApiKeyConfigured()).toBe(false);
  });

  it('should return true when main API key is set', () => {
    setApiKey('some-key');
    expect(isApiKeyConfigured()).toBe(true);
  });

  it('should return true when Kimi API key is set', () => {
    setKimiApiKey('kimi-key');
    expect(isApiKeyConfigured()).toBe(true);
  });

  it('should return true when both keys are set', () => {
    setApiKey('main-key');
    setKimiApiKey('kimi-key');
    expect(isApiKeyConfigured()).toBe(true);
  });
});

describe('getProviderStatus', () => {
  beforeEach(() => {
    setApiKey('');
    setKimiApiKey('');
  });

  it('should return status for all providers', () => {
    const status = getProviderStatus();
    expect(status).toHaveProperty('openai');
    expect(status).toHaveProperty('claude');
    expect(status).toHaveProperty('gemini');
    expect(status).toHaveProperty('openrouter');
    expect(status).toHaveProperty('kimi');
    expect(status).toHaveProperty('local');
  });

  it('should show openrouter as always configured', () => {
    const status = getProviderStatus();
    expect(status.openrouter).toBe(true);
  });

  it('should show local as not configured', () => {
    const status = getProviderStatus();
    expect(status.local).toBe(false);
  });

  it('should show openai/claude/gemini as configured when API key is set', () => {
    setApiKey('test-key');
    const status = getProviderStatus();
    expect(status.openai).toBe(true);
    expect(status.claude).toBe(true);
    expect(status.gemini).toBe(true);
  });

  it('should show kimi as configured when Kimi API key is set', () => {
    setKimiApiKey('kimi-key');
    const status = getProviderStatus();
    expect(status.kimi).toBe(true);
  });
});

describe('Free Model Selection', () => {
  it('should get and set selected free model', () => {
    const model = FREE_MODELS[0].id;
    setFreeModel(model);
    expect(getFreeModel()).toBe(model);
  });

  it('should default to first free model', () => {
    expect(getFreeModel()).toBe(FREE_MODELS[0].id);
  });

  it('should allow switching to any available model', () => {
    const lastModel = FREE_MODELS[FREE_MODELS.length - 1].id;
    setFreeModel(lastModel);
    expect(getFreeModel()).toBe(lastModel);
  });
});

describe('cleanHtmlOutput', () => {
  it('should return HTML as-is when it starts with <!DOCTYPE', () => {
    const html = '<!DOCTYPE html><html><body>Hello</body></html>';
    expect(cleanHtmlOutput(html)).toBe(html);
  });

  it('should return HTML as-is when it starts with <html', () => {
    const html = '<html><body>Hello</body></html>';
    expect(cleanHtmlOutput(html)).toBe(html);
  });

  it('should return HTML as-is when it starts with <div', () => {
    const html = '<div class="test">Hello</div>';
    expect(cleanHtmlOutput(html)).toBe(html);
  });

  it('should extract HTML from markdown code blocks', () => {
    const wrapped = '```html\n<div>Hello</div>\n```';
    const result = cleanHtmlOutput(wrapped);
    expect(result).toBe('<div>Hello</div>');
  });

  it('should extract HTML from code blocks without language hint', () => {
    const wrapped = '```\n<div>Hello</div>\n```';
    const result = cleanHtmlOutput(wrapped);
    expect(result).toBe('<div>Hello</div>');
  });

  it('should throw error for empty string', () => {
    expect(() => cleanHtmlOutput('')).toThrow('Empty response from AI');
  });

  it('should throw error for whitespace only', () => {
    expect(() => cleanHtmlOutput('   ')).toThrow('Empty response from AI');
  });

  it('should find HTML starting from <!doctype even with leading text', () => {
    const input = 'Here is your HTML:\n<!DOCTYPE html><html><body>content</body></html>';
    const result = cleanHtmlOutput(input);
    expect(result).toContain('<!DOCTYPE html>');
    expect(result).toContain('content');
  });

  it('should find HTML starting from <html even with leading text', () => {
    const input = 'Sure! Here: <html><body>content</body></html>';
    const result = cleanHtmlOutput(input);
    expect(result).toContain('<html>');
  });

  it('should unescape HTML entities', () => {
    const input = '&lt;div&gt;Hello&lt;/div&gt;';
    const result = cleanHtmlOutput(input);
    expect(result).toContain('<div>Hello</div>');
  });

  it('should return partial HTML starting from first < tag', () => {
    const input = 'Some text <section>content</section>';
    const result = cleanHtmlOutput(input);
    expect(result).toContain('<section>content</section>');
  });
});
