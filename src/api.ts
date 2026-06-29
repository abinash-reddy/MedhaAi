import { 
  Prompt, 
  PromptVersion, 
  ExecutionLog, 
  MemoryItem, 
  SystemSettings, 
  AnalyticsSummary, 
  AdminStats 
} from './types';

const API_BASE = 'http://localhost:5000/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });
  
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `HTTP error! status: ${response.status}`);
  }
  
  return response.json() as Promise<T>;
}

export const api = {
  // Prompts Library
  getPrompts: () => request<Prompt[]>('/prompts'),
  getPrompt: (id: string) => request<Prompt>(`/prompts/${id}`),
  savePrompt: (prompt: Partial<Prompt> & { name: string; content: string }) => 
    request<Prompt>('/prompts', {
      method: 'POST',
      body: JSON.stringify(prompt)
    }),
  deletePrompt: (id: string) => request<{ success: boolean }>(`/prompts/${id}`, {
    method: 'DELETE'
  }),
  duplicatePrompt: (id: string) => request<Prompt>(`/prompts/${id}/duplicate`, {
    method: 'POST'
  }),
  renamePrompt: (id: string, name: string) => request<Prompt>(`/prompts/${id}/rename`, {
    method: 'POST',
    body: JSON.stringify({ name })
  }),
  
  // Versions
  getVersions: (promptId: string) => request<PromptVersion[]>(`/prompts/${promptId}/versions`),

  // Playground Execution
  executePrompt: (data: { promptContent: string; systemPrompt?: string; customModel?: string; temperature?: number }) =>
    request<{ log: ExecutionLog; memoryRecall: MemoryItem | null; routedModel: string; complexity: string }>('/playground/execute', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Prompt Optimizer
  optimizePrompt: (prompt: string) => 
    request<{ 
      originalScore: number; 
      optimizedScore: number; 
      roleImprovement: string; 
      contextImprovement: string; 
      instructionImprovement: string; 
      formatImprovement: string; 
      optimizedPrompt: string; 
    }>('/prompt-optimizer/suggest', {
      method: 'POST',
      body: JSON.stringify({ prompt })
    }),

  // Comparison
  comparePrompts: (promptA: string, promptB: string) =>
    request<{
      promptA: { response: string; latencyMs: number; tokens: number; cost: number; qualityScore: number; model: string };
      promptB: { response: string; latencyMs: number; tokens: number; cost: number; qualityScore: number; model: string };
      winner: string;
      reasoning: string;
    }>('/prompt-compare/run', {
      method: 'POST',
      body: JSON.stringify({ promptA, promptB })
    }),

  // Logs
  getLogs: () => request<ExecutionLog[]>('/logs'),
  clearLogs: () => request<{ success: boolean }>('/logs/clear', {
    method: 'POST'
  }),

  // Memories
  getMemories: (query = '', category = '') => 
    request<MemoryItem[]>(`/memories?query=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}`),
  toggleFavoriteMemory: (id: string) => request<MemoryItem>(`/memories/${id}/favorite`, {
    method: 'POST'
  }),
  deleteMemory: (id: string) => request<{ success: boolean }>(`/memories/${id}`, {
    method: 'DELETE'
  }),

  // Analytics
  getAnalytics: () => request<AnalyticsSummary>('/analytics'),

  // Settings
  getSettings: () => request<SystemSettings>('/settings'),
  updateSettings: (settings: Partial<SystemSettings>) => request<SystemSettings>('/settings', {
    method: 'POST',
    body: JSON.stringify(settings)
  }),

  // Admin
  getAdminStats: () => request<AdminStats>('/admin/stats'),
};
