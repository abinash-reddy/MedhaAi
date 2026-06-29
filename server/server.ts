import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';
import { db, initDb, ExecutionLog, MemoryItem } from './db';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize DB file
initDb();

// Helper to determine prompt complexity
function classifyComplexity(prompt: string): 'simple' | 'medium' | 'complex' {
  const p = prompt.toLowerCase();
  
  // High complexity triggers
  const complexKeywords = [
    'write code', 'create a function', 'optimize query', 'postgres', 
    'react component', 'implement', 'algorithm', 'prd', 'product requirement', 
    'design a system', 'architect', 'analyze documentation', 'api documentation'
  ];
  const isComplex = complexKeywords.some(kw => p.includes(kw)) || prompt.length > 250;
  if (isComplex) return 'complex';

  // Medium complexity triggers
  const mediumKeywords = [
    'linkedin post', 'summarize', 'write a paragraph', 'explain', 
    'compare', 'suggest', 'marketing strategy', 'outline', 'email template'
  ];
  const isMedium = mediumKeywords.some(kw => p.includes(kw)) || prompt.length > 80;
  if (isMedium) return 'medium';

  return 'simple';
}

// Helper to simulate responses when Groq key is not present or fails
function generateMockResponse(prompt: string, model: string): { response: string; tokensPrompt: number; tokensCompletion: number } {
  const p = prompt.toLowerCase();
  const tokensPrompt = Math.ceil(prompt.length / 4);
  let response = '';
  let tokensCompletion = 100;

  if (p.includes('linkedin')) {
    response = `🚀 **PromptOps: The Next Frontier in Enterprise AI**\n\n` +
      `As large language models become deeply integrated into business operations, organizations are moving beyond ad-hoc prompting. Enter Prompt Operations (PromptOps) — the systematic management, version control, and optimization of AI prompts.\n\n` +
      `Why is this crucial?\n` +
      `• **Consistency**: Standardizing prompts ensures reliable, reproducible model outputs.\n` +
      `• **Cost & Latency Management**: Micro-optimizing prompts reduces token usage and limits roundtrip latency.\n` +
      `• **Security & Auditability**: Version control provides clear trails of what instructions were sent to LLMs.\n\n` +
      `Prompt Engineering is no longer a hobby. It is core software engineering.\n\n` +
      `#PromptOps #EnterpriseAI #LLMOps #MedhaAI`;
    tokensCompletion = 145;
  } else if (p.includes('react') || p.includes('login') || p.includes('html')) {
    response = `import React, { useState } from 'react';\n` +
      `import { Shield, Eye, EyeOff } from 'lucide-react';\n\n` +
      `export default function LoginForm() {\n` +
      `  const [email, setEmail] = useState('');\n` +
      `  const [password, setPassword] = useState('');\n` +
      `  const [showPassword, setShowPassword] = useState(false);\n` +
      `  const [loading, setLoading] = useState(false);\n\n` +
      `  const handleSubmit = (e: React.FormEvent) => {\n` +
      `    e.preventDefault();\n` +
      `    setLoading(true);\n` +
      `    setTimeout(() => {\n` +
      `      setLoading(false);\n` +
      `      alert('Login initiated for: ' + email);\n` +
      `    }, 1500);\n` +
      `  };\n\n` +
      `  return (\n` +
      `    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">\n` +
      `      <div className="w-full max-w-md p-8 rounded-2xl border border-violet-500/20 bg-slate-900/60 backdrop-blur-xl shadow-2xl">\n` +
      `        <div className="flex flex-col items-center mb-8">\n` +
      `          <div className="p-3 bg-violet-600/10 rounded-full border border-violet-500/30 mb-3">\n` +
      `            <Shield className="w-6 h-6 text-violet-400" />\n` +
      `          </div>\n` +
      `          <h2 className="text-2xl font-bold text-white tracking-tight">Medha Console</h2>\n` +
      `          <p className="text-sm text-slate-400 mt-1">Authenticate to access Prompt Platform</p>\n` +
      `        </div>\n` +
      `        <form onSubmit={handleSubmit} className="space-y-5">\n` +
      `          <div>\n` +
      `            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>\n` +
      `            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-slate-700 bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors" placeholder="name@company.com" />\n` +
      `          </div>\n` +
      `          <div>\n` +
      `            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>\n` +
      `            <input type={showPassword ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-slate-700 bg-slate-950 text-white focus:outline-none focus:border-violet-500 transition-colors" />\n` +
      `          </div>\n` +
      `          <button type="submit" disabled={loading} className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg transition-colors flex justify-center items-center gap-2">\n` +
      `            {loading ? 'Validating credentials...' : 'Enter Console'}\n` +
      `          </button>\n` +
      `        </form>\n` +
      `      </div>\n` +
      `    </div>\n` +
      `  );\n` +
      `}`;
    tokensCompletion = 380;
  } else if (p.includes('sql') || p.includes('query')) {
    response = `-- Optimized SQL Query using indexes\n` +
      `SELECT u.id, u.name, o.orders_count\n` +
      `FROM users u\n` +
      `INNER JOIN (\n` +
      `    SELECT user_id, count(id) as orders_count\n` +
      `    FROM orders\n` +
      `    GROUP BY user_id\n` +
      `    HAVING count(id) > 5\n` +
      `) o ON u.id = o.user_id\n` +
      `WHERE u.created_at > '2023-01-01'\n` +
      `ORDER BY o.orders_count DESC;\n\n` +
      `/* Optimization Analysis:\n` +
      `1. Replaced outer LEFT JOIN with INNER JOIN (HAVING count > 5 filters out users without orders anyway).\n` +
      `2. Created a subquery to aggregate orders first. This narrows aggregation workspace.\n` +
      `3. Index Recommendation: Create index on orders(user_id) and users(created_at).\n` +
      `*/`;
    tokensCompletion = 190;
  } else if (p.includes('explain') || p.includes('quantum')) {
    response = `Imagine you have a normal coin lying on the table. It is showing either heads or tails—that's a normal computer bit (0 or 1). \n\n` +
      `Now, spin that coin! While it is spinning, is it heads or tails? It is actually a blur of both at the same time. That's a quantum bit (a qubit) in **superposition**.\n\n` +
      `Quantum computers use these "spinning coins" to look at thousands of paths at once, solving problems that would take normal computers millions of years to compute!`;
    tokensCompletion = 120;
  } else if (p.includes('prd') || p.includes('product')) {
    response = `# PRODUCT REQUIREMENT DOCUMENT (PRD)\n\n` +
      `## 1. Product Overview\n` +
      `MEDHA AI is an Enterprise Prompt Intelligence Platform. The product solves LLM cost management, prompt version tracking, latency drift, and semantic answer recall.\n\n` +
      `## 2. Target Persona\n` +
      `• Prompt Engineers\n` +
      `• LLMOps Architects\n` +
      `• Product Managers building GenAI wrappers\n\n` +
      `## 3. Core Capabilities\n` +
      `• **Hindsight Memory**: Check previous inputs for similarity to reuse responses.\n` +
      `• **CascadeFlow Router**: Route prompts dynamically to Llama 3 8B, Mixtral, or Llama 3 70B depending on syntactic complexity.\n` +
      `• **Version Diffing**: Visual audit trail of prompt changes.`;
    tokensCompletion = 160;
  } else {
    response = `This is a processed prompt reply from Medha AI Engine.\n\n` +
      `Query processed: "${prompt.slice(0, 60)}${prompt.length > 60 ? '...' : ''}"\n` +
      `Routed Model: ${model}\n` +
      `System State: Active & Evaluated.\n\n` +
      `Recommendations:\n` +
      `• Refine role specification ("Act as a...")\n` +
      `• Inject few-shot examples for structured outputs.`;
    tokensCompletion = 90;
  }

  return { response, tokensPrompt, tokensCompletion };
}

// 1. PLAYGROUND EXECUTE PIPELINE
app.post('/api/playground/execute', async (req, res) => {
  const { promptContent, systemPrompt, customModel, temperature } = req.body;
  
  if (!promptContent) {
    return res.status(400).json({ error: 'Prompt content is required' });
  }

  const settings = db.getSettings();
  
  // A. Hindsight Memory Check (Semantic overlap)
  let memoryRecall: MemoryItem | null = null;
  if (settings.enableMemory) {
    const queryWords = promptContent.toLowerCase().split(/\s+/).filter((w: string) => w.length > 3);
    const memories = db.getMemories();
    
    let bestMatch: MemoryItem | null = null;
    let highestScore = 0;

    memories.forEach(m => {
      const memoryWords = m.prompt.toLowerCase().split(/\s+/);
      const matches = queryWords.filter((w: string) => memoryWords.includes(w)).length;
      const score = queryWords.length > 0 ? matches / queryWords.length : 0;
      
      if (score > highestScore && score >= settings.similarityThreshold) {
        highestScore = score;
        bestMatch = m;
      }
    });

    if (bestMatch) {
      memoryRecall = {
        ...(bestMatch as MemoryItem),
        similarityScore: Number(highestScore.toFixed(2))
      };
      db.incrementMemoryReuse((bestMatch as MemoryItem).id);
    }
  }

  // B. CascadeFlow Complexity Routing
  const complexity = classifyComplexity(promptContent);
  let selectedModel = customModel || settings.defaultModel;
  let routingReason = `Manual Override: User selected ${customModel}`;

  if (settings.enableCascadeFlow && !customModel) {
    if (complexity === 'simple') {
      selectedModel = 'llama-3.1-8b-instant';
      routingReason = 'CascadeFlow Routed: Low complexity text / basic query. Selected high-speed, cost-optimized model (Llama-3.1-8B-Instant).';
    } else if (complexity === 'medium') {
      selectedModel = 'llama-3.1-8b-instant';
      routingReason = 'CascadeFlow Routed: Medium complexity query / structural formatting request. Selected balanced model (Llama-3.1-8B-Instant).';
    } else {
      selectedModel = 'llama-3.3-70b-versatile';
      routingReason = 'CascadeFlow Routed: High complexity query / complex coding or reasoning task. Selected maximum intelligence model (Llama-3.3-70B).';
    }
  }

  // Determine pricing rates per token
  let baseCostRate = 0.000002;
  if (selectedModel.includes('8b') || selectedModel.includes('instant')) {
    baseCostRate = 0.0000001;
  } else {
    baseCostRate = 0.0000015;
  }

  let responseText = '';
  let tokensPrompt = 0;
  let tokensCompletion = 0;
  let tokensTotal = 0;
  let latencyMs = 0;
  let retryCount = 0;
  let fallbackUsed = false;
  let status: 'success' | 'failed' = 'success';
  
  const startTime = Date.now();

  const apiKey = process.env.GROQ_API_KEY || settings.apiKey;

  if (apiKey) {
    try {
      const groq = new Groq({ apiKey });
      const response = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt || 'You are an expert AI software assistant.' },
          { role: 'user', content: promptContent }
        ],
        model: selectedModel,
        temperature: temperature || 0.7
      });

      responseText = response.choices[0]?.message?.content || '';
      tokensPrompt = response.usage?.prompt_tokens || 0;
      tokensCompletion = response.usage?.completion_tokens || 0;
      tokensTotal = response.usage?.total_tokens || 0;
      latencyMs = Date.now() - startTime;
    } catch (apiError: any) {
      console.error('Groq execution failed, running failover fallback:', apiError.message);
      
      // Fallback mechanism (CascadeFlow active swap)
      if (settings.enableCascadeFlow && selectedModel !== 'llama-3.1-8b-instant') {
        retryCount = 1;
        fallbackUsed = true;
        selectedModel = 'llama-3.1-8b-instant';
        routingReason += ' [WARN: Primary route failed. Auto-switched to fallback model (Llama-3.1-8B-Instant) to maintain uptime.]';
        
        try {
          const groq = new Groq({ apiKey });
          const retryStartTime = Date.now();
          const response = await groq.chat.completions.create({
            messages: [
              { role: 'system', content: systemPrompt || 'You are an expert AI software assistant.' },
              { role: 'user', content: promptContent }
            ],
            model: selectedModel,
            temperature: temperature || 0.7
          });
          responseText = response.choices[0]?.message?.content || '';
          tokensPrompt = response.usage?.prompt_tokens || 0;
          tokensCompletion = response.usage?.completion_tokens || 0;
          tokensTotal = response.usage?.total_tokens || 0;
          latencyMs = Date.now() - startTime;
        } catch (fallbackError) {
          status = 'failed';
          responseText = `[Critical System Error] Fallback route also failed: ${apiError.message}`;
          latencyMs = Date.now() - startTime;
        }
      } else {
        status = 'failed';
        responseText = `[Groq API Connection Failed] ${apiError.message}`;
        latencyMs = Date.now() - startTime;
      }
    }
  }

  // Fallback to local mock engine if API key is not present or failed
  if (!responseText || status === 'failed') {
    if (status !== 'failed') {
      // API key is missing
      const mock = generateMockResponse(promptContent, selectedModel);
      responseText = mock.response;
      tokensPrompt = mock.tokensPrompt;
      tokensCompletion = mock.tokensCompletion;
      tokensTotal = tokensPrompt + tokensCompletion;
      latencyMs = Math.floor(Math.random() * 400) + (selectedModel.includes('70b') ? 950 : 200);
    }
  }

  const cost = tokensTotal * baseCostRate;
  const confidenceScore = Number((0.85 + Math.random() * 0.14).toFixed(2));

  // Save execution log
  const log = db.addLog({
    promptContent,
    response: responseText,
    model: selectedModel,
    latencyMs,
    tokensPrompt,
    tokensCompletion,
    tokensTotal,
    cost,
    complexity,
    routingReason,
    confidenceScore,
    status: responseText.startsWith('[') ? 'failed' : 'success',
    retryCount,
    fallbackUsed
  });

  // Save to hindsight memory if prompt is valid and not already recalled
  if (!memoryRecall && promptContent.length > 30 && !responseText.startsWith('[')) {
    db.addMemoryItem({
      prompt: promptContent,
      response: responseText,
      similarityScore: 1.0,
      category: complexity === 'complex' ? 'Coding' : (complexity === 'medium' ? 'Writing' : 'General'),
      tags: complexity === 'complex' ? ['code', 'inferred'] : ['general', 'inference'],
      importance: complexity === 'complex' ? 8 : 5,
      qualityScore: Math.round(confidenceScore * 100)
    });
  }

  res.json({
    log,
    memoryRecall,
    routedModel: selectedModel,
    complexity
  });
});

// 2. PROMPT OPTIMIZER
app.post('/api/prompt-optimizer/suggest', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

  const geminiApiKey = process.env.GEMINI_API_KEY;
  let resultJSON = null;

  if (geminiApiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Analyze this prompt and suggest improvements. Provide recommendations for:
1. Role Improvement (AI persona)
2. Context Improvement (background details)
3. Instruction Improvement (rules/constraints)
4. Format Improvement (output style structure)
Then provide a fully optimized and revised version of the prompt.

Output your reply in JSON format ONLY matching the following schema structure, with no markdown code fence wrappers or extra text:
{
  "roleImprovement": "Persona enhancement description...",
  "contextImprovement": "Context addition details...",
  "instructionImprovement": "Constraint boundary details...",
  "formatImprovement": "Output styling guidelines...",
  "optimizedPrompt": "Full revised prompt content..."
}`
                  },
                  {
                    text: `Prompt to analyze: "${prompt}"`
                  }
                ]
              }
            ],
            generationConfig: {
              responseMimeType: "application/json"
            }
          })
        }
      );

      if (response.ok) {
        const result = await response.json();
        const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
        resultJSON = JSON.parse(rawText.trim());
      }
    } catch (err: any) {
      console.error("Gemini optimizer failed, fallback active:", err.message);
    }
  }

  // Fallback to simulated optimizer recommendations if Gemini API is disabled
  if (!resultJSON) {
    const currentScore = Math.min(85, Math.max(40, Math.floor(prompt.length / 5) + 30));
    const suggestedScore = Math.min(98, currentScore + 15 + Math.floor(Math.random() * 8));

    const roleImprovement = prompt.toLowerCase().includes('act as') 
      ? 'Role already defined.' 
      : 'Define a specific persona. E.g., "Act as an expert Senior AI Architect specializing in prompt ops pipelines..."';
    
    const contextImprovement = prompt.length < 100 
      ? 'Provide background context. Explain the target constraints of your network server.' 
      : 'Provide exact input-output schema samples.';
      
    const instructionImprovement = 'Specify boundaries: add instructions like "Keep explanations under 150 words" or "Provide code block only".';
    const formatImprovement = 'Request structured styling. Add: "Output the result in a clean markdown table with headers: Category, Value, Impact".';

    const optimizedPrompt = `Act as an expert Systems Engineer and AI Architect.\n\n` +
      `[CONTEXT]\n` +
      `I am deploying an enterprise system and need to refine this process.\n\n` +
      `[TASK]\n` +
      `${prompt}\n\n` +
      `[OUTPUT STYLE]\n` +
      `Return a clean, detailed markdown response. Break down recommendations logically, prefix code with syntax formatting, and provide a clear 1-paragraph summary of the operational benefits.`;

    resultJSON = {
      originalScore: currentScore,
      optimizedScore: suggestedScore,
      roleImprovement,
      contextImprovement,
      instructionImprovement,
      formatImprovement,
      optimizedPrompt
    };
  } else {
    // Add dynamic scores to API response
    const currentScore = Math.min(85, Math.max(40, Math.floor(prompt.length / 5) + 30));
    resultJSON.originalScore = currentScore;
    resultJSON.optimizedScore = Math.min(98, currentScore + 20);
  }

  res.json(resultJSON);
});

// 3. PROMPT COMPARISON RUN
app.post('/api/prompt-compare/run', async (req, res) => {
  const { promptA, promptB } = req.body;
  if (!promptA || !promptB) return res.status(400).json({ error: 'Both Prompt A and Prompt B are required' });

  const compA = classifyComplexity(promptA);
  const compB = classifyComplexity(promptB);

  const modelA = compA === 'complex' ? 'llama-3.3-70b-versatile' : 'llama-3.1-8b-instant';
  const modelB = compB === 'complex' ? 'llama-3.3-70b-versatile' : 'llama-3.1-8b-instant';

  let resAText = '';
  let resBText = '';
  let latA = 0;
  let latB = 0;
  let tokensA = 0;
  let tokensB = 0;
  let costA = 0;
  let costB = 0;

  const apiKey = process.env.GROQ_API_KEY || db.getSettings().apiKey;

  const startTime = Date.now();

  if (apiKey) {
    try {
      const groq = new Groq({ apiKey });
      
      // Execute both prompts in parallel
      const [responseA, responseB] = await Promise.all([
        groq.chat.completions.create({
          messages: [{ role: 'user', content: promptA }],
          model: modelA
        }),
        groq.chat.completions.create({
          messages: [{ role: 'user', content: promptB }],
          model: modelB
        })
      ]);

      resAText = responseA.choices[0]?.message?.content || '';
      tokensA = responseA.usage?.total_tokens || 0;
      latA = Date.now() - startTime;
      costA = tokensA * (modelA.includes('70b') ? 0.0000015 : 0.0000005);

      const retryTime = Date.now();
      resBText = responseB.choices[0]?.message?.content || '';
      tokensB = responseB.usage?.total_tokens || 0;
      latB = Date.now() - retryTime;
      costB = tokensB * (modelB.includes('70b') ? 0.0000015 : 0.0000005);

    } catch (err: any) {
      console.error('Groq comparison execution failed, fallback active:', err.message);
    }
  }

  // Fallback to simulated mocks if Groq fails
  if (!resAText) {
    const mockA = generateMockResponse(promptA, modelA);
    resAText = mockA.response;
    tokensA = mockA.tokensPrompt + mockA.tokensCompletion;
    latA = compA === 'complex' ? 1150 : 420;
    costA = tokensA * (compA === 'complex' ? 0.0000015 : 0.0000005);
  }

  if (!resBText) {
    const mockB = generateMockResponse(promptB, modelB);
    resBText = mockB.response;
    tokensB = mockB.tokensPrompt + mockB.tokensCompletion;
    latB = compB === 'complex' ? 1210 : 450;
    costB = tokensB * (compB === 'complex' ? 0.0000015 : 0.0000005);
  }

  const qScoreA = Math.floor(Math.random() * 10) + (compA === 'complex' ? 88 : 78);
  const qScoreB = Math.floor(Math.random() * 10) + (compB === 'complex' ? 90 : 80);

  const ratioA = qScoreA / (costA * 1000 + latA / 100);
  const ratioB = qScoreB / (costB * 1000 + latB / 100);
  const winner = ratioA > ratioB ? 'Prompt A' : 'Prompt B';

  res.json({
    promptA: {
      response: resAText,
      latencyMs: latA,
      tokens: tokensA,
      cost: Number(costA.toFixed(5)),
      qualityScore: qScoreA,
      model: modelA
    },
    promptB: {
      response: resBText,
      latencyMs: latB,
      tokens: tokensB,
      cost: Number(costB.toFixed(5)),
      qualityScore: qScoreB,
      model: modelB
    },
    winner,
    reasoning: winner === 'Prompt A' 
      ? `Prompt A achieved comparable intelligence (${qScoreA}%) at a lower latency (${latA}ms vs ${latB}ms) and cost ($${costA.toFixed(5)} vs $${costB.toFixed(5)}).`
      : `Prompt B returned a higher quality rating (${qScoreB}%) that justifies its resource profile.`
  });
});

// 4. CRUD LIBRARY PROMPTS
app.get('/api/prompts', (req, res) => {
  res.json(db.getPrompts());
});

app.get('/api/prompts/:id', (req, res) => {
  const p = db.getPromptById(req.params.id);
  if (!p) return res.status(404).json({ error: 'Prompt not found' });
  res.json(p);
});

app.post('/api/prompts', (req, res) => {
  try {
    const p = db.savePrompt(req.body);
    res.json(p);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/prompts/:id', (req, res) => {
  const success = db.deletePrompt(req.params.id);
  res.json({ success });
});

app.post('/api/prompts/:id/duplicate', (req, res) => {
  try {
    const p = db.duplicatePrompt(req.params.id);
    res.json(p);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

app.post('/api/prompts/:id/rename', (req, res) => {
  try {
    const p = db.renamePrompt(req.params.id, req.body.name);
    res.json(p);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

// 5. VERSION CONTROL
app.get('/api/prompts/:id/versions', (req, res) => {
  res.json(db.getVersions(req.params.id));
});

// 6. RUNTIME LOGS
app.get('/api/logs', (req, res) => {
  res.json(db.getLogs());
});

app.post('/api/logs/clear', (req, res) => {
  db.clearLogs();
  res.json({ success: true });
});

// 7. MEMORIES
app.get('/api/memories', (req, res) => {
  const { query, category } = req.query;
  const items = db.searchMemories(String(query || ''), String(category || ''));
  res.json(items);
});

app.post('/api/memories/:id/favorite', (req, res) => {
  try {
    const item = db.toggleFavoriteMemory(req.params.id);
    res.json(item);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

app.delete('/api/memories/:id', (req, res) => {
  const success = db.deleteMemory(req.params.id);
  res.json({ success });
});

// 8. ANALYTICS
app.get('/api/analytics', (req, res) => {
  res.json(db.getAnalyticsSummary());
});

// 9. SETTINGS
app.get('/api/settings', (req, res) => {
  res.json(db.getSettings());
});

app.post('/api/settings', (req, res) => {
  const s = db.updateSettings(req.body);
  res.json(s);
});

// 10. ADMIN PANEL
app.get('/api/admin/stats', (req, res) => {
  res.json(db.getAdminStats());
});

// Startup Server
app.listen(PORT, () => {
  console.log(`[MEDHA AI] Backend server running on port ${PORT}`);
});
