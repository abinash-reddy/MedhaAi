import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Playground from './pages/Playground';
import PromptComparison from './pages/PromptComparison';
import PromptEvolution from './pages/PromptEvolution';
import MemoryExplorer from './pages/MemoryExplorer';
import RuntimeLogs from './pages/RuntimeLogs';
import Analytics from './pages/Analytics';
import Architecture from './pages/Architecture';
import Settings from './pages/Settings';
import AdminPanel from './pages/AdminPanel';

import { api } from './api';
import { SystemSettings } from './types';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [avgLatency, setAvgLatency] = useState(420);
  const [totalCost, setTotalCost] = useState(1.12);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch header stats & settings
  useEffect(() => {
    async function loadGlobalStats() {
      try {
        const [sett, analytics] = await Promise.all([
          api.getSettings(),
          api.getAnalytics()
        ]);
        setSettings(sett);
        setAvgLatency(analytics.avgLatency || 420);
        setTotalCost(analytics.totalCost || 0);
      } catch (err) {
        console.error("Global header stats load failed", err);
      }
    }
    loadGlobalStats();
  }, [refreshTrigger]);

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Render active page tab
  const renderActiveTab = () => {
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentTab} refreshTrigger={refreshTrigger} />;
      case 'playground':
        return (
          <Playground 
            onRunFinished={triggerRefresh} 
            refreshTrigger={refreshTrigger} 
          />
        );
      case 'comparison':
        return <PromptComparison />;
      case 'evolution':
        return <PromptEvolution />;
      case 'memory':
        return (
          <MemoryExplorer 
            onLoadToPlayground={(prompt) => {
              setCurrentTab('playground');
              
              // We delay loading slightly to allow playground mounting
              setTimeout(() => {
                const el = document.querySelector('textarea');
                if (el) {
                  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")?.set;
                  if (nativeInputValueSetter) {
                    nativeInputValueSetter.call(el, prompt);
                    el.dispatchEvent(new Event('input', { bubbles: true }));
                  }
                }
              }, 100);
            }} 
            refreshTrigger={refreshTrigger}
          />
        );
      case 'logs':
        return <RuntimeLogs refreshTrigger={refreshTrigger} />;
      case 'analytics':
        return <Analytics refreshTrigger={refreshTrigger} />;
      case 'architecture':
        return <Architecture />;
      case 'settings':
        return <Settings onSave={triggerRefresh} refreshTrigger={refreshTrigger} />;
      case 'admin':
        return <AdminPanel refreshTrigger={refreshTrigger} />;
      default:
        return <Dashboard onNavigate={setCurrentTab} refreshTrigger={refreshTrigger} />;
    }
  };

  if (!settings) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#030014] text-slate-400 font-outfit">
        <div className="flex flex-col items-center gap-3 animate-pulse">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-violet-500"></span>
          </span>
          <span className="text-xs uppercase tracking-wider font-semibold">Initializing Medha Engines...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030014] text-slate-200 selection:bg-violet-500/30 selection:text-violet-300">
      
      {/* Sidebar navigation */}
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Main Content Area */}
      <div className="pl-64 flex flex-col min-h-screen">
        
        {/* Top Header */}
        <Header 
          settings={settings} 
          avgLatency={avgLatency} 
          totalCost={totalCost} 
        />

        {/* View Content Wrapper */}
        <main className="flex-1 mt-16 p-8 overflow-y-auto">
          {renderActiveTab()}
        </main>

      </div>

    </div>
  );
}
