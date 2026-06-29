import React, { useState, useEffect } from 'react';
import { 
  GitBranch, 
  Clock, 
  TrendingUp, 
  GitCommit, 
  Sparkles,
  ArrowRight,
  ChevronRight,
  Activity,
  ArrowDown
} from 'lucide-react';
import { api } from '../api';
import { Prompt, PromptVersion } from '../types';

export default function PromptEvolution() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedPromptId, setSelectedPromptId] = useState('');
  const [versions, setVersions] = useState<PromptVersion[]>([]);
  const [loading, setLoading] = useState(false);

  // Diff selector state
  const [verA, setVerA] = useState<number | ''>('');
  const [verB, setVerB] = useState<number | ''>('');

  useEffect(() => {
    async function loadPrompts() {
      try {
        const p = await api.getPrompts();
        setPrompts(p);
        if (p.length > 0) {
          setSelectedPromptId(p[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadPrompts();
  }, []);

  useEffect(() => {
    if (!selectedPromptId) return;
    async function loadVersions() {
      try {
        setLoading(true);
        const v = await api.getVersions(selectedPromptId);
        setVersions(v);
        if (v.length > 1) {
          setVerA(v[1].version); // Old version
          setVerB(v[0].version); // New version
        } else if (v.length === 1) {
          setVerA(v[0].version);
          setVerB(v[0].version);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadVersions();
  }, [selectedPromptId]);

  const selectedPrompt = prompts.find(p => p.id === selectedPromptId);

  // Helper to compute inline/line-by-line diffs
  const calculateDiff = () => {
    const vA = versions.find(v => v.version === verA);
    const vB = versions.find(v => v.version === verB);

    if (!vA || !vB) return [];

    const linesA = vA.content.split('\n');
    const linesB = vB.content.split('\n');
    const maxLength = Math.max(linesA.length, linesB.length);
    const diffList = [];

    for (let i = 0; i < maxLength; i++) {
      const lineA = linesA[i];
      const lineB = linesB[i];

      if (lineA === lineB) {
        diffList.push({ type: 'unchanged', text: lineA, lineNum: i + 1 });
      } else {
        if (lineA !== undefined) {
          diffList.push({ type: 'removed', text: lineA, lineNum: i + 1 });
        }
        if (lineB !== undefined) {
          diffList.push({ type: 'added', text: lineB, lineNum: i + 1 });
        }
      }
    }
    return diffList;
  };

  const diffItems = calculateDiff();

  // Performance improvements metrics (from V1 to latest)
  const getImprovements = () => {
    if (versions.length < 2) return { quality: 0, speed: 0, cost: 0 };
    const sorted = [...versions].sort((a, b) => a.version - b.version);
    const first = sorted[0];
    const latest = sorted[sorted.length - 1];

    const qualityGain = latest.qualityScore - first.qualityScore;
    const speedGain = first.latencyMs > 0 ? Math.round(((first.latencyMs - latest.latencyMs) / first.latencyMs) * 100) : 0;
    const costGain = first.costEstimate > 0 ? Math.round(((first.costEstimate - latest.costEstimate) / first.costEstimate) * 100) : 0;

    return {
      quality: qualityGain,
      speed: speedGain,
      cost: costGain
    };
  };

  const improvements = getImprovements();

  return (
    <div className="space-y-8 text-left">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white font-outfit">
            Prompt Evolution
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Track structural alterations, audit commits, and visualize version diffs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs text-slate-400 font-outfit">Target Prompt:</label>
          <select 
            value={selectedPromptId}
            onChange={e => setSelectedPromptId(e.target.value)}
            className="px-3.5 py-2 text-xs rounded-xl bg-slate-900 border border-violet-500/10 text-slate-200 focus:outline-none focus:border-violet-500/40 font-medium"
          >
            {prompts.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-20 bg-slate-900/40 rounded-xl"></div>
          <div className="h-64 bg-slate-900/40 rounded-xl"></div>
        </div>
      ) : versions.length === 0 ? (
        <div className="p-8 text-center bg-slate-900/20 rounded-2xl border border-violet-500/10 text-slate-400">
          No versions tracked for this prompt yet. Run the prompt in Playground to begin history caching.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Timeline & Commits column (Left) */}
          <div className="space-y-6">
            
            {/* Version gains badge card */}
            <div className="p-6 rounded-2xl border border-violet-500/10 bg-slate-900/20 backdrop-blur-md space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-outfit">Overall Version Gains</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5"><TrendingUp className="w-4 h-4 text-emerald-400" /> Quality Gain</span>
                  <span className="font-bold font-mono text-emerald-400">+{improvements.quality}%</span>
                </div>
                <div className="flex justify-between items-center text-xs border-t border-violet-500/5 pt-2">
                  <span className="text-slate-400 flex items-center gap-1.5"><Clock className="w-4 h-4 text-violet-400" /> Latency change</span>
                  <span className={`font-bold font-mono ${improvements.speed >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {improvements.speed >= 0 ? `-${improvements.speed}% (Faster)` : `+${Math.abs(improvements.speed)}%`}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs border-t border-violet-500/5 pt-2">
                  <span className="text-slate-400 flex items-center gap-1.5"><Activity className="w-4 h-4 text-pink-400" /> Cost change</span>
                  <span className={`font-bold font-mono ${improvements.cost >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {improvements.cost >= 0 ? `-${improvements.cost}% (Cheaper)` : `+${Math.abs(improvements.cost)}%`}
                  </span>
                </div>
              </div>
            </div>

            {/* Commits Timeline */}
            <div className="p-6 rounded-2xl border border-violet-500/10 bg-slate-900/20 backdrop-blur-md space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-outfit">Timeline Version Commits</h4>
              <div className="relative pl-6 border-l border-violet-500/15 space-y-6">
                {versions.map((ver, idx) => (
                  <div key={ver.id} className="relative text-left">
                    <span className="absolute -left-[30px] top-1 w-4 h-4 rounded-full bg-slate-950 border-2 border-violet-500 flex items-center justify-center">
                      <GitCommit className="w-2.5 h-2.5 text-violet-400" />
                    </span>
                    <div className="bg-slate-950/60 hover:bg-slate-950 p-3 rounded-xl border border-violet-500/5 hover:border-violet-500/15 transition-all">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-violet-300 font-mono">VERSION {ver.version}</span>
                        <span className="text-[9px] text-slate-500 font-mono">{new Date(ver.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-[10px] text-slate-300 mt-1 font-outfit italic leading-normal">
                        "{ver.description}"
                      </p>
                      <div className="flex gap-4 mt-2 text-[9px] text-slate-500 font-mono">
                        <span>Quality: <strong className="text-slate-300">{ver.qualityScore}%</strong></span>
                        <span>Latency: <strong className="text-slate-300">{ver.latencyMs}ms</strong></span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Diff Viewer (Right col-span 2) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Selector box */}
            <div className="p-5 rounded-2xl border border-violet-500/10 bg-slate-900/20 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-violet-400" />
                <h4 className="text-sm font-semibold text-slate-200 font-outfit">Visual Diff comparison</h4>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <select 
                  value={verA} 
                  onChange={e => setVerA(Number(e.target.value))}
                  className="px-2.5 py-1.5 rounded bg-slate-950 border border-violet-500/10 text-slate-300 font-mono"
                >
                  {versions.map(v => (
                    <option key={v.id} value={v.version}>V{v.version}</option>
                  ))}
                </select>
                <span className="text-slate-500">to</span>
                <select 
                  value={verB} 
                  onChange={e => setVerB(Number(e.target.value))}
                  className="px-2.5 py-1.5 rounded bg-slate-950 border border-violet-500/10 text-slate-300 font-mono"
                >
                  {versions.map(v => (
                    <option key={v.id} value={v.version}>V{v.version}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Diff content panel */}
            <div className="rounded-2xl border border-violet-500/10 bg-slate-950 overflow-hidden">
              <div className="bg-[#0b081e] px-6 py-3 border-b border-violet-500/10 flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>File: {selectedPrompt ? selectedPrompt.name.toLowerCase().replace(/\s+/g, '_') : 'prompt'}.md</span>
                <span>Highlighting: Line-by-Line</span>
              </div>
              <div className="p-4 font-mono text-[11px] overflow-x-auto max-h-[480px] space-y-0.5 text-left">
                {diffItems.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    Select distinct versions above to compute git diff.
                  </div>
                ) : (
                  diffItems.map((item, idx) => (
                    <div 
                      key={idx} 
                      className={`flex pl-4 py-1 border-l-2 ${
                        item.type === 'added' 
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500' 
                          : item.type === 'removed'
                            ? 'bg-rose-500/10 text-rose-300 border-rose-500 line-through'
                            : 'text-slate-400 border-transparent hover:bg-white/5'
                      }`}
                    >
                      <span className="w-8 text-slate-600 select-none text-right pr-4 font-mono">{item.lineNum}</span>
                      <span className="w-4 select-none mr-2 font-bold font-mono">
                        {item.type === 'added' ? '+' : item.type === 'removed' ? '-' : ' '}
                      </span>
                      <span className="whitespace-pre-wrap flex-1">{item.text}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
