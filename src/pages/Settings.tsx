import React, { useEffect, useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Save, 
  CheckCircle,
  Eye,
  EyeOff,
  Database,
  Lock,
  Sliders,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { api } from '../api';
import { SystemSettings } from '../types';

interface SettingsProps {
  onSave: () => void;
  refreshTrigger: number;
}

export default function Settings({ onSave, refreshTrigger }: SettingsProps) {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [banner, setBanner] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        const s = await api.getSettings();
        setSettings(s);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, [refreshTrigger]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      setSaving(true);
      await api.updateSettings(settings);
      setBanner(true);
      setTimeout(() => setBanner(false), 2000);
      onSave(); // notify parent
    } catch (err) {
      console.error(err);
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof SystemSettings, value: any) => {
    if (!settings) return;
    setSettings({
      ...settings,
      [field]: value
    });
  };

  if (loading || !settings) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-slate-900/60 w-1/4 rounded-lg"></div>
        <div className="h-64 bg-slate-900/40 rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left">
      
      {/* Title */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white font-outfit">
          System Settings
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Manage system budget limits, defaults, neural cache thresholds, and keys.
        </p>
      </div>

      {banner && (
        <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-semibold font-outfit flex items-center gap-2">
          <CheckCircle className="w-4 h-4" /> Platform settings updated successfully.
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: General config */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* General settings panel */}
          <div className="p-6 rounded-2xl border border-violet-500/10 bg-slate-900/20 backdrop-blur-md space-y-6">
            <div className="flex items-center gap-2 border-b border-violet-500/10 pb-3">
              <Sliders className="w-4 h-4 text-violet-400" />
              <h3 className="text-sm font-semibold text-slate-200 font-outfit">Pipeline Options</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Default Model</label>
                <select
                  value={settings.defaultModel}
                  onChange={e => updateField('defaultModel', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-violet-500/10 text-slate-300 text-xs focus:outline-none focus:border-violet-500/40"
                >
                  <option value="llama-3.3-70b-versatile">Llama 3.3 70B (Complex)</option>
                  <option value="gemma2-9b-it">Gemma 2 9B (Medium)</option>
                  <option value="llama-3.1-8b-instant">Llama 3.1 8B (Simple)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Adaptive Route Mode</label>
                <select
                  value={settings.routingMode}
                  onChange={e => updateField('routingMode', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-violet-500/10 text-slate-300 text-xs focus:outline-none focus:border-violet-500/40"
                >
                  <option value="balanced">Balanced (Intelligence & Latency)</option>
                  <option value="cost-optimized">Cost Optimized (Saves tokens)</option>
                  <option value="speed-optimized">Speed Optimized (Lowest Latency)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Default Temperature</label>
                <input 
                  type="number" 
                  step="0.1" 
                  min="0" 
                  max="1.5"
                  value={settings.defaultTemperature}
                  onChange={e => updateField('defaultTemperature', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-violet-500/10 text-slate-300 text-xs focus:outline-none focus:border-violet-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Workspace Theme</label>
                <select
                  value={settings.theme}
                  onChange={e => updateField('theme', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-violet-500/10 text-slate-300 text-xs focus:outline-none"
                >
                  <option value="dark">Dark Theme (Medha Purple)</option>
                  <option value="light">Light Theme</option>
                  <option value="system">System Settings</option>
                </select>
              </div>

            </div>

            {/* Checkbox triggers */}
            <div className="space-y-4 pt-4 border-t border-violet-500/5">
              
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.enableMemory}
                  onChange={e => updateField('enableMemory', e.target.checked)}
                  className="w-4 h-4 rounded accent-violet-500 bg-slate-950 border-violet-500/10"
                />
                <div>
                  <span className="text-xs font-semibold text-slate-300 font-outfit block">Enable Hindsight Memory</span>
                  <span className="text-[10px] text-slate-500">Enable local caching and semantic similarity checks on raw prompts</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer border-t border-violet-500/5 pt-3">
                <input 
                  type="checkbox" 
                  checked={settings.enableCascadeFlow}
                  onChange={e => updateField('enableCascadeFlow', e.target.checked)}
                  className="w-4 h-4 rounded accent-violet-500 bg-slate-950 border-violet-500/10"
                />
                <div>
                  <span className="text-xs font-semibold text-slate-300 font-outfit block">Enable CascadeFlow Routing</span>
                  <span className="text-[10px] text-slate-500">Automatically inspect prompt syntax complexity and route requests to optimal model tiers</span>
                </div>
              </label>

            </div>
          </div>

          {/* Budget Limits and API Secrets */}
          <div className="p-6 rounded-2xl border border-violet-500/10 bg-slate-900/20 backdrop-blur-md space-y-6">
            <div className="flex items-center gap-2 border-b border-violet-500/10 pb-3">
              <Lock className="w-4 h-4 text-violet-400" />
              <h3 className="text-sm font-semibold text-slate-200 font-outfit">Credentials & Limits</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Monthly Budget ($)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                  </span>
                  <input 
                    type="number" 
                    value={settings.monthlyBudget}
                    onChange={e => updateField('monthlyBudget', parseFloat(e.target.value))}
                    className="w-full pl-8 pr-3 py-2 rounded-lg bg-slate-950 border border-violet-500/10 text-slate-300 text-xs focus:outline-none focus:border-violet-500/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Groq API Key</label>
                <div className="relative">
                  <input 
                    type={showKey ? 'text' : 'password'} 
                    value={settings.apiKey}
                    onChange={e => updateField('apiKey', e.target.value)}
                    placeholder="gsk_..."
                    className="w-full pr-10 pl-3 py-2 rounded-lg bg-slate-950 border border-violet-500/10 text-slate-300 text-xs focus:outline-none focus:border-violet-500/40 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-300"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Right Side: Similarity Metrics (col span 1) */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-violet-500/10 bg-slate-900/20 backdrop-blur-md space-y-4">
            <div className="flex items-center gap-2 border-b border-violet-500/10 pb-3">
              <Database className="w-4 h-4 text-violet-400" />
              <h3 className="text-sm font-semibold text-slate-200 font-outfit">Hindsight Index Tuning</h3>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="font-semibold text-slate-400 uppercase tracking-wider">Similarity Cache Threshold</label>
                  <span className="font-mono text-violet-400 font-semibold">{(settings.similarityThreshold * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="0.99"
                  step="0.01"
                  value={settings.similarityThreshold}
                  onChange={e => updateField('similarityThreshold', parseFloat(e.target.value))}
                  className="w-full accent-violet-500 bg-slate-950 rounded-lg appearance-none h-1.5"
                />
              </div>

              <div className="p-3 bg-violet-600/5 rounded-xl border border-violet-500/10 space-y-2 leading-relaxed">
                <div className="flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-violet-400" />
                  <span className="font-bold text-violet-400 font-outfit">Threshold Impact</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Higher threshold values require greater semantic string alignment before recalling responses. Lowering the threshold boosts cache hits but may return slightly misaligned responses.
                </p>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold rounded-xl text-center text-xs transition-colors flex justify-center items-center gap-2 shadow-lg shadow-violet-500/15"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Updating Settings...' : 'Save Configuration'}
              </button>
            </div>
          </div>
        </div>

      </form>

    </div>
  );
}
