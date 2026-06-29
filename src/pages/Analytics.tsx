import React, { useEffect, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { api } from '../api';
import { AnalyticsSummary } from '../types';
import { Brain, TrendingUp, Zap, Clock, Coins, RefreshCw } from 'lucide-react';

interface AnalyticsProps {
  refreshTrigger: number;
}

export default function Analytics({ refreshTrigger }: AnalyticsProps) {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadAnalytics() {
    try {
      setLoading(true);
      const a = await api.getAnalytics();
      setData(a);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnalytics();
  }, [refreshTrigger]);

  if (loading || !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-slate-900/60 w-1/4 rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-80 bg-slate-900/40 rounded-2xl"></div>
          <div className="h-80 bg-slate-900/40 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  // Color lists matching purple-blue dark theme
  const COLORS = ['#8b5cf6', '#3b82f6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#6366f1', '#a855f7'];

  return (
    <div className="space-y-8 text-left">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white font-outfit">
            System Analytics
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Aggregated diagnostics showing model weights, token billing scales, and hindsight cache efficiency.
          </p>
        </div>
        <button 
          onClick={loadAnalytics}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-900/60 border border-violet-500/10 text-slate-400 hover:text-slate-200 rounded-xl transition-colors text-xs font-semibold flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Recompute Analytics
        </button>
      </div>

      {/* Stats summary banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-5 rounded-2xl border border-violet-500/10 bg-slate-900/20 backdrop-blur-md">
          <span className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold block">Total Runs</span>
          <span className="text-xl font-bold text-slate-200 font-mono block mt-1">{data.totalRuns} runs</span>
        </div>
        <div className="p-5 rounded-2xl border border-violet-500/10 bg-slate-900/20 backdrop-blur-md">
          <span className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold block">Avg LLM Cost</span>
          <span className="text-xl font-bold text-slate-200 font-mono block mt-1">${data.avgCost.toFixed(5)}</span>
        </div>
        <div className="p-5 rounded-2xl border border-violet-500/10 bg-slate-900/20 backdrop-blur-md">
          <span className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold block">Accrued Savings</span>
          <span className="text-xl font-bold text-emerald-400 font-mono block mt-1">${data.savedCost.toFixed(4)}</span>
        </div>
        <div className="p-5 rounded-2xl border border-violet-500/10 bg-slate-900/20 backdrop-blur-md">
          <span className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold block">Cache Hits</span>
          <span className="text-xl font-bold text-violet-400 font-mono block mt-1">{data.memoryRecallRate}%</span>
        </div>
      </div>

      {/* Latency and volume trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Latency Drift */}
        <div className="p-6 rounded-2xl border border-violet-500/10 bg-slate-900/20 backdrop-blur-md">
          <h3 className="text-sm font-semibold text-slate-300 font-outfit mb-4">Pipeline Latency Drift</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(139, 92, 246, 0.05)" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0a0814', borderColor: 'rgba(139,92,246,0.2)', color: '#fff', fontSize: '11px' }} />
                <Line type="monotone" dataKey="latency" name="Latency (ms)" stroke="#06b6d4" strokeWidth={2.5} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Volume Trend */}
        <div className="p-6 rounded-2xl border border-violet-500/10 bg-slate-900/20 backdrop-blur-md">
          <h3 className="text-sm font-semibold text-slate-300 font-outfit mb-4">Daily Operations Volume</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="trendRuns" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(139, 92, 246, 0.05)" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0a0814', borderColor: 'rgba(139,92,246,0.2)', color: '#fff', fontSize: '11px' }} />
                <Area type="monotone" dataKey="runs" name="Runs" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#trendRuns)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Pie Chart distributions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Model distribution */}
        <div className="p-6 rounded-2xl border border-violet-500/10 bg-slate-900/20 backdrop-blur-md">
          <h3 className="text-sm font-semibold text-slate-300 font-outfit mb-4">AI Model Routing Share</h3>
          <div className="h-64 flex flex-col justify-between">
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.modelDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {data.modelDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0a0814', borderColor: 'rgba(139,92,246,0.2)', color: '#fff', fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 text-[10px] text-slate-400">
              {data.modelDistribution.map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                  <span className="font-mono">{item.name.replace('-versatile', '').toUpperCase()} ({item.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Category distribution */}
        <div className="p-6 rounded-2xl border border-violet-500/10 bg-slate-900/20 backdrop-blur-md">
          <h3 className="text-sm font-semibold text-slate-300 font-outfit mb-4">Prompt Library Categories</h3>
          <div className="h-64 flex flex-col justify-between">
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.categoryDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={0}
                    outerRadius={65}
                    dataKey="value"
                  >
                    {data.categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0a0814', borderColor: 'rgba(139,92,246,0.2)', color: '#fff', fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 text-[10px] text-slate-400">
              {data.categoryDistribution.map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[(idx + 3) % COLORS.length] }}></span>
                  <span>{item.name} ({item.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
