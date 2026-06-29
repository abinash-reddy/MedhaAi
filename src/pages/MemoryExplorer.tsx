import React, { useState, useEffect } from 'react';
import { 
  Search, 
  BrainCircuit, 
  Star, 
  Trash2, 
  Eye, 
  Sparkles,
  Award,
  Zap,
  RefreshCw,
  X,
  ArrowUpRight
} from 'lucide-react';
import { api } from '../api';
import { MemoryItem } from '../types';

interface MemoryExplorerProps {
  onLoadToPlayground: (content: string) => void;
  refreshTrigger: number;
}

export default function MemoryExplorer({ onLoadToPlayground, refreshTrigger }: MemoryExplorerProps) {
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMemory, setSelectedMemory] = useState<MemoryItem | null>(null);
  const [loading, setLoading] = useState(false);

  const categories = [
    'All', 'Coding', 'Writing', 'Research', 'Marketing', 'Business', 'Education', 'Design', 'General'
  ];

  async function loadMemories() {
    try {
      setLoading(true);
      const m = await api.getMemories(query, selectedCategory === 'All' ? '' : selectedCategory);
      setMemories(m);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMemories();
  }, [query, selectedCategory, refreshTrigger]);

  const handleFavorite = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.toggleFavoriteMemory(id);
      loadMemories();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this hindsight cache record?")) return;
    try {
      await api.deleteMemory(id);
      loadMemories();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 text-left relative">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white font-outfit">
            Hindsight Memory Explorer
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Search and catalog cached executions indexed by the Medha semantic similarity matcher.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-6 rounded-2xl border border-violet-500/10 bg-slate-900/20 backdrop-blur-md space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="w-4 h-4 text-slate-500" />
            </span>
            <input 
              type="text" 
              placeholder="Search semantic indices by prompt, response, or metadata tags..." 
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-violet-500/10 text-slate-200 text-xs focus:outline-none focus:border-violet-500/40 placeholder-slate-500"
            />
          </div>
          <button 
            onClick={loadMemories}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-900/60 border border-violet-500/10 text-slate-400 hover:text-slate-200 rounded-xl transition-colors text-xs font-semibold flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Cache
          </button>
        </div>
        
        {/* Categories filters */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-violet-500/5">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-outfit border transition-all ${
                selectedCategory === cat
                  ? 'bg-violet-600/15 border-violet-500 text-violet-300'
                  : 'bg-slate-950/60 border-violet-500/5 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-44 bg-slate-900/40 rounded-2xl border border-violet-500/5"></div>
          ))}
        </div>
      ) : memories.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/10 rounded-2xl border border-violet-500/10 text-slate-500 font-outfit">
          <BrainCircuit className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          No hindsight cached memories matched your search index query.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {memories.map(mem => (
            <div 
              key={mem.id}
              onClick={() => setSelectedMemory(mem)}
              className="p-6 rounded-2xl border border-violet-500/10 bg-slate-900/20 backdrop-blur-md hover:border-violet-500/30 hover:bg-slate-900/40 transition-all duration-300 cursor-pointer text-left flex flex-col justify-between h-48 relative overflow-hidden group"
            >
              {/* Highlight background lines */}
              <div className="absolute right-0 top-0 translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-tr from-violet-500/5 to-indigo-500/5 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-500"></div>
              
              <div>
                <div className="flex justify-between items-start">
                  <div className="flex gap-2">
                    <span className="bg-violet-500/10 text-violet-300 text-[8px] uppercase tracking-wider font-bold px-2 py-0.5 rounded border border-violet-500/15">
                      {mem.category}
                    </span>
                    <span className="bg-slate-900 text-slate-400 text-[8px] font-mono font-bold px-2 py-0.5 rounded">
                      Hits: {mem.reuseCount}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => handleFavorite(mem.id, e)}
                      className="p-1 bg-slate-950 rounded hover:text-amber-400 transition-colors"
                    >
                      <Star className={`w-3.5 h-3.5 ${mem.isFavorite ? 'text-amber-400 fill-amber-400' : 'text-slate-500'}`} />
                    </button>
                    <button 
                      onClick={(e) => handleDelete(mem.id, e)}
                      className="p-1 bg-slate-950 rounded hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-slate-500 hover:text-rose-400" />
                    </button>
                  </div>
                </div>

                <h4 className="text-xs font-bold text-slate-200 mt-3 font-mono line-clamp-1">
                  {mem.prompt}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1.5 font-outfit line-clamp-2 leading-relaxed">
                  {mem.response}
                </p>
              </div>

              <div className="flex justify-between items-center border-t border-violet-500/5 pt-3 mt-2 text-[10px] text-slate-500 font-mono">
                <span className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-emerald-400" /> Quality: <strong className="text-slate-300">{mem.qualityScore}%</strong>
                </span>
                <span className="flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-violet-400" /> Similar: <strong className="text-slate-300">{(mem.similarityScore * 100).toFixed(0)}%</strong>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Memory Viewer Modal */}
      {selectedMemory && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-slate-900/90 border border-violet-500/20 rounded-2xl overflow-hidden shadow-2xl p-6 space-y-6 text-left relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setSelectedMemory(null)}
              className="absolute top-4 right-4 p-2 bg-slate-950/80 hover:bg-slate-950 text-slate-500 hover:text-slate-300 rounded-lg transition-colors border border-white/5"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-violet-600/10 border border-violet-500/20 rounded-xl">
                <BrainCircuit className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-200 font-outfit">Hindsight Index Details</h3>
                <p className="text-xs text-slate-500 mt-0.5">Prompt cache data loaded on {new Date(selectedMemory.timestamp).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cached Prompt input</span>
                <div className="p-4 bg-slate-950 rounded-xl border border-violet-500/5 text-slate-300 font-mono text-xs overflow-y-auto max-h-72 select-text">
                  {selectedMemory.prompt}
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Saved Response payload</span>
                <div className="p-4 bg-slate-950 rounded-xl border border-violet-500/5 text-slate-300 font-mono text-xs overflow-y-auto max-h-72 select-text">
                  {selectedMemory.response}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-violet-500/10 pt-4">
              <div className="flex gap-4 text-xs font-mono text-slate-400">
                <span>Importance: <strong className="text-slate-300">{selectedMemory.importance}/10</strong></span>
                <span>Hits: <strong className="text-slate-300">{selectedMemory.reuseCount}</strong></span>
                <span>Category: <strong className="text-slate-300">{selectedMemory.category}</strong></span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    onLoadToPlayground(selectedMemory.prompt);
                    setSelectedMemory(null);
                  }}
                  className="px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs font-semibold font-outfit rounded-xl transition-all duration-200 flex items-center gap-1.5 shadow-lg shadow-violet-500/10"
                >
                  Load in Playground <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
