// Tool definitions and execution for AI tool calling
import { getBraveSearchKey } from './ai-providers';

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, any>;
}

export interface ToolResult {
  id: string;
  name: string;
  content: string;
}

// OpenAI-compatible tool definitions (also used by OpenRouter, Kimi)
export const OPENAI_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'web_search',
      description:
        "Search the web for current, real-time information. Use this when the prompt mentions: today's data, current events, live prices, recent news, sports scores, weather, stock prices, trending topics, or anything that changes over time.",
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Specific, concise search query — as you would type into Google',
          },
        },
        required: ['query'],
      },
    },
  },
];

// Claude-format tool definitions
export const CLAUDE_TOOLS = [
  {
    name: 'web_search',
    description:
      "Search the web for current, real-time information. Use this when the prompt mentions: today's data, current events, live prices, recent news, sports scores, weather, stock prices, trending topics, or anything that changes over time.",
    input_schema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Specific, concise search query — as you would type into Google',
        },
      },
      required: ['query'],
    },
  },
];

/**
 * Returns true if the prompt likely needs real-time web data AND a search key is configured.
 */
export function needsSearch(prompt: string): boolean {
  if (!getBraveSearchKey()) return false; // no key = skip tool calling
  return /\b(today|tonight|current(ly)?|latest|live|real[\s-]?time|right now|this (week|month|year)|recent(ly)?|news|score|price|weather|forecast|stock|crypto|bitcoin|trending|top \d|2025|2026|who (won|is winning)|just (happened|released)|update|breaking)\b/i.test(prompt);
}

/**
 * Execute a tool call against our backend proxy.
 */
export async function executeTool(
  call: ToolCall,
  signal?: AbortSignal
): Promise<ToolResult> {
  if (call.name === 'web_search') {
    const query = call.arguments.query as string;
    const userKey = getBraveSearchKey();
    try {
      const keyParam = userKey ? `&key=${encodeURIComponent(userKey)}` : '';
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}${keyParam}`, { signal });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        return { id: call.id, name: call.name, content: `Search failed: ${(err as any).error || res.statusText}` };
      }
      const data = await res.json() as { results: SearchResult[] };
      const results = data.results ?? [];
      if (results.length === 0) {
        return { id: call.id, name: call.name, content: 'No results found for this query.' };
      }
      const formatted = results
        .map((r, i) => `[${i + 1}] ${r.title}\n${r.snippet}\nURL: ${r.url}`)
        .join('\n\n');
      return { id: call.id, name: call.name, content: formatted };
    } catch (err: any) {
      return { id: call.id, name: call.name, content: `Search error: ${err.message}` };
    }
  }
  return { id: call.id, name: call.name, content: 'Unknown tool.' };
}
