import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Sparkles, 
  Settings, 
  HelpCircle, 
  Zap, 
  BrainCircuit, 
  Clock, 
  Coins, 
  TrendingUp,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ClipboardCopy
} from 'lucide-react';
import { api } from '../api';
import { Prompt, ExecutionLog, MemoryItem } from '../types';

function classifyComplexity(prompt: string): 'simple' | 'medium' | 'complex' {
  const p = prompt.toLowerCase();
  const complexKeywords = [
    'write code', 'create a function', 'optimize query', 'postgres', 
    'react component', 'implement', 'algorithm', 'prd', 'product requirement', 
    'design a system', 'architect', 'analyze documentation', 'api documentation'
  ];
  const isComplex = complexKeywords.some(kw => p.includes(kw)) || prompt.length > 250;
  if (isComplex) return 'complex';

  const mediumKeywords = [
    'linkedin post', 'summarize', 'write a paragraph', 'explain', 
    'compare', 'suggest', 'marketing strategy', 'outline', 'email template'
  ];
  const isMedium = mediumKeywords.some(kw => p.includes(kw)) || prompt.length > 80;
  if (isMedium) return 'medium';

  return 'simple';
}

interface PlaygroundProps {
  onRunFinished: () => void;
  refreshTrigger: number;
}

export default function Playground({ onRunFinished, refreshTrigger }: PlaygroundProps) {
  // Playground state
  const [promptContent, setPromptContent] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('You are an expert AI software assistant.');
  const [temperature, setTemperature] = useState(0.7);
  const [routingMode, setRoutingMode] = useState<'cascadeflow' | 'manual'>('cascadeflow');
  const [selectedModel, setSelectedModel] = useState('llama-3.3-70b-versatile');
  
  // Execution result state
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);
  const [execTrace, setExecTrace] = useState<ExecutionLog | null>(null);
  const [memoryRecall, setMemoryRecall] = useState<MemoryItem | null>(null);
  const [complexityClass, setComplexityClass] = useState<string>('');

  // Optimizer state
  const [optimizing, setOptimizing] = useState(false);
  const [optimizerData, setOptimizerData] = useState<{
    originalScore: number;
    optimizedScore: number;
    roleImprovement: string;
    contextImprovement: string;
    instructionImprovement: string;
    formatImprovement: string;
    optimizedPrompt: string;
  } | null>(null);

  // Library state (to save prompt)
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [promptName, setPromptName] = useState('');
  const [selectedPromptId, setSelectedPromptId] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Load presets
  const presets = [
    { name: "LinkedIn Trend Post", content: "Write a compelling, professional LinkedIn post discussing the rise of Prompt Operations (PromptOps) in enterprise AI. Keep it under 200 words, use bullet points, and include 3 relevant hashtags." },
    { name: "React Login Component", content: "Create a fully responsive React login component using Vite and Tailwind CSS. The design should be modern glassmorphism with a dark background, input validations, loading states, and error alerts." },
    { name: "Explain Quantum Physics", content: "Explain quantum computing to a high schooler using the analogy of a spinning coin. Keep it engaging, educational, and under 150 words." },
    { name: "SQL Aggregate Optimizer", content: "Analyze and optimize the following SQL query for PostgreSQL: SELECT u.id, u.name, count(o.id) FROM users u LEFT JOIN orders o ON u.id = o.user_id WHERE u.created_at > '2023-01-01' GROUP BY u.id HAVING count(o.id) > 5 ORDER BY count(o.id) DESC;" },
    { name: "Python API Client", content: "Write a python class named MedhaAPIClient that initializes with an api_key and base_url. Implement a robust fetch_logs method with error logging and json payload parsing." }
  ];

  useEffect(() => {
    async function loadPrompts() {
      try {
        const p = await api.getPrompts();
        setPrompts(p);
      } catch (err) {
        console.error("Playground prompts loading failed", err);
      }
    }
    loadPrompts();
  }, [refreshTrigger]);

  const loadPreset = (content: string, name?: string) => {
    setPromptContent(content);
    if (name) setPromptName(name);
    setOptimizerData(null);
  };

  const handleExecute = async () => {
    if (!promptContent.trim()) return;
    try {
      setRunning(true);
      setOutput('');
      setExecTrace(null);
      setMemoryRecall(null);

      const res = await api.executePrompt({
        promptContent,
        systemPrompt,
        customModel: routingMode === 'manual' ? selectedModel : undefined,
        temperature
      });

      setOutput(res.log.response);
      setExecTrace(res.log);
      setMemoryRecall(res.memoryRecall);
      setComplexityClass(res.complexity);

      // Trigger navbar stat update
      onRunFinished();
    } catch (error: any) {
      setOutput(`[Engine Error] Failed to execute prompt: ${error.message}`);
    } finally {
      setRunning(false);
    }
  };

  const handleOptimize = async () => {
    if (!promptContent.trim()) return;
    try {
      setOptimizing(true);
      const res = await api.optimizePrompt(promptContent);
      setOptimizerData(res);
    } catch (error: any) {
      console.error(error);
    } finally {
      setOptimizing(false);
    }
  };

  const applyOptimizedPrompt = () => {
    if (optimizerData) {
      setPromptContent(optimizerData.optimizedPrompt);
      setOptimizerData(null);
    }
  };

  const handleSavePrompt = async () => {
    if (!promptContent.trim()) return;
    setSaveStatus('saving');
    try {
      const nameToSave = promptName.trim() || `Prompt ${prompts.length + 1}`;
      const saved = await api.savePrompt({
        id: selectedPromptId || undefined,
        name: nameToSave,
        content: promptContent,
        category: classifyComplexity(promptContent) === 'complex' ? 'Coding' : 'Writing'
      });
      
      // Update prompts list
      const p = await api.getPrompts();
      setPrompts(p);
      setSelectedPromptId(saved.id);
      setPromptName(saved.name);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
      onRunFinished();
    } catch (err) {
      console.error(err);
      setSaveStatus('idle');
    }
  };

  const loadSavedPrompt = (id: string) => {
    const selected = prompts.find(p => p.id === id);
    if (selected) {
      setPromptContent(selected.content);
      setPromptName(selected.name);
      setSelectedPromptId(selected.id);
      setOptimizerData(null);
    }
  };

  const handleClear = () => {
    setPromptContent('');
    setPromptName('');
    setSelectedPromptId('');
    setOutput('');
    setExecTrace(null);
    setMemoryRecall(null);
    setOptimizerData(null);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 text-left">
      
      {/* Prompt Editor Panel (Left/Center col span 2) */}
      <div className="xl:col-span-2 space-y-6 flex flex-col">
        
        {/* Presets and Library Bar */}
        <div className="p-6 rounded-2xl border border-violet-500/10 bg-slate-900/20 backdrop-blur-md space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold text-slate-200 font-outfit">Prompt Presets</h3>
              <p className="text-xs text-slate-500 mt-0.5">Click a prompt skeleton to populate the editor workspace</p>
            </div>
            {prompts.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Library:</span>
                <select 
                  value={selectedPromptId}
                  onChange={e => loadSavedPrompt(e.target.value)}
                  className="px-3 py-1 text-xs rounded bg-slate-950 border border-violet-500/10 text-slate-300 focus:outline-none"
                >
                  <option value="">-- Select Saved Prompt --</option>
                  {prompts.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (V{p.version})</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            {presets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => loadPreset(preset.content, preset.name)}
                className="px-3 py-1.5 rounded-lg bg-[#0e0a25] hover:bg-[#150f38] border border-violet-500/5 hover:border-violet-500/15 text-slate-400 hover:text-slate-200 text-xs font-outfit transition-all duration-200"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* System Prompt & Prompt Inputs */}
        <div className="p-6 rounded-2xl border border-violet-500/10 bg-slate-900/20 backdrop-blur-md space-y-4 flex-1 flex flex-col min-h-[480px]">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-violet-500/10 pb-4">
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                placeholder="Name your prompt template..."
                value={promptName}
                onChange={e => setPromptName(e.target.value)}
                className="px-3 py-1 text-sm bg-transparent border-b border-transparent focus:border-violet-500/50 text-slate-200 font-medium placeholder-slate-500 focus:outline-none w-48 md:w-64"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleClear}
                className="p-2 rounded-lg bg-slate-900/60 hover:bg-slate-900 border border-violet-500/10 hover:border-violet-500/20 text-slate-400 hover:text-slate-200 transition-colors"
                title="Clear Workspace"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={handleSavePrompt}
                disabled={!promptContent.trim()}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold font-outfit border transition-all duration-200 ${
                  saveStatus === 'saved'
                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400'
                    : 'bg-[#150f38] hover:bg-[#1a1348] border-violet-500/25 hover:border-violet-500/40 text-slate-300'
                }`}
              >
                {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved V' + (prompts.find(p => p.id === selectedPromptId)?.version || 1) : 'Save Template'}
              </button>
            </div>
          </div>

          <div className="space-y-3 flex-1 flex flex-col">
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">System Context</label>
              <input
                type="text"
                value={systemPrompt}
                onChange={e => setSystemPrompt(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-violet-500/10 bg-slate-950 text-slate-300 text-xs focus:outline-none focus:border-violet-500/40"
              />
            </div>
            
            <div className="flex-1 flex flex-col min-h-[220px]">
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Prompt Content</label>
              <textarea
                value={promptContent}
                onChange={e => setPromptContent(e.target.value)}
                placeholder="Write your prompt logic here..."
                className="w-full flex-1 p-4 rounded-xl border border-violet-500/10 bg-slate-950 text-slate-200 font-mono text-sm focus:outline-none focus:border-violet-500/40 resize-none"
              />
            </div>
          </div>

          {/* Action Trigger Row */}
          <div className="flex items-center justify-between border-t border-violet-500/10 pt-4 mt-2">
            <button
              onClick={handleOptimize}
              disabled={!promptContent.trim() || optimizing}
              className="px-4 py-2.5 rounded-xl bg-violet-600/10 hover:bg-violet-600/15 border border-violet-500/25 text-violet-300 hover:text-violet-200 text-xs font-semibold font-outfit flex items-center gap-2 transition-all duration-200"
            >
              <Sparkles className="w-4 h-4 text-violet-400" />
              {optimizing ? 'Analyzing Prompt...' : 'Analyze & Optimize'}
            </button>
            
            <button
              onClick={handleExecute}
              disabled={!promptContent.trim() || running}
              className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 disabled:from-slate-800 disabled:to-slate-900 disabled:text-slate-500 text-white text-xs font-semibold font-outfit rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg shadow-violet-500/15"
            >
              <Play className="w-4 h-4 fill-white" />
              {running ? 'Executing Trace...' : 'Run Pipeline'}
            </button>
          </div>
        </div>

        {/* Execution Output Panel */}
        {(output || running) && (
          <div className="p-6 rounded-2xl border border-violet-500/10 bg-slate-900/20 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between border-b border-violet-500/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
                <h4 className="text-sm font-semibold text-slate-200 font-outfit">Response Payload</h4>
              </div>
              <button 
                onClick={copyToClipboard}
                className="p-1.5 rounded bg-slate-950 border border-violet-500/10 hover:border-violet-500/30 text-slate-400 hover:text-slate-300 transition-colors flex items-center gap-1.5 text-[10px]"
              >
                <ClipboardCopy className="w-3.5 h-3.5" /> Copy
              </button>
            </div>
            
            {running ? (
              <div className="space-y-2 py-4 animate-pulse">
                <div className="h-4 bg-slate-850 w-full rounded"></div>
                <div className="h-4 bg-slate-850 w-11/12 rounded"></div>
                <div className="h-4 bg-slate-850 w-4/5 rounded"></div>
              </div>
            ) : (
              <div className="bg-slate-950/80 p-4 rounded-xl border border-violet-500/5 text-slate-300 text-sm font-outfit overflow-x-auto whitespace-pre-wrap text-left font-mono">
                {output}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Configuration & Trace Diagnostics (Right panel) */}
      <div className="space-y-6">
        
        {/* Model Route Settings Card */}
        <div className="p-6 rounded-2xl border border-violet-500/10 bg-slate-900/20 backdrop-blur-md space-y-4">
          <div className="flex items-center gap-2 border-b border-violet-500/10 pb-3">
            <Settings className="w-4 h-4 text-violet-400" />
            <h4 className="text-sm font-semibold text-slate-200 font-outfit">Routing Options</h4>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Routing Mode</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setRoutingMode('cascadeflow')}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all duration-200 font-outfit ${
                    routingMode === 'cascadeflow'
                      ? 'bg-violet-600/15 border-violet-500 text-violet-300'
                      : 'bg-slate-950 border-violet-500/5 text-slate-400 hover:text-slate-300'
                  }`}
                >
                  CascadeFlow Router
                </button>
                <button
                  onClick={() => setRoutingMode('manual')}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all duration-200 font-outfit ${
                    routingMode === 'manual'
                      ? 'bg-violet-600/15 border-violet-500 text-violet-300'
                      : 'bg-slate-950 border-violet-500/5 text-slate-400 hover:text-slate-300'
                  }`}
                >
                  Manual Override
                </button>
              </div>
            </div>

            {routingMode === 'manual' && (
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Target AI Model</label>
                <select
                  value={selectedModel}
                  onChange={e => setSelectedModel(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-violet-500/10 text-slate-300 focus:outline-none focus:border-violet-500/40"
                >
                  <option value="llama-3.3-70b-versatile">Llama 3.3 70B (Complex)</option>
                  <option value="gemma2-9b-it">Gemma 2 9B (Medium)</option>
                  <option value="llama-3.1-8b-instant">Llama 3.1 8B (Simple)</option>
                </select>
              </div>
            )}

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Temperature</label>
                <span className="text-xs font-mono text-violet-400 font-semibold">{temperature}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.5"
                step="0.1"
                value={temperature}
                onChange={e => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-violet-500 bg-slate-950 rounded-lg appearance-none h-1.5"
              />
            </div>
          </div>
        </div>

        {/* Optimiser Recommendations Panel */}
        {optimizerData && (
          <div className="p-6 rounded-2xl border border-violet-500/15 bg-gradient-to-br from-slate-900/40 to-violet-950/10 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between border-b border-violet-500/10 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-400" />
                <h4 className="text-sm font-semibold text-slate-200 font-outfit">Medha Prompt Optimizer</h4>
              </div>
              <span className="text-[9px] bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded font-bold">
                +{optimizerData.optimizedScore - optimizerData.originalScore}% Gain
              </span>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-4 bg-slate-950/60 p-3 rounded-xl border border-violet-500/5">
                <div className="text-left">
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Raw Quality</span>
                  <span className="text-lg font-bold text-slate-400 font-mono">{optimizerData.originalScore}%</span>
                </div>
                <div className="text-left border-l border-violet-500/10 pl-4">
                  <span className="text-[9px] text-violet-400 uppercase tracking-wider block">Optimized</span>
                  <span className="text-lg font-bold text-violet-400 font-mono">{optimizerData.optimizedScore}%</span>
                </div>
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                <div className="text-left">
                  <h5 className="font-semibold text-slate-300 flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-violet-400" /> System Persona</h5>
                  <p className="text-[10px] text-slate-400 mt-0.5">{optimizerData.roleImprovement}</p>
                </div>
                <div className="text-left border-t border-violet-500/5 pt-2">
                  <h5 className="font-semibold text-slate-300 flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-violet-400" /> Context Context</h5>
                  <p className="text-[10px] text-slate-400 mt-0.5">{optimizerData.contextImprovement}</p>
                </div>
                <div className="text-left border-t border-violet-500/5 pt-2">
                  <h5 className="font-semibold text-slate-300 flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-violet-400" /> Target constraints</h5>
                  <p className="text-[10px] text-slate-400 mt-0.5">{optimizerData.instructionImprovement}</p>
                </div>
                <div className="text-left border-t border-violet-500/5 pt-2">
                  <h5 className="font-semibold text-slate-300 flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-violet-400" /> Structured format</h5>
                  <p className="text-[10px] text-slate-400 mt-0.5">{optimizerData.formatImprovement}</p>
                </div>
              </div>

              <button
                onClick={applyOptimizedPrompt}
                className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl text-center text-xs transition-colors flex justify-center items-center gap-2 shadow-lg shadow-violet-500/10"
              >
                Apply Recommendations <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Real-time Diagnostics Trace */}
        {execTrace && (
          <div className="p-6 rounded-2xl border border-violet-500/10 bg-slate-900/20 backdrop-blur-md space-y-4">
            <div className="flex items-center gap-2 border-b border-violet-500/10 pb-3">
              <Zap className="w-4 h-4 text-violet-400 animate-pulse" />
              <h4 className="text-sm font-semibold text-slate-200 font-outfit">Execution Diagnostics</h4>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between items-center bg-[#0d0922]/50 p-2.5 rounded-lg border border-violet-500/5">
                <span className="text-slate-400">Classified Complexity:</span>
                <span className="font-bold text-violet-400 uppercase font-mono tracking-wider">
                  {complexityClass}
                </span>
              </div>

              <div className="flex justify-between items-center border-b border-violet-500/5 pb-2">
                <span className="text-slate-400 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Latency</span>
                <span className="font-semibold text-slate-200 font-mono">{execTrace.latencyMs} ms</span>
              </div>

              <div className="flex justify-between items-center border-b border-violet-500/5 pb-2">
                <span className="text-slate-400 flex items-center gap-1"><Coins className="w-3.5 h-3.5" /> Cost Estimate</span>
                <span className="font-semibold text-slate-200 font-mono">${execTrace.cost.toFixed(5)}</span>
              </div>

              <div className="flex justify-between items-center border-b border-violet-500/5 pb-2">
                <span className="text-slate-400">Total Tokens</span>
                <span className="font-semibold text-slate-200 font-mono">{execTrace.tokensTotal} <span className="text-[10px] text-slate-500">({execTrace.tokensPrompt}p/{execTrace.tokensCompletion}c)</span></span>
              </div>

              <div className="flex justify-between items-center border-b border-violet-500/5 pb-2">
                <span className="text-slate-400">Evaluated Quality</span>
                <span className="font-semibold text-emerald-400 font-mono">{Math.round(execTrace.confidenceScore * 100)}%</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Primary Route Failover</span>
                <span className={`font-semibold font-mono ${execTrace.fallbackUsed ? 'text-amber-400' : 'text-slate-500'}`}>
                  {execTrace.fallbackUsed ? 'Switched' : 'Stable'}
                </span>
              </div>

              {/* Hindsight memory notice */}
              {memoryRecall ? (
                <div className="bg-emerald-950/20 p-3 rounded-lg border border-emerald-500/20 text-left space-y-1">
                  <div className="flex items-center gap-1.5">
                    <BrainCircuit className="w-4 h-4 text-emerald-400" />
                    <span className="font-semibold text-emerald-400 font-outfit text-[11px]">Hindsight Cache Hit!</span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    A semantically similar prompt was matched in memory (<strong>{(memoryRecall.similarityScore * 100).toFixed(0)}% Match</strong>). 
                    The model response was served/enhanced using the memory cache.
                  </p>
                </div>
              ) : (
                <div className="bg-[#0b081e] p-2.5 rounded-lg border border-violet-500/5 text-left">
                  <p className="text-[10px] text-slate-500 flex items-center gap-1.5 leading-normal">
                    <BrainCircuit className="w-4 h-4 text-violet-500/50" />
                    No semantic memory overlap found. Executed run has been cached for hindsight indexing.
                  </p>
                </div>
              )}

              {/* CascadeFlow Routing Details */}
              <div className="bg-slate-950/60 p-3 rounded-xl border border-violet-500/5 text-left space-y-1">
                <span className="text-[10px] text-violet-400 font-bold block uppercase tracking-wider font-outfit">CascadeFlow Logs</span>
                <p className="text-[10px] text-slate-400 leading-normal">{execTrace.routingReason}</p>
              </div>

            </div>
          </div>
        )}

      </div>

    </div>
  );
}
