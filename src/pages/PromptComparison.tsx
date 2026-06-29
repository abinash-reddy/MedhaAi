import React, { useState } from 'react';
import { 
  Columns, 
  Play, 
  Sparkles, 
  HelpCircle, 
  Zap, 
  BrainCircuit, 
  Clock, 
  Coins, 
  TrendingUp,
  Award,
  ChevronRight,
  ClipboardCopy
} from 'lucide-react';
import { api } from '../api';

interface ComparisonResult {
  promptA: { response: string; latencyMs: number; tokens: number; cost: number; qualityScore: number; model: string };
  promptB: { response: string; latencyMs: number; tokens: number; cost: number; qualityScore: number; model: string };
  winner: string;
  reasoning: string;
}

export default function PromptComparison() {
  const [promptA, setPromptA] = useState('');
  const [promptB, setPromptB] = useState('');
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<ComparisonResult | null>(null);

  const presets = [
    {
      name: "Short vs Detailed SQL",
      a: "Optimize this SQL: SELECT u.id, u.name, count(o.id) FROM users u LEFT JOIN orders o ON u.id = o.user_id GROUP BY u.id;",
      b: "Analyze and optimize the following SQL query for PostgreSQL: SELECT u.id, u.name, count(o.id) FROM users u LEFT JOIN orders o ON u.id = o.user_id WHERE u.created_at > '2023-01-01' GROUP BY u.id HAVING count(o.id) > 5 ORDER BY count(o.id) DESC;"
    },
    {
      name: "Direct vs Few-shot Writing",
      a: "Write a short professional post about PromptOps.",
      b: "Write a compelling, professional LinkedIn post discussing the rise of Prompt Operations (PromptOps) in enterprise AI. Keep it under 200 words, use bullet points, and include 3 relevant hashtags."
    }
  ];

  const handleCompare = async () => {
    if (!promptA.trim() || !promptB.trim()) return;
    try {
      setRunning(true);
      setResults(null);
      
      const res = await api.comparePrompts(promptA, promptB);
      setResults(res);
    } catch (err: any) {
      console.error(err);
      alert("Failed to compare prompts: " + err.message);
    } finally {
      setRunning(false);
    }
  };

  const loadPreset = (a: string, b: string) => {
    setPromptA(a);
    setPromptB(b);
    setResults(null);
  };

  return (
    <div className="space-y-8 text-left">
      
      {/* Title section */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white font-outfit">
          Prompt Comparison
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          A/B test prompt variations side-by-side to compare cost, speed, and qualitative scores.
        </p>
      </div>

      {/* Presets Row */}
      <div className="p-5 rounded-2xl border border-violet-500/10 bg-slate-900/20 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-semibold text-slate-300 font-outfit">A/B Test Templates</h4>
          <p className="text-[10px] text-slate-500">Quickly load comparative setups into Prompt A and B</p>
        </div>
        <div className="flex gap-2">
          {presets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => loadPreset(preset.a, preset.b)}
              className="px-3.5 py-1.5 rounded-lg bg-[#0e0a25] hover:bg-[#150f38] border border-violet-500/5 hover:border-violet-500/15 text-slate-400 hover:text-slate-200 text-xs font-semibold font-outfit transition-all duration-200"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Editor Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Prompt A */}
        <div className="p-6 rounded-2xl border border-violet-500/10 bg-slate-900/20 backdrop-blur-md space-y-3 flex flex-col">
          <div className="flex items-center justify-between border-b border-violet-500/10 pb-2">
            <span className="text-xs font-bold text-violet-400 font-outfit uppercase tracking-widest">
              Prompt Variation A
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Input A</span>
          </div>
          <textarea
            value={promptA}
            onChange={e => setPromptA(e.target.value)}
            placeholder="Enter first prompt variant..."
            className="w-full h-40 p-4 rounded-xl border border-violet-500/10 bg-slate-950 text-slate-200 font-mono text-xs focus:outline-none focus:border-violet-500/40 resize-none"
          />
        </div>

        {/* Prompt B */}
        <div className="p-6 rounded-2xl border border-violet-500/10 bg-slate-900/20 backdrop-blur-md space-y-3 flex flex-col">
          <div className="flex items-center justify-between border-b border-violet-500/10 pb-2">
            <span className="text-xs font-bold text-violet-400 font-outfit uppercase tracking-widest">
              Prompt Variation B
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Input B</span>
          </div>
          <textarea
            value={promptB}
            onChange={e => setPromptB(e.target.value)}
            placeholder="Enter second prompt variant (e.g., with added constraints or context)..."
            className="w-full h-40 p-4 rounded-xl border border-violet-500/10 bg-slate-950 text-slate-200 font-mono text-xs focus:outline-none focus:border-violet-500/40 resize-none"
          />
        </div>

      </div>

      {/* Run Action */}
      <div className="flex justify-center">
        <button
          onClick={handleCompare}
          disabled={!promptA.trim() || !promptB.trim() || running}
          className="px-8 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 disabled:from-slate-800 disabled:to-slate-900 disabled:text-slate-500 text-white text-xs font-semibold font-outfit rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg shadow-violet-500/15"
        >
          <Play className="w-4 h-4 fill-white" />
          {running ? 'Simulating Executions...' : 'Execute A/B Assessment'}
        </button>
      </div>

      {/* Results Section */}
      {results && (
        <div className="space-y-6">
          
          {/* Winner Analytics Banner */}
          <div className="p-6 rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-[#071b12] to-[#04120c] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-left">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                <Award className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-200 font-outfit">Evaluation Result</h4>
                <p className="text-xs text-slate-400 mt-0.5 leading-normal max-w-2xl">{results.reasoning}</p>
              </div>
            </div>
            <div className="bg-emerald-500/20 border border-emerald-500/30 px-4 py-2 rounded-xl text-center flex flex-col items-center">
              <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider font-outfit">Winner</span>
              <span className="text-sm font-bold text-white font-mono">{results.winner}</span>
            </div>
          </div>

          {/* Side-by-Side Comparison Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Metric Panel A */}
            <div className="p-6 rounded-2xl border border-violet-500/10 bg-slate-900/20 backdrop-blur-md space-y-4">
              <div className="flex justify-between items-center border-b border-violet-500/10 pb-3">
                <h4 className="text-sm font-semibold text-slate-200 font-outfit">Variation A Metrics</h4>
                <span className="text-[10px] text-slate-500 font-mono">{results.promptA.model.split('-')[0].toUpperCase()}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-950/60 rounded-xl border border-violet-500/5">
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Quality Score</span>
                  <span className="text-lg font-bold text-slate-300 font-mono">{results.promptA.qualityScore}%</span>
                </div>
                <div className="p-3 bg-slate-950/60 rounded-xl border border-violet-500/5">
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Execution Speed</span>
                  <span className="text-lg font-bold text-slate-300 font-mono">{results.promptA.latencyMs}ms</span>
                </div>
                <div className="p-3 bg-slate-950/60 rounded-xl border border-violet-500/5">
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Resource Cost</span>
                  <span className="text-lg font-bold text-slate-300 font-mono">${results.promptA.cost.toFixed(5)}</span>
                </div>
                <div className="p-3 bg-slate-950/60 rounded-xl border border-violet-500/5">
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Token Size</span>
                  <span className="text-lg font-bold text-slate-300 font-mono">{results.promptA.tokens}t</span>
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">Output Reply</label>
                <div className="p-4 bg-slate-950/80 rounded-xl border border-violet-500/5 text-slate-300 font-mono text-[11px] overflow-x-auto h-48 text-left whitespace-pre-wrap">
                  {results.promptA.response}
                </div>
              </div>
            </div>

            {/* Metric Panel B */}
            <div className="p-6 rounded-2xl border border-violet-500/10 bg-slate-900/20 backdrop-blur-md space-y-4">
              <div className="flex justify-between items-center border-b border-violet-500/10 pb-3">
                <h4 className="text-sm font-semibold text-slate-200 font-outfit">Variation B Metrics</h4>
                <span className="text-[10px] text-slate-500 font-mono">{results.promptB.model.split('-')[0].toUpperCase()}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-950/60 rounded-xl border border-violet-500/5">
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Quality Score</span>
                  <span className={`text-lg font-bold font-mono ${results.winner === 'Prompt B' ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}>
                    {results.promptB.qualityScore}%
                  </span>
                </div>
                <div className="p-3 bg-slate-950/60 rounded-xl border border-violet-500/5">
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Execution Speed</span>
                  <span className="text-lg font-bold text-slate-300 font-mono">{results.promptB.latencyMs}ms</span>
                </div>
                <div className="p-3 bg-slate-950/60 rounded-xl border border-violet-500/5">
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Resource Cost</span>
                  <span className="text-lg font-bold text-slate-300 font-mono">${results.promptB.cost.toFixed(5)}</span>
                </div>
                <div className="p-3 bg-slate-950/60 rounded-xl border border-violet-500/5">
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Token Size</span>
                  <span className="text-lg font-bold text-slate-300 font-mono">{results.promptB.tokens}t</span>
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">Output Reply</label>
                <div className="p-4 bg-slate-950/80 rounded-xl border border-violet-500/5 text-slate-300 font-mono text-[11px] overflow-x-auto h-48 text-left whitespace-pre-wrap">
                  {results.promptB.response}
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
