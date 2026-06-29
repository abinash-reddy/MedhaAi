import React from 'react';
import { 
  LayoutDashboard, 
  Terminal, 
  Columns, 
  GitBranch, 
  Brain, 
  Activity, 
  BarChart3, 
  Network, 
  Settings, 
  ShieldAlert, 
  Cpu
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export default function Sidebar({ currentTab, setCurrentTab }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'playground', label: 'Playground', icon: Terminal },
    { id: 'comparison', label: 'Prompt Comparison', icon: Columns },
    { id: 'evolution', label: 'Prompt Evolution', icon: GitBranch },
    { id: 'memory', label: 'Memory Explorer', icon: Brain },
    { id: 'logs', label: 'Runtime Logs', icon: Activity },
    { id: 'analytics', label: 'System Analytics', icon: BarChart3 },
    { id: 'architecture', label: 'System Architecture', icon: Network },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'admin', label: 'Admin Panel', icon: ShieldAlert },
  ];

  return (
    <aside className="w-64 h-screen border-r border-violet-500/10 bg-[#090714]/80 backdrop-blur-md flex flex-col fixed left-0 top-0 z-20">
      {/* Brand Logo Header */}
      <div className="p-6 border-b border-violet-500/10 flex items-center gap-3">
        <div className="p-2 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-xl shadow-lg shadow-violet-500/20">
          <Cpu className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white font-outfit leading-none">
            MEDHA AI
          </h1>
          <span className="text-[10px] text-violet-400 font-semibold tracking-widest uppercase">
            Prompt Intelligence
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-left ${
                isActive
                  ? 'bg-violet-600/15 border-l-2 border-violet-500 text-violet-300 font-medium'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-105 ${
                isActive ? 'text-violet-400' : 'text-slate-500 group-hover:text-slate-300'
              }`} />
              <span className="text-sm font-outfit">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Platform Version Footer */}
      <div className="p-4 border-t border-violet-500/10 bg-[#06040d]/40 flex flex-col items-center">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs text-slate-400 font-outfit">Hindsight Active</span>
        </div>
        <span className="text-[9px] text-slate-600 mt-1 font-mono">v1.2.0-stable</span>
      </div>
    </aside>
  );
}
