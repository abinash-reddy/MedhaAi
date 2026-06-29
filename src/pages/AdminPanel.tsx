import React, { useEffect, useState } from 'react';
import { 
  ShieldAlert, 
  Users, 
  Database, 
  Terminal, 
  Cpu, 
  Activity, 
  Lock,
  RefreshCw,
  HardDrive,
  AlertTriangle
} from 'lucide-react';
import { api } from '../api';
import { AdminStats } from '../types';

interface AdminPanelProps {
  refreshTrigger: number;
}

export default function AdminPanel({ refreshTrigger }: AdminPanelProps) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadStats() {
    try {
      setLoading(true);
      const s = await api.getAdminStats();
      setStats(s);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStats();
  }, [refreshTrigger]);

  const activeUsers = [
    { name: "John Doe", email: "j.doe@enterprise.com", role: "Prompt Ops Lead", activeWorkspace: "Production", status: "online" },
    { name: "Jane Smith", email: "j.smith@enterprise.com", role: "LLM Engineer", activeWorkspace: "Staging", status: "online" },
    { name: "Medha Admin", email: "admin@medha.ai", role: "Super Administrator", activeWorkspace: "Global Pipeline", status: "online" },
  ];

  const dbTables = [
    { tableName: "prompts", rowsCount: stats?.promptsCount || 4, indexSize: "16 KB", tableSize: "24 KB" },
    { tableName: "versions", rowsCount: stats?.versionsCount || 5, indexSize: "32 KB", tableSize: "40 KB" },
    { tableName: "logs", rowsCount: stats?.logsCount || 4, indexSize: "128 KB", tableSize: "192 KB" },
    { tableName: "memories", rowsCount: stats?.memoriesCount || 4, indexSize: "64 KB", tableSize: "88 KB" },
  ];

  const platformAlerts = [
    { type: "INFO", message: "Hindsight similarity indexing completed successfully.", time: "10 mins ago" },
    { type: "WARNING", message: "Llama-3.3-70B API latency spiked by 18% above rolling average.", time: "2 hours ago" },
    { type: "INFO", message: "Medha JSON database backed up to local storage.", time: "1 day ago" },
    { type: "CRITICAL", message: "Supabase authentication handshake required user refresh.", time: "3 days ago" }
  ];

  if (loading || !stats) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-slate-900/60 w-1/4 rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-900/40 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white font-outfit">
            Admin Panel
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Global system control metrics, database health states, and user sessions.
          </p>
        </div>
        <button 
          onClick={loadStats}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-900/60 border border-violet-500/10 text-slate-400 hover:text-slate-200 rounded-xl transition-colors text-xs font-semibold flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Pull Database Stats
        </button>
      </div>

      {/* Admin stats widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="p-5 rounded-2xl border border-violet-500/10 bg-slate-900/20 backdrop-blur-md flex items-center gap-4">
          <div className="p-3 bg-violet-600/10 border border-violet-500/20 text-violet-400 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Accessing Operators</span>
            <span className="text-lg font-bold text-slate-200 font-mono mt-0.5 block">{stats.totalUsers} accounts</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-violet-500/10 bg-slate-900/20 backdrop-blur-md flex items-center gap-4">
          <div className="p-3 bg-cyan-600/10 border border-cyan-500/20 text-cyan-400 rounded-xl">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Database Size</span>
            <span className="text-lg font-bold text-slate-200 font-mono mt-0.5 block">{stats.dbSizeKb} KB</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-violet-500/10 bg-slate-900/20 backdrop-blur-md flex items-center gap-4">
          <div className="p-3 bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Runs Today</span>
            <span className="text-lg font-bold text-slate-200 font-mono mt-0.5 block">{stats.apiCallsToday} requests</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-violet-500/10 bg-slate-900/20 backdrop-blur-md flex items-center gap-4">
          <div className="p-3 bg-pink-600/10 border border-pink-500/20 text-pink-400 rounded-xl">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Supabase Status</span>
            <span className="text-xs font-bold text-emerald-400 font-outfit mt-1 block truncate">
              {stats.supabaseStatus.split(' ')[0]}
            </span>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* User Sessions List (Left col span 2) */}
        <div className="lg:col-span-2 p-6 rounded-2xl border border-violet-500/10 bg-slate-900/20 backdrop-blur-md space-y-4">
          <h3 className="text-sm font-semibold text-slate-200 font-outfit">Active User Sessions</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-slate-300">
              <thead>
                <tr className="border-b border-violet-500/10 text-slate-400 pb-2">
                  <th className="pb-3 text-left font-semibold">User</th>
                  <th className="pb-3 text-left font-semibold">Operational Role</th>
                  <th className="pb-3 text-left font-semibold">Target Workspace</th>
                  <th className="pb-3 text-center font-semibold">Uptime Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-violet-500/5">
                {activeUsers.map((user, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="py-3">
                      <div className="flex flex-col text-left">
                        <span className="font-semibold text-slate-200">{user.name}</span>
                        <span className="text-[9px] text-slate-500">{user.email}</span>
                      </div>
                    </td>
                    <td className="py-3 text-slate-300 font-outfit">{user.role}</td>
                    <td className="py-3">
                      <span className="bg-violet-500/10 border border-violet-500/20 text-violet-300 px-2 py-0.5 rounded text-[10px] font-semibold">
                        {user.activeWorkspace}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <span className="text-emerald-400 font-bold text-[9px] bg-emerald-500/10 px-2 py-0.5 rounded">
                        {user.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System alerts logs (Right col span 1) */}
        <div className="p-6 rounded-2xl border border-violet-500/10 bg-slate-900/20 backdrop-blur-md space-y-4">
          <h3 className="text-sm font-semibold text-slate-200 font-outfit">Platform System Alerts</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {platformAlerts.map((alert, idx) => (
              <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-violet-500/5 text-left space-y-1">
                <div className="flex justify-between items-center">
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                    alert.type === 'CRITICAL' 
                      ? 'bg-rose-500/25 text-rose-300' 
                      : alert.type === 'WARNING'
                        ? 'bg-amber-500/25 text-amber-300'
                        : 'bg-indigo-500/25 text-indigo-300'
                  }`}>
                    {alert.type}
                  </span>
                  <span className="text-[9px] text-slate-600 font-mono">{alert.time}</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-normal">{alert.message}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Database Schema health */}
      <div className="p-6 rounded-2xl border border-violet-500/10 bg-slate-900/20 backdrop-blur-md space-y-4">
        <div className="flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-violet-400" />
          <h3 className="text-sm font-semibold text-slate-200 font-outfit">Local JSON Database Tables</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-slate-300">
            <thead>
              <tr className="border-b border-violet-500/10 text-slate-400 pb-2">
                <th className="pb-3 text-left font-semibold">Table Identifier</th>
                <th className="pb-3 text-right font-semibold">Row Count</th>
                <th className="pb-3 text-right font-semibold">Index Size</th>
                <th className="pb-3 text-right font-semibold">Table Size</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-violet-500/5 font-mono text-[11px]">
              {dbTables.map((table, idx) => (
                <tr key={idx} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 text-left font-semibold text-violet-300">{table.tableName}</td>
                  <td className="py-3 text-right text-slate-300">{table.rowsCount} records</td>
                  <td className="py-3 text-right text-slate-500">{table.indexSize}</td>
                  <td className="py-3 text-right text-slate-400">{table.tableSize}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
