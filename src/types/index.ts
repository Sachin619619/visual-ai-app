export type ModelProvider = 'openai' | 'claude' | 'gemini' | 'openrouter' | 'kimi' | 'minimax' | 'local';

// Theme options for preview
export type PreviewTheme = 'dark' | 'light';

// Viewport/device sizes for preview
export type ViewportSize = 'mobile' | 'tablet' | 'desktop' | 'wide' | 'custom';

export interface ViewportConfig {
  id: ViewportSize;
  name: string;
  width: number;
  height: number;
  icon: string;
}

// Style/frame options for generated UI
export type StyleFrame = 'card' | 'modal' | 'fullwidth' | 'floating' | 'glass';

export interface PromptHistory {
  id: string;
  prompt: string;
  model: ModelProvider;
  timestamp: Date;
  isFavorite?: boolean;
  styleFrame?: StyleFrame;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface GeneratedContent {
  html: string;
  timestamp: Date;
}

export interface PromptTemplate {
  id: string;
  name: string;
  prompt: string;
  category?: string;
  createdAt: Date;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    fill?: boolean;
  }[];
}

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  icon?: string;
}

export interface CardData {
  title: string;
  description?: string;
  imageUrl?: string;
  stats?: { label: string; value: string | number }[];
  tags?: string[];
}

export interface GenerationStats {
  time: number;
  model: string;
}
