import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Search, 
  Trash2, 
  Eye, 
  Layers, 
  RefreshCw,
  Clock,
  Coins,
  Cpu,
  X,
  AlertOctagon,
  CheckCircle2
} from 'lucide-react';
import { api } from '../api';
import { ExecutionLog } from '../types';

interface RuntimeLogsProps {
  refreshTrigger: number;
}

export default function RuntimeLogs({ refreshTrigger }: RuntimeLogsProps) {
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [query, setQuery] = useState('');
  const [modelFilter, setModelFilter] = useState('All');
  const [complexityFilter, setComplexityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedLog, setSelectedLog] = useState<ExecutionLog | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadLogs() {
    try {
      setLoading(true);
      const l = await api.getLogs();
      setLogs(l);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLogs();
  }, [refreshTrigger]);

  const handleClearLogs = async () => {
    if (!confirm("Are you sure you want to purge all execution logs? This cannot be undone.")) return;
    try {
      await api.clearLogs();
      loadLogs();
    } catch (err) {
      console.error(err);
    }
  };

  // Filter logs
  const filteredLogs = logs.filter(log => {
    const q = query.toLowerCase();
    const matchesQuery = 
      log.promptContent.toLowerCase().includes(q) || 
      (log.response && log.response.toLowerCase().includes(q)) || 
      (log.routingReason && log.routingReason.toLowerCase().includes(q));

    const matchesModel = modelFilter === 'All' || log.model.includes(modelFilter.toLowerCase());
    const matchesComplexity = complexityFilter === 'All' || log.complexity.toLowerCase() === complexityFilter.toLowerCase();
    const matchesStatus = statusFilter === 'All' || log.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesQuery && matchesModel && matchesComplexity && matchesStatus;
  });

  return (
    <div className="space-y-8 text-left">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white font-outfit">
            Runtime Logs
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Audit logs detailing the execution pipeline metrics, routing decisions, and token bills.
          </p>
        </div>
        <button
          onClick={handleClearLogs}
          disabled={logs.length === 0}
          className="px-4 py-2 bg-rose-600/10 hover:bg-rose-600/20 border border-rose-500/20 text-rose-400 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-semibold font-outfit rounded-xl transition-colors flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" /> Purge Logs
        </button>
      </div>

      {/* Filter panel */}
      <div className="p-6 rounded-2xl border border-violet-500/10 bg-slate-900/20 backdrop-blur-md space-y-4">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="w-4 h-4 text-slate-500" />
          </span>
          <input 
            type="text" 
            placeholder="Search prompts contents, output text, or routing reasons..." 
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-violet-500/10 text-slate-200 text-xs focus:outline-none focus:border-violet-500/40 placeholder-slate-500"
          />
        </div>

        <div className="flex flex-wrap gap-4 text-xs font-outfit">
          <div className="space-y-1.5 flex flex-col">
            <label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Model Filter</label>
            <select
              value={modelFilter}
              onChange={e => setModelFilter(e.target.value)}
              className="px-3 py-2 rounded-lg bg-slate-950 border border-violet-500/10 text-slate-300 focus:outline-none"
            >
              <option value="All">All Models</option>
              <option value="llama-3.3-70b">Llama 3.3 70B</option>
              <option value="mixtral">Mixtral 8x7B</option>
              <option value="llama-3-8b">Llama 3 8B</option>
            </select>
          </div>

          <div className="space-y-1.5 flex flex-col">
            <label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Complexity</label>
            <select
              value={complexityFilter}
              onChange={e => setComplexityFilter(e.target.value)}
              className="px-3 py-2 rounded-lg bg-slate-950 border border-violet-500/10 text-slate-300 focus:outline-none"
            >
              <option value="All">All Complexities</option>
              <option value="Simple">Simple</option>
              <option value="Medium">Medium</option>
              <option value="Complex">Complex</option>
            </select>
          </div>

          <div className="space-y-1.5 flex flex-col">
            <label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Uptime Status</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-lg bg-slate-950 border border-violet-500/10 text-slate-300 focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Success">Success</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table view */}
      {loading ? (
        <div className="p-12 text-center bg-slate-900/20 rounded-2xl border border-violet-500/10 text-slate-400 animate-pulse h-64"></div>
      ) : filteredLogs.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/10 rounded-2xl border border-violet-500/10 text-slate-500 font-outfit">
          <Activity className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          No execution logs match your filter criteria.
        </div>
      ) : (
        <div className="rounded-2xl border border-violet-500/10 bg-[#090714]/80 backdrop-blur-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-slate-300">
              <thead>
                <tr className="border-b border-violet-500/10 text-slate-400 bg-slate-950/40">
                  <th className="p-4 font-semibold text-left font-outfit">Timestamp</th>
                  <th className="p-4 font-semibold text-left font-outfit">Prompt (Snippet)</th>
                  <th className="p-4 font-semibold text-left font-outfit">Selected Model</th>
                  <th className="p-4 font-semibold text-right font-outfit">Latency</th>
                  <th className="p-4 font-semibold text-right font-outfit">Tokens</th>
                  <th className="p-4 font-semibold text-right font-outfit">Cost</th>
                  <th className="p-4 font-semibold text-center font-outfit">Complexity</th>
                  <th className="p-4 font-semibold text-center font-outfit">Failover</th>
                  <th className="p-4 font-semibold text-center font-outfit">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-violet-500/5">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 text-[10px] text-slate-500 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="p-4 max-w-xs truncate font-mono text-[10px] text-slate-400">
                      {log.promptContent}
                    </td>
                    <td className="p-4 text-[10px] font-semibold text-violet-300 uppercase tracking-wide">
                      {log.model.replace('-versatile', '').replace('-8192', '')}
                    </td>
                    <td className="p-4 text-right font-mono font-semibold text-slate-300">
                      {log.latencyMs}ms
                    </td>
                    <td className="p-4 text-right font-mono text-slate-400 text-[10px]">
                      {log.tokensTotal} <span className="text-[9px] text-slate-600 font-normal">({log.tokensPrompt}p/{log.tokensCompletion}c)</span>
                    </td>
                    <td className="p-4 text-right font-mono text-slate-400">
                      ${log.cost.toFixed(5)}
                    </td>
                    <td className="p-4 text-center">
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
                    <td className="p-4 text-center">
                      {log.fallbackUsed ? (
                        <span className="text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded text-[9px] font-bold">
                          RETRY/SW
                        </span>
                      ) : (
                        <span className="text-slate-500 font-mono text-[10px]">-</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => setSelectedLog(log)}
                        className="p-1.5 bg-slate-950 rounded hover:border-violet-500/30 border border-violet-500/5 text-slate-400 hover:text-slate-200 transition-colors"
                        title="View Full Payload Trace"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-slate-900/90 border border-violet-500/20 rounded-2xl overflow-hidden shadow-2xl p-6 space-y-6 text-left relative animate-in fade-in zoom-in-95 duration-200">
            
            <button 
              onClick={() => setSelectedLog(null)}
              className="absolute top-4 right-4 p-2 bg-slate-950/80 hover:bg-slate-950 text-slate-500 hover:text-slate-300 rounded-lg transition-colors border border-white/5"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-violet-600/10 border border-violet-500/20 rounded-xl">
                <Cpu className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-200 font-outfit">Execution Trace Log</h3>
                <p className="text-xs text-slate-500 mt-0.5">UID: {selectedLog.id} • Registered at {new Date(selectedLog.timestamp).toLocaleTimeString()}</p>
              </div>
            </div>

            {/* Diagnostic stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3 bg-slate-950 rounded-xl border border-violet-500/5 flex flex-col text-left">
                <span className="text-[9px] text-slate-500 uppercase tracking-wider">Model Routed</span>
                <span className="text-xs font-bold text-slate-200 font-mono mt-1">{selectedLog.model}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-violet-500/5 flex flex-col text-left">
                <span className="text-[9px] text-slate-500 uppercase tracking-wider">Total Latency</span>
                <span className="text-xs font-bold text-slate-200 font-mono mt-1">{selectedLog.latencyMs}ms</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-violet-500/5 flex flex-col text-left">
                <span className="text-[9px] text-slate-500 uppercase tracking-wider">Accrued Cost</span>
                <span className="text-xs font-bold text-slate-200 font-mono mt-1">${selectedLog.cost.toFixed(5)}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-violet-500/5 flex flex-col text-left">
                <span className="text-[9px] text-slate-500 uppercase tracking-wider">Router confidence</span>
                <span className="text-xs font-bold text-slate-200 font-mono mt-1">{(selectedLog.confidenceScore * 100).toFixed(0)}%</span>
              </div>
            </div>

            {/* Prompt and response splits */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sent Prompt</label>
                <div className="p-4 bg-slate-950 rounded-xl border border-violet-500/5 text-slate-300 font-mono text-xs overflow-y-auto max-h-60 select-text whitespace-pre-wrap">
                  {selectedLog.promptContent}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Received Response</label>
                <div className="p-4 bg-slate-950 rounded-xl border border-violet-500/5 text-slate-300 font-mono text-xs overflow-y-auto max-h-60 select-text whitespace-pre-wrap">
                  {selectedLog.response}
                </div>
              </div>
            </div>

            {/* Router reason details */}
            <div className="p-4 bg-slate-950 rounded-xl border border-violet-500/5 text-left">
              <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wider block mb-1 font-outfit">CascadeFlow Routing Report</span>
              <p className="text-xs text-slate-400 leading-relaxed">{selectedLog.routingReason}</p>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
