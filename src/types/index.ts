export type ModelProvider = 'openai' | 'claude' | 'gemini' | 'openrouter' | 'local';

export interface PromptHistory {
  id: string;
  prompt: string;
  model: ModelProvider;
  timestamp: Date;
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
