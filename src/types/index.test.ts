import { describe, it, expect } from 'vitest';
import type {
  ModelProvider,
  PreviewTheme,
  ViewportSize,
  ViewportConfig,
  StyleFrame,
  PromptHistory,
  ChatMessage,
  GeneratedContent,
  PromptTemplate,
  ChartData,
  TimelineEvent,
  CardData,
  GenerationStats,
} from './index';

// Type validation tests - these serve as compile-time checks
// as well as runtime validation of data shapes

describe('ModelProvider type validation', () => {
  it('should accept valid model providers', () => {
    const validProviders: ModelProvider[] = ['openai', 'claude', 'gemini', 'openrouter', 'kimi', 'local'];
    expect(validProviders.length).toBe(6);
    validProviders.forEach(p => {
      expect(typeof p).toBe('string');
    });
  });
});

describe('PreviewTheme type validation', () => {
  it('should accept dark and light themes', () => {
    const dark: PreviewTheme = 'dark';
    const light: PreviewTheme = 'light';
    expect(dark).toBe('dark');
    expect(light).toBe('light');
  });
});

describe('ViewportSize type validation', () => {
  it('should accept all viewport sizes', () => {
    const sizes: ViewportSize[] = ['mobile', 'tablet', 'desktop', 'wide', 'custom'];
    expect(sizes.length).toBe(5);
  });
});

describe('ViewportConfig interface', () => {
  it('should create a valid viewport config object', () => {
    const config: ViewportConfig = {
      id: 'desktop',
      name: 'Desktop',
      width: 1440,
      height: 900,
      icon: '🖥️',
    };
    expect(config.id).toBe('desktop');
    expect(config.name).toBe('Desktop');
    expect(config.width).toBe(1440);
    expect(config.height).toBe(900);
    expect(typeof config.icon).toBe('string');
  });

  it('should create a mobile viewport config', () => {
    const config: ViewportConfig = {
      id: 'mobile',
      name: 'Mobile',
      width: 375,
      height: 812,
      icon: '📱',
    };
    expect(config.width).toBe(375);
  });
});

describe('StyleFrame type validation', () => {
  it('should accept all style frames', () => {
    const frames: StyleFrame[] = ['card', 'modal', 'fullwidth', 'floating', 'glass'];
    expect(frames.length).toBe(5);
  });
});

describe('PromptHistory interface', () => {
  it('should create a valid prompt history entry', () => {
    const entry: PromptHistory = {
      id: '123',
      prompt: 'Create a dashboard',
      model: 'openai',
      timestamp: new Date('2026-03-15'),
    };
    expect(entry.id).toBe('123');
    expect(entry.prompt).toBe('Create a dashboard');
    expect(entry.model).toBe('openai');
    expect(entry.timestamp instanceof Date).toBe(true);
  });

  it('should support optional isFavorite field', () => {
    const entry: PromptHistory = {
      id: '456',
      prompt: 'Test',
      model: 'claude',
      timestamp: new Date(),
      isFavorite: true,
    };
    expect(entry.isFavorite).toBe(true);
  });

  it('should support optional styleFrame field', () => {
    const entry: PromptHistory = {
      id: '789',
      prompt: 'Test',
      model: 'gemini',
      timestamp: new Date(),
      styleFrame: 'card',
    };
    expect(entry.styleFrame).toBe('card');
  });
});

describe('ChatMessage interface', () => {
  it('should create a valid user message', () => {
    const msg: ChatMessage = {
      id: 'msg-1',
      role: 'user',
      content: 'Hello!',
      timestamp: new Date(),
    };
    expect(msg.role).toBe('user');
    expect(msg.content).toBe('Hello!');
  });

  it('should create a valid assistant message', () => {
    const msg: ChatMessage = {
      id: 'msg-2',
      role: 'assistant',
      content: 'How can I help?',
      timestamp: new Date(),
    };
    expect(msg.role).toBe('assistant');
  });
});

describe('GeneratedContent interface', () => {
  it('should create a valid generated content entry', () => {
    const content: GeneratedContent = {
      html: '<div>Hello</div>',
      timestamp: new Date(),
    };
    expect(content.html).toBe('<div>Hello</div>');
    expect(content.timestamp instanceof Date).toBe(true);
  });
});

describe('PromptTemplate interface', () => {
  it('should create a valid prompt template', () => {
    const template: PromptTemplate = {
      id: 'tmpl-1',
      name: 'Dashboard Template',
      prompt: 'Create an analytics dashboard',
      createdAt: new Date(),
    };
    expect(template.id).toBe('tmpl-1');
    expect(template.name).toBe('Dashboard Template');
  });

  it('should support optional category field', () => {
    const template: PromptTemplate = {
      id: 'tmpl-2',
      name: 'Card',
      prompt: 'Create a card',
      category: 'UI Components',
      createdAt: new Date(),
    };
    expect(template.category).toBe('UI Components');
  });
});

describe('ChartData interface', () => {
  it('should create valid chart data', () => {
    const data: ChartData = {
      labels: ['Jan', 'Feb', 'Mar'],
      datasets: [
        {
          label: 'Sales',
          data: [100, 200, 150],
          backgroundColor: '#8b5cf6',
          borderColor: '#7c3aed',
          fill: false,
        },
      ],
    };
    expect(data.labels.length).toBe(3);
    expect(data.datasets[0].label).toBe('Sales');
  });

  it('should support array backgroundColor', () => {
    const data: ChartData = {
      labels: ['A', 'B'],
      datasets: [
        {
          label: 'Test',
          data: [1, 2],
          backgroundColor: ['#ff0000', '#00ff00'],
        },
      ],
    };
    expect(Array.isArray(data.datasets[0].backgroundColor)).toBe(true);
  });
});

describe('TimelineEvent interface', () => {
  it('should create a valid timeline event', () => {
    const event: TimelineEvent = {
      id: 'event-1',
      title: 'Product Launch',
      description: 'We launched our product',
      date: '2026-01-01',
    };
    expect(event.title).toBe('Product Launch');
    expect(event.date).toBe('2026-01-01');
  });

  it('should support optional icon field', () => {
    const event: TimelineEvent = {
      id: 'event-2',
      title: 'Milestone',
      description: 'Big milestone',
      date: '2026-02-01',
      icon: '🚀',
    };
    expect(event.icon).toBe('🚀');
  });
});

describe('CardData interface', () => {
  it('should create a minimal card', () => {
    const card: CardData = {
      title: 'My Card',
    };
    expect(card.title).toBe('My Card');
  });

  it('should support all optional fields', () => {
    const card: CardData = {
      title: 'Full Card',
      description: 'A full card',
      imageUrl: 'https://example.com/image.png',
      stats: [{ label: 'Views', value: 1000 }],
      tags: ['design', 'ui'],
    };
    expect(card.stats?.length).toBe(1);
    expect(card.tags?.length).toBe(2);
  });
});

describe('GenerationStats interface', () => {
  it('should create valid generation stats', () => {
    const stats: GenerationStats = {
      time: 2500,
      model: 'openai',
    };
    expect(stats.time).toBe(2500);
    expect(stats.model).toBe('openai');
  });
});
