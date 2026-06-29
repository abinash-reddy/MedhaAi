import React, { useEffect, useState } from 'react';
import { 
  Activity, 
  Clock, 
  DollarSign, 
  BrainCircuit, 
  TrendingUp, 
  ArrowRight,
  Sparkles,
  Zap,
  ListFilter
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { api } from '../api';
import { AnalyticsSummary, Prompt, ExecutionLog } from '../types';

interface DashboardProps {
  onNavigate: (tab: string) => void;
  refreshTrigger: number;
}

export default function Dashboard({ onNavigate, refreshTrigger }: DashboardProps) {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [aData, pData, lData] = await Promise.all([
          api.getAnalytics(),
          api.getPrompts(),
          api.getLogs()
        ]);
        setAnalytics(aData);
        setPrompts(pData);
        setLogs(lData.slice(0, 5)); // show top 5 recent runs
      } catch (err) {
        console.error("Dashboard failed to load database stats", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [refreshTrigger]);

  if (loading || !analytics) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-slate-900/60 w-1/4 rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-900/40 rounded-2xl border border-violet-500/5"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-96 bg-slate-900/40 lg:col-span-2 rounded-2xl border border-violet-500/5"></div>
          <div className="h-96 bg-slate-900/40 rounded-2xl border border-violet-500/5"></div>
        </div>
      </div>
    );
  }

  const kpis = [
    {
      label: 'Prompt Executions',
      value: analytics.totalRuns,
      change: `${analytics.successfulRuns} successful`,
      icon: Activity,
      color: 'from-violet-500/20 to-indigo-500/20 border-violet-500/20 text-violet-400'
    },
    {
      label: 'Average Latency',
      value: `${analytics.avgLatency} ms`,
      change: 'CascadeFlow optimized',
      icon: Clock,
      color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/20 text-blue-400'
    },
    {
      label: 'Accrued LLM Cost',
      value: `$${analytics.totalCost.toFixed(4)}`,
      change: `Saved $${analytics.savedCost.toFixed(4)} via routing`,
      icon: DollarSign,
      color: 'from-pink-500/20 to-purple-500/20 border-pink-500/20 text-pink-400'
    },
    {
      label: 'Memory Recall Rate',
      value: `${analytics.memoryRecallRate}%`,
      change: 'Hindsight semantic hits',
      icon: BrainCircuit,
      color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/20 text-emerald-400'
    }
  ];

  return (
    <div className="space-y-8 text-left">
      
      {/* Title section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white font-outfit">
            System Operations
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Real-time insights across prompt library versions, memory cache hits, and adaptive routes.
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => onNavigate('playground')}
            className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg shadow-violet-500/15"
          >
            <Sparkles className="w-4 h-4" />
            Launch Playground
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <div 
              key={index}
              className={`p-6 rounded-2xl border bg-gradient-to-tr ${kpi.color} backdrop-blur-md relative overflow-hidden`}
            >
              <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-5 pointer-events-none">
                <Icon className="w-32 h-32" />
              </div>
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-outfit">
                  {kpi.label}
                </span>
                <div className="p-2 bg-slate-950/60 rounded-xl border border-white/5">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold text-white font-mono">{kpi.value}</h3>
                <span className="text-[10px] text-slate-400 font-medium block mt-1.5 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                  {kpi.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Trend Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl border border-violet-500/10 bg-slate-900/20 backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-base font-semibold text-slate-200 font-outfit">Execution Metrics</h4>
              <p className="text-xs text-slate-500">Hourly throughput trends and average confidence ratings</p>
            </div>
            <div className="flex gap-2">
              <span className="flex items-center gap-1.5 text-xs text-violet-400 bg-violet-400/10 px-2.5 py-1 rounded-full border border-violet-400/15">
                <Zap className="w-3.5 h-3.5" /> High Activity
              </span>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRuns" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorQuality" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(139, 92, 246, 0.05)" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(10, 8, 20, 0.95)', 
                    borderColor: 'rgba(139, 92, 246, 0.2)',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#fff'
                  }} 
                />
                <Area type="monotone" dataKey="runs" name="Runs" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorRuns)" />
                <Area type="monotone" dataKey="quality" name="Quality Score (%)" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorQuality)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Cost Savings Chart */}
        <div className="p-6 rounded-2xl border border-violet-500/10 bg-slate-900/20 backdrop-blur-md flex flex-col justify-between">
          <div className="mb-6">
            <h4 className="text-base font-semibold text-slate-200 font-outfit">CascadeFlow Cost Savings</h4>
            <p className="text-xs text-slate-500">Saved expenditures utilizing dynamic model selection routing</p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(139, 92, 246, 0.05)" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(10, 8, 20, 0.95)', 
                    borderColor: 'rgba(139, 92, 246, 0.2)',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#fff'
                  }} 
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="cost" name="Actual Cost" fill="#ec4899" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Library Overview & Recent Logs split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Active Prompts Library list */}
        <div className="p-6 rounded-2xl border border-violet-500/10 bg-slate-900/20 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-base font-semibold text-slate-200 font-outfit">Prompt Library Overview</h4>
            <button 
              onClick={() => onNavigate('memory')}
              className="text-xs text-violet-400 hover:text-violet-300 font-semibold flex items-center gap-1 transition-colors"
            >
              Library <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-3.5 max-h-80 overflow-y-auto pr-1">
            {prompts.map(p => (
              <div 
                key={p.id} 
                className="p-3 bg-[#0d0922]/50 hover:bg-[#120e2e]/50 border border-violet-500/5 hover:border-violet-500/15 rounded-xl transition-all duration-200 group text-left cursor-pointer"
                onClick={() => onNavigate('playground')}
              >
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold text-slate-200 truncate pr-2 group-hover:text-violet-300">
                    {p.name}
                  </span>
                  <span className="text-[9px] bg-violet-500/15 text-violet-300 px-2 py-0.5 rounded-md font-mono font-bold">
                    V{p.version}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-2 mt-1.5 font-outfit">
                  {p.content}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[8px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded uppercase tracking-wider font-semibold">
                    {p.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Execution Logs */}
        <div className="lg:col-span-2 p-6 rounded-2xl border border-violet-500/10 bg-slate-900/20 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-base font-semibold text-slate-200 font-outfit">Recent Execution Pipeline Trace</h4>
            <button 
              onClick={() => onNavigate('logs')}
              className="text-xs text-violet-400 hover:text-violet-300 font-semibold flex items-center gap-1 transition-colors"
            >
              Audits <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-slate-300">
              <thead>
                <tr className="border-b border-violet-500/10 text-slate-400">
                  <th className="pb-3 font-semibold text-left font-outfit">Prompt (Trunc)</th>
                  <th className="pb-3 font-semibold text-left font-outfit">Model Target</th>
                  <th className="pb-3 font-semibold text-right font-outfit">Latency</th>
                  <th className="pb-3 font-semibold text-right font-outfit">Cost</th>
                  <th className="pb-3 font-semibold text-center font-outfit">Complexity</th>
                  <th className="pb-3 font-semibold text-center font-outfit">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-violet-500/5">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 pr-2 truncate max-w-xs font-mono text-[10px] text-slate-400">
                      {log.promptContent}
                    </td>
                    <td className="py-3 text-[10px] font-semibold text-violet-300">
                      {log.model.split('-')[0].toUpperCase()} <span className="text-slate-600 font-normal">...</span>
                    </td>
                    <td className="py-3 text-right font-mono font-semibold text-slate-300">
                      {log.latencyMs}ms
                    </td>
                    <td className="py-3 text-right font-mono text-slate-400">
                      ${log.cost.toFixed(5)}
                    </td>
                    <td className="py-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[8px] uppercase tracking-wider font-bold ${
                        log.complexity === 'complex' 
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                          : log.complexity === 'medium'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {log.complexity}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        log.status === 'success' ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {log.status === 'success' ? 'SUCCESS' : 'FAILED'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
