import React, { useState } from 'react';
import { 
  Bell, 
  Search, 
  Cpu, 
  Layers, 
  CheckCircle2, 
  Database,
  DollarSign
} from 'lucide-react';
import { SystemSettings } from '../types';

interface HeaderProps {
  settings: SystemSettings;
  avgLatency: number;
  totalCost: number;
}

export default function Header({ settings, avgLatency, totalCost }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  
  const notifications = [
    { id: 1, title: "Model Route Optimised", desc: "CascadeFlow routed 14 simple prompts to Llama 3 8B, saving $0.063.", time: "10 mins ago" },
    { id: 2, title: "Budget Threshold Alert", desc: "System cost is at 1.6% of monthly budget limit.", time: "2 hours ago" },
    { id: 3, title: "Hindsight Recall High", desc: "Memory similarity engine hit 88% cache efficiency on last query.", time: "1 day ago" }
  ];

  return (
    <header className="h-16 border-b border-violet-500/10 bg-[#06040f]/60 backdrop-blur-md flex items-center justify-between px-8 fixed top-0 right-0 left-64 z-10">
      
      {/* Search & Workspace Title */}
      <div className="flex items-center gap-6">
        <div className="relative w-64">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-4 h-4 text-slate-500" />
          </span>
          <input 
            type="text" 
            placeholder="Search prompts or logs..." 
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg bg-slate-900/60 border border-violet-500/10 focus:outline-none focus:border-violet-500/40 text-slate-300 placeholder-slate-500 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 border-l border-violet-500/10 pl-6">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Workspace:</span>
          <span className="text-xs bg-violet-500/10 border border-violet-500/20 text-violet-300 px-2.5 py-0.5 rounded-full font-medium font-outfit">
            Production Pipeline
          </span>
        </div>
      </div>

      {/* Center status indicators */}
      <div className="flex items-center gap-4">
        {/* Hindsight Active */}
        <div className="flex items-center gap-1.5 bg-[#090518]/60 px-3 py-1 rounded-full border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.05)]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[10px] font-medium text-emerald-400 font-outfit uppercase tracking-wider">
            Hindsight
          </span>
        </div>

        {/* CascadeFlow Active */}
        <div className="flex items-center gap-1.5 bg-[#090518]/60 px-3 py-1 rounded-full border border-violet-500/20 shadow-[0_0_10px_rgba(139,92,246,0.05)]">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse"></span>
          <span className="text-[10px] font-medium text-violet-400 font-outfit uppercase tracking-wider">
            CascadeFlow
          </span>
        </div>

        {/* AI Engine Ready */}
        <div className="flex items-center gap-1.5 bg-[#090518]/60 px-3 py-1 rounded-full border border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.05)]">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
          <span className="text-[10px] font-medium text-cyan-400 font-outfit uppercase tracking-wider">
            Engine Ready
          </span>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-6">
        
        {/* Real-time stats */}
        <div className="flex items-center gap-6 text-slate-400 text-xs font-outfit border-r border-violet-500/10 pr-6">
          <div className="flex flex-col items-end">
            <span className="text-[9px] text-slate-500 uppercase tracking-widest leading-none mb-0.5">Avg Latency</span>
            <span className="text-slate-200 font-semibold font-mono">{avgLatency}ms</span>
          </div>
          
          <div className="flex flex-col items-end">
            <span className="text-[9px] text-slate-500 uppercase tracking-widest leading-none mb-0.5">Budget Usage</span>
            <span className="text-slate-200 font-semibold font-mono flex items-center">
              ${totalCost.toFixed(3)} <span className="text-[10px] text-slate-500 font-normal">/ ${settings.monthlyBudget}</span>
            </span>
          </div>
          
          <div className="flex flex-col items-end">
            <span className="text-[9px] text-slate-500 uppercase tracking-widest leading-none mb-0.5">Router Target</span>
            <span className="text-violet-400 font-semibold uppercase text-[10px] tracking-wide">{settings.routingMode}</span>
          </div>
        </div>

        {/* Notifications Button */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg bg-slate-900/60 border border-violet-500/10 hover:border-violet-500/30 text-slate-400 hover:text-slate-200 transition-all duration-200"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-violet-500 shadow-[0_0_6px_rgba(139,92,246,0.8)]"></span>
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 rounded-xl border border-violet-500/15 bg-slate-950/95 backdrop-blur-md shadow-2xl p-4 space-y-3 z-50">
              <div className="flex items-center justify-between border-b border-violet-500/10 pb-2">
                <span className="text-xs font-semibold text-slate-200">System Logs</span>
                <span className="text-[10px] text-violet-400 hover:underline cursor-pointer">Mark all read</span>
              </div>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {notifications.map(n => (
                  <div key={n.id} className="text-left p-2 rounded-lg hover:bg-white/5 transition-colors">
                    <h4 className="text-xs font-semibold text-slate-300">{n.title}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{n.desc}</p>
                    <span className="text-[9px] text-slate-600 block mt-1">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 border border-violet-400/30 flex items-center justify-center font-bold text-white text-xs font-outfit shadow-md shadow-violet-500/10">
            MA
          </div>
          <div className="text-left hidden xl:block">
            <h4 className="text-xs font-semibold text-slate-200 leading-none">Medha Admin</h4>
            <span className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold block mt-0.5">Enterprise Dev</span>
          </div>
        </div>

      </div>
    </header>
  );
}
