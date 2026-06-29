import fs from 'fs';
import path from 'path';

// Interfaces matching frontend types
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
  similarityThreshold: number; // 0.0 - 1.0
  enableMemory: boolean;
  enableCascadeFlow: boolean;
  apiKey: string;
}

export interface DatabaseStore {
  prompts: Prompt[];
  versions: PromptVersion[];
  logs: ExecutionLog[];
  memories: MemoryItem[];
  settings: SystemSettings;
}

const STORE_PATH = path.join(__dirname, '../medha_store.json');

const defaultSettings: SystemSettings = {
  theme: 'dark',
  language: 'en',
  monthlyBudget: 250.00,
  defaultTemperature: 0.7,
  defaultModel: 'llama-3.3-70b-versatile',
  routingMode: 'balanced',
  similarityThreshold: 0.78,
  enableMemory: true,
  enableCascadeFlow: true,
  apiKey: ''
};

// Seed initial data
const initialData: DatabaseStore = {
  prompts: [
    {
      id: 'p1',
      name: 'SQL performance optimizer',
      content: 'Analyze and optimize the following SQL query for PostgreSQL: SELECT u.id, u.name, count(o.id) FROM users u LEFT JOIN orders o ON u.id = o.user_id WHERE u.created_at > \'2023-01-01\' GROUP BY u.id HAVING count(o.id) > 5 ORDER BY count(o.id) DESC;',
      category: 'Coding',
      version: 3,
      tags: ['postgres', 'sql', 'database'],
      isFavorite: true,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'p2',
      name: 'LinkedIn Post AI trends',
      content: 'Write a compelling, professional LinkedIn post discussing the rise of Prompt Operations (PromptOps) in enterprise AI. Keep it under 200 words, use bullet points, and include 3 relevant hashtags.',
      category: 'Writing',
      version: 1,
      tags: ['marketing', 'linkedin', 'professional'],
      isFavorite: false,
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'p3',
      name: 'Vite React Tailwind Login Page',
      content: 'Create a fully responsive React login component using Vite and Tailwind CSS. The design should be modern glassmorphism with a dark background, input validations, loading states, and error alerts.',
      category: 'Coding',
      version: 2,
      tags: ['react', 'tailwind', 'ui-design'],
      isFavorite: true,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'p4',
      name: 'Quantum computing elevator pitch',
      content: 'Explain quantum computing to a high schooler using the analogy of a spinning coin. Keep it engaging, educational, and under 150 words.',
      category: 'Education',
      version: 1,
      tags: ['science', 'explainers', 'quantum'],
      isFavorite: false,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    }
  ],
  versions: [
    {
      id: 'v1-p1',
      promptId: 'p1',
      version: 1,
      content: 'Optimize this SQL: SELECT u.id, u.name, count(o.id) FROM users u LEFT JOIN orders o ON u.id = o.user_id GROUP BY u.id;',
      qualityScore: 68,
      latencyMs: 1200,
      costEstimate: 0.0003,
      description: 'Initial basic query definition',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'v2-p1',
      promptId: 'p1',
      version: 2,
      content: 'Optimize the SQL query for PostgreSQL database performance. Check indexes, join logic, and group-by aggregations:\nSELECT u.id, u.name, count(o.id) FROM users u LEFT JOIN orders o ON u.id = o.user_id WHERE u.created_at > \'2023-01-01\' GROUP BY u.id;',
      qualityScore: 84,
      latencyMs: 1800,
      costEstimate: 0.0009,
      description: 'Added index checking instructions and date filter',
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'v3-p1',
      promptId: 'p1',
      version: 3,
      content: 'Analyze and optimize the following SQL query for PostgreSQL: SELECT u.id, u.name, count(o.id) FROM users u LEFT JOIN orders o ON u.id = o.user_id WHERE u.created_at > \'2023-01-01\' GROUP BY u.id HAVING count(o.id) > 5 ORDER BY count(o.id) DESC;',
      qualityScore: 95,
      latencyMs: 2100,
      costEstimate: 0.0012,
      description: 'Refined targeting PostgreSQL constraints, having clause, and sorting order',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'v1-p3',
      promptId: 'p3',
      version: 1,
      content: 'Write a login page in React and tailwind.',
      qualityScore: 70,
      latencyMs: 900,
      costEstimate: 0.00025,
      description: 'Basic request',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'v2-p3',
      promptId: 'p3',
      version: 2,
      content: 'Create a fully responsive React login component using Vite and Tailwind CSS. The design should be modern glassmorphism with a dark background, input validations, loading states, and error alerts.',
      qualityScore: 92,
      latencyMs: 1950,
      costEstimate: 0.0011,
      description: 'Added layout guidelines, glassmorphism instruction, and error state criteria',
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    }
  ],
  logs: [
    {
      id: 'log1',
      promptId: 'p1',
      promptName: 'SQL performance optimizer',
      promptContent: 'Analyze and optimize the following SQL query for PostgreSQL: SELECT u.id, u.name, count(o.id)...',
      response: 'To optimize the query, you should create an index on `orders(user_id)` and `users(created_at)`. Here is the optimized query: ...',
      model: 'llama-3.3-70b-versatile',
      latencyMs: 1420,
      tokensPrompt: 85,
      tokensCompletion: 240,
      tokensTotal: 325,
      cost: 0.00095,
      complexity: 'complex',
      routingReason: 'Complexity: High. Prompt asks for detailed SQL syntax optimizer and performance suggestions.',
      confidenceScore: 0.94,
      status: 'success',
      retryCount: 0,
      fallbackUsed: false,
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
    {
      id: 'log2',
      promptId: 'p2',
      promptName: 'LinkedIn Post AI trends',
      promptContent: 'Write a compelling, professional LinkedIn post discussing the rise of Prompt Operations (PromptOps) in enterprise AI...',
      response: '🚀 The rise of PromptOps: Why Prompt Operations is becoming the backbone of Enterprise AI systems. #PromptOps #AI #EnterpriseAI',
      model: 'mixtral-8x7b-32768',
      latencyMs: 780,
      tokensPrompt: 55,
      tokensCompletion: 120,
      tokensTotal: 175,
      cost: 0.00032,
      complexity: 'medium',
      routingReason: 'Complexity: Medium. Request is for writing a short professional text with general guidelines.',
      confidenceScore: 0.88,
      status: 'success',
      retryCount: 0,
      fallbackUsed: false,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'log3',
      promptName: 'General Query',
      promptContent: 'What is the capital of France?',
      response: 'The capital of France is Paris.',
      model: 'llama-3-8b-8192',
      latencyMs: 250,
      tokensPrompt: 12,
      tokensCompletion: 8,
      tokensTotal: 20,
      cost: 0.00002,
      complexity: 'simple',
      routingReason: 'Complexity: Low. Basic factual question.',
      confidenceScore: 0.99,
      status: 'success',
      retryCount: 0,
      fallbackUsed: false,
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'log4',
      promptId: 'p3',
      promptName: 'Vite React Tailwind Login Page',
      promptContent: 'Create a fully responsive React login component using Vite and Tailwind CSS...',
      response: 'Failed to connect to primary API stream. Retrying...',
      model: 'llama-3.3-70b-versatile',
      latencyMs: 2850,
      tokensPrompt: 90,
      tokensCompletion: 420,
      tokensTotal: 510,
      cost: 0.00142,
      complexity: 'complex',
      routingReason: 'Complexity: High. Prompt contains detailed multi-file component design request.',
      confidenceScore: 0.91,
      status: 'success',
      retryCount: 1,
      fallbackUsed: true,
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    }
  ],
  memories: [
    {
      id: 'mem1',
      prompt: 'Optimize PostgreSQL query sorting and limit parameters',
      response: 'To optimize ORDER BY combined with LIMIT, create a compound index including both sorting fields and filter fields. This allows index scans to fetch ordered rows directly without a filesort.',
      similarityScore: 0.89,
      category: 'Coding',
      tags: ['postgres', 'sql', 'index'],
      importance: 8,
      qualityScore: 94,
      reuseCount: 14,
      isFavorite: true,
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'mem2',
      prompt: 'LinkedIn copy for tech newsletters and product launches',
      response: 'Subject: We just built something amazing. Today, we are unveiling Medha AI, a developer platform for tracking, evaluating, and securing prompt pipelines.',
      similarityScore: 0.81,
      category: 'Writing',
      tags: ['marketing', 'newsletter', 'product-launch'],
      importance: 6,
      qualityScore: 82,
      reuseCount: 8,
      isFavorite: false,
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'mem3',
      prompt: 'React context provider pattern for application state',
      response: 'Use the `createContext` and `useContext` hooks, export a custom hook like `useAppState`, and wrap components with the provider. Always memoize values to avoid unnecessary re-renders.',
      similarityScore: 0.92,
      category: 'Coding',
      tags: ['react', 'context', 'state'],
      importance: 9,
      qualityScore: 96,
      reuseCount: 22,
      isFavorite: true,
      timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'mem4',
      prompt: 'Summarize deep learning transformer architectures simply',
      response: 'Transformers process sequence data in parallel using an Attention mechanism, mapping dependencies between words regardless of distance. Key components are Self-Attention and Feed-Forward networks.',
      similarityScore: 0.75,
      category: 'Research',
      tags: ['deep-learning', 'transformers', 'ai'],
      importance: 7,
      qualityScore: 88,
      reuseCount: 5,
      isFavorite: false,
      timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    }
  ],
  settings: defaultSettings
};

// Initialize DB file if not exists
export function initDb() {
  const dir = path.dirname(STORE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(STORE_PATH)) {
    fs.writeFileSync(STORE_PATH, JSON.stringify(initialData, null, 2), 'utf-8');
  }
}

function readStore(): DatabaseStore {
  initDb();
  try {
    const raw = fs.readFileSync(STORE_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    return initialData;
  }
}

function writeStore(data: DatabaseStore) {
  initDb();
  fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// Prompt Operations
export const db = {
  getPrompts: (): Prompt[] => {
    const store = readStore();
    return store.prompts;
  },

  getPromptById: (id: string): Prompt | undefined => {
    const store = readStore();
    return store.prompts.find(p => p.id === id);
  },

  savePrompt: (promptData: Partial<Prompt> & { name: string; content: string }): Prompt => {
    const store = readStore();
    let prompt: Prompt;

    if (promptData.id) {
      const idx = store.prompts.findIndex(p => p.id === promptData.id);
      if (idx !== -1) {
        // Increment version if content changed
        const contentChanged = store.prompts[idx].content !== promptData.content;
        const newVersion = contentChanged ? store.prompts[idx].version + 1 : store.prompts[idx].version;
        
        prompt = {
          ...store.prompts[idx],
          ...promptData,
          version: newVersion,
          updatedAt: new Date().toISOString()
        } as Prompt;

        store.prompts[idx] = prompt;

        // If content changed, save a new version entry
        if (contentChanged) {
          const newVerEntry: PromptVersion = {
            id: `v${newVersion}-${prompt.id}`,
            promptId: prompt.id,
            version: newVersion,
            content: prompt.content,
            qualityScore: Math.floor(Math.random() * 20) + 75, // Simulate validation score
            latencyMs: Math.floor(Math.random() * 1500) + 600,
            costEstimate: (prompt.content.length * 0.00001),
            description: `Auto-saved update to Version ${newVersion}`,
            createdAt: new Date().toISOString()
          };
          store.versions.push(newVerEntry);
        }
      } else {
        throw new Error('Prompt not found');
      }
    } else {
      // Create new prompt
      const id = 'p' + (store.prompts.length + 1) + '-' + Math.random().toString(36).substr(2, 4);
      prompt = {
        id,
        name: promptData.name,
        content: promptData.content,
        category: promptData.category || 'General',
        version: 1,
        tags: promptData.tags || [],
        isFavorite: promptData.isFavorite || false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      store.prompts.push(prompt);

      // Save version 1 entry
      const firstVer: PromptVersion = {
        id: `v1-${id}`,
        promptId: id,
        version: 1,
        content: prompt.content,
        qualityScore: Math.floor(Math.random() * 15) + 70,
        latencyMs: Math.floor(Math.random() * 1000) + 500,
        costEstimate: (prompt.content.length * 0.00001),
        description: 'Initial creation',
        createdAt: new Date().toISOString()
      };
      store.versions.push(firstVer);
    }

    writeStore(store);
    return prompt;
  },

  deletePrompt: (id: string): boolean => {
    const store = readStore();
    const lenBefore = store.prompts.length;
    store.prompts = store.prompts.filter(p => p.id !== id);
    store.versions = store.versions.filter(v => v.promptId !== id);
    store.logs = store.logs.filter(l => l.promptId !== id);
    writeStore(store);
    return store.prompts.length < lenBefore;
  },

  duplicatePrompt: (id: string): Prompt => {
    const store = readStore();
    const source = store.prompts.find(p => p.id === id);
    if (!source) throw new Error('Source prompt not found');

    const newId = 'p' + (store.prompts.length + 1) + '-' + Math.random().toString(36).substr(2, 4);
    const copy: Prompt = {
      ...source,
      id: newId,
      name: `${source.name} (Copy)`,
      isFavorite: false,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    store.prompts.push(copy);

    const firstVer: PromptVersion = {
      id: `v1-${newId}`,
      promptId: newId,
      version: 1,
      content: copy.content,
      qualityScore: Math.floor(Math.random() * 15) + 70,
      latencyMs: Math.floor(Math.random() * 1000) + 500,
      costEstimate: (copy.content.length * 0.00001),
      description: 'Duplicated creation',
      createdAt: new Date().toISOString()
    };
    store.versions.push(firstVer);

    writeStore(store);
    return copy;
  },

  renamePrompt: (id: string, name: string): Prompt => {
    const store = readStore();
    const idx = store.prompts.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Prompt not found');

    store.prompts[idx].name = name;
    store.prompts[idx].updatedAt = new Date().toISOString();
    writeStore(store);
    return store.prompts[idx];
  },

  // Version Control
  getVersions: (promptId: string): PromptVersion[] => {
    const store = readStore();
    return store.versions.filter(v => v.promptId === promptId).sort((a, b) => b.version - a.version);
  },

  // Logs
  getLogs: (): ExecutionLog[] => {
    const store = readStore();
    return store.logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  addLog: (logData: Omit<ExecutionLog, 'id' | 'timestamp'>): ExecutionLog => {
    const store = readStore();
    const log: ExecutionLog = {
      ...logData,
      id: 'log' + (store.logs.length + 1) + '-' + Math.random().toString(36).substr(2, 4),
      timestamp: new Date().toISOString()
    };
    store.logs.push(log);
    writeStore(store);
    return log;
  },

  clearLogs: (): void => {
    const store = readStore();
    store.logs = [];
    writeStore(store);
  },

  // Memories
  getMemories: (): MemoryItem[] => {
    const store = readStore();
    return store.memories.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  searchMemories: (query: string, category?: string): MemoryItem[] => {
    const store = readStore();
    let items = store.memories;

    if (category && category !== 'All') {
      items = items.filter(m => m.category.toLowerCase() === category.toLowerCase());
    }

    if (query.trim()) {
      const q = query.toLowerCase().trim();
      items = items.filter(m => 
        m.prompt.toLowerCase().includes(q) || 
        m.response.toLowerCase().includes(q) ||
        m.tags.some(t => t.toLowerCase().includes(q))
      );

      // Perform a simulated semantic search boost (simulating embedding cosine distance)
      items = items.map(m => {
        let sim = m.similarityScore;
        if (m.prompt.toLowerCase().includes(q)) sim = Math.min(0.98, sim + 0.15);
        return { ...m, similarityScore: Number(sim.toFixed(2)) };
      });
      items.sort((a, b) => b.similarityScore - a.similarityScore);
    }
    return items;
  },

  addMemoryItem: (itemData: Omit<MemoryItem, 'id' | 'timestamp' | 'reuseCount' | 'isFavorite'>): MemoryItem => {
    const store = readStore();
    const item: MemoryItem = {
      ...itemData,
      id: 'mem' + (store.memories.length + 1) + '-' + Math.random().toString(36).substr(2, 4),
      reuseCount: 0,
      isFavorite: false,
      timestamp: new Date().toISOString()
    };
    store.memories.push(item);
    writeStore(store);
    return item;
  },

  toggleFavoriteMemory: (id: string): MemoryItem => {
    const store = readStore();
    const idx = store.memories.findIndex(m => m.id === id);
    if (idx === -1) throw new Error('Memory item not found');

    store.memories[idx].isFavorite = !store.memories[idx].isFavorite;
    writeStore(store);
    return store.memories[idx];
  },

  deleteMemory: (id: string): boolean => {
    const store = readStore();
    const lenBefore = store.memories.length;
    store.memories = store.memories.filter(m => m.id !== id);
    writeStore(store);
    return store.memories.length < lenBefore;
  },

  incrementMemoryReuse: (id: string): void => {
    const store = readStore();
    const idx = store.memories.findIndex(m => m.id === id);
    if (idx !== -1) {
      store.memories[idx].reuseCount += 1;
      writeStore(store);
    }
  },

  // Settings
  getSettings: (): SystemSettings => {
    const store = readStore();
    return store.settings || defaultSettings;
  },

  updateSettings: (newSettings: Partial<SystemSettings>): SystemSettings => {
    const store = readStore();
    store.settings = {
      ...store.settings,
      ...newSettings
    };
    writeStore(store);
    return store.settings;
  },

  // Analytics Aggregation
  getAnalyticsSummary: () => {
    const store = readStore();
    const logs = store.logs;
    const memories = store.memories;

    const totalRuns = logs.length;
    const successfulRuns = logs.filter(l => l.status === 'success').length;
    const avgLatency = totalRuns > 0 
      ? Math.round(logs.reduce((acc, l) => acc + l.latencyMs, 0) / totalRuns) 
      : 0;
    
    const totalCost = logs.reduce((acc, l) => acc + l.cost, 0);
    const avgCost = totalRuns > 0 ? totalCost / totalRuns : 0;

    // Simulate "Cost Savings" by using CascadeFlow vs routing all requests to expensive GPT-4-like models
    // Let's assume a complex model costs 0.005 per execution and CascadeFlow saved the delta
    const savedCost = logs.reduce((acc, l) => {
      const complexModelCost = 0.0045; // Cost if routed to complex model always
      return acc + Math.max(0, complexModelCost - l.cost);
    }, 0);

    const averageQuality = totalRuns > 0 
      ? Math.round(logs.reduce((acc, l) => acc + (l.status === 'success' ? l.confidenceScore * 100 : 0), 0) / totalRuns)
      : 85;

    // Model distribution
    const modelDistribution: { [key: string]: number } = {};
    logs.forEach(l => {
      modelDistribution[l.model] = (modelDistribution[l.model] || 0) + 1;
    });

    const formattedModelDist = Object.keys(modelDistribution).map(name => ({
      name,
      value: modelDistribution[name]
    }));

    // Category distribution from prompts
    const catDistribution: { [key: string]: number } = {};
    store.prompts.forEach(p => {
      catDistribution[p.category] = (catDistribution[p.category] || 0) + 1;
    });
    const formattedCatDist = Object.keys(catDistribution).map(name => ({
      name,
      value: catDistribution[name]
    }));

    // Memory recall rate
    const reusedMemories = memories.filter(m => m.reuseCount > 0).length;
    const recallRate = memories.length > 0 ? Math.round((reusedMemories / memories.length) * 100) : 65;

    // Generate recent 7 days trends
    const trends = Array.from({ length: 7 }).map((_, idx) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - idx));
      const dayStr = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayLogs = logs.filter(l => new Date(l.timestamp).toDateString() === d.toDateString());
      
      return {
        date: dayStr,
        runs: dayLogs.length,
        cost: Number(dayLogs.reduce((acc, l) => acc + l.cost, 0).toFixed(5)),
        latency: dayLogs.length > 0 ? Math.round(dayLogs.reduce((acc, l) => acc + l.latencyMs, 0) / dayLogs.length) : 0,
        quality: dayLogs.length > 0 ? Math.round(dayLogs.reduce((acc, l) => acc + (l.confidenceScore * 100), 0) / dayLogs.length) : 85
      };
    });

    return {
      totalRuns,
      successfulRuns,
      avgLatency,
      avgCost: Number(avgCost.toFixed(5)),
      totalCost: Number(totalCost.toFixed(4)),
      savedCost: Number(savedCost.toFixed(4)),
      averageQuality,
      modelDistribution: formattedModelDist,
      categoryDistribution: formattedCatDist,
      memoryRecallRate: recallRate,
      trends
    };
  },

  getAdminStats: () => {
    const store = readStore();
    const sizeInBytes = fs.existsSync(STORE_PATH) ? fs.statSync(STORE_PATH).size : 0;
    
    return {
      totalUsers: 14,
      activeSessions: 3,
      dbSizeKb: Number((sizeInBytes / 1024).toFixed(2)),
      promptsCount: store.prompts.length,
      versionsCount: store.versions.length,
      logsCount: store.logs.length,
      memoriesCount: store.memories.length,
      supabaseStatus: 'Connected (Simulated Local Engine)',
      apiCallsToday: store.logs.filter(l => {
        const today = new Date().toDateString();
        return new Date(l.timestamp).toDateString() === today;
      }).length
    };
  }
};
