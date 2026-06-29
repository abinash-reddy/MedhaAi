export interface Prompt {
  id: string;
  name: string;
  content: string;
  category: string;
  version: number;
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PromptVersion {
  id: string;
  promptId: string;
  version: number;
  content: string;
  qualityScore: number;
  latencyMs: number;
  costEstimate: number;
  description: string;
  createdAt: string;
}

export interface ExecutionLog {
  id: string;
  promptId?: string;
  promptName?: string;
  promptContent: string;
  response: string;
  model: string;
  latencyMs: number;
  tokensPrompt: number;
  tokensCompletion: number;
  tokensTotal: number;
  cost: number;
  complexity: 'simple' | 'medium' | 'complex';
  routingReason: string;
  confidenceScore: number;
  status: 'success' | 'failed';
  retryCount: number;
  fallbackUsed: boolean;
  timestamp: string;
}

export interface MemoryItem {
  id: string;
  prompt: string;
  response: string;
  similarityScore: number;
  category: string;
  tags: string[];
  importance: number; // 1-10
  qualityScore: number; // 1-100
  reuseCount: number;
  isFavorite: boolean;
  timestamp: string;
}

export interface SystemSettings {
  theme: 'dark' | 'light' | 'system';
  language: string;
  monthlyBudget: number;
  defaultTemperature: number;
  defaultModel: string;
  routingMode: 'cost-optimized' | 'speed-optimized' | 'balanced';
  similarityThreshold: number;
  enableMemory: boolean;
  enableCascadeFlow: boolean;
  apiKey: string;
}

export interface AnalyticsTrend {
  date: string;
  runs: number;
  cost: number;
  latency: number;
  quality: number;
}

export interface AnalyticsSummary {
  totalRuns: number;
  successfulRuns: number;
  avgLatency: number;
  avgCost: number;
  totalCost: number;
  savedCost: number;
  averageQuality: number;
  modelDistribution: { name: string; value: number }[];
  categoryDistribution: { name: string; value: number }[];
  memoryRecallRate: number;
  trends: AnalyticsTrend[];
}

export interface AdminStats {
  totalUsers: number;
  activeSessions: number;
  dbSizeKb: number;
  promptsCount: number;
  versionsCount: number;
  logsCount: number;
  memoriesCount: number;
  supabaseStatus: string;
  apiCallsToday: number;
}
