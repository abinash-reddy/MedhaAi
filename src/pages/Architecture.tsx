import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Terminal, 
  Sparkles, 
  BrainCircuit, 
  Network, 
  Cpu, 
  Send, 
  Database, 
  LineChart, 
  ArrowRight,
  Play,
  RotateCcw,
  BookOpen
} from 'lucide-react';

export default function Architecture() {
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const pipeline = [
    {
      id: 0,
      title: "User Prompt Editor",
      desc: "Engineering workspace where templates are created, parameter variables declared, and temperatures set.",
      icon: Terminal,
      color: "border-violet-500/30 text-violet-400 bg-violet-500/5",
      effect: "Analyzing syntax & tokens..."
    },
    {
      id: 1,
      title: "Prompt Optimizer",
      desc: "Semantic engine evaluating structural quality, role specification, constraint bounds, and format criteria.",
      icon: Sparkles,
      color: "border-fuchsia-500/30 text-fuchsia-400 bg-fuchsia-500/5",
      effect: "Injecting persona & output formats..."
    },
    {
      id: 2,
      title: "Hindsight Memory",
      desc: "Performs semantic similarity lookup (embedding overlap check). Returns context if query hit threshold.",
      icon: BrainCircuit,
      color: "border-emerald-500/30 text-emerald-400 bg-emerald-500/5",
      effect: "Querying semantic indices..."
    },
    {
      id: 3,
      title: "CascadeFlow Router",
      desc: "Classifies prompt complexity (simple/medium/complex) and dynamically targets performance criteria.",
      icon: Network,
      color: "border-cyan-500/30 text-cyan-400 bg-cyan-500/5",
      effect: "Evaluating routing variables..."
    },
    {
      id: 4,
      title: "Model Selector",
      desc: "Assigns request to Llama 3 8B, Mixtral 8x7B, or Llama 3.3 70B, maintaining system balance.",
      icon: Cpu,
      color: "border-blue-500/30 text-blue-400 bg-blue-500/5",
      effect: "Securing target model route..."
    },
    {
      id: 5,
      title: "Groq Cloud API",
      desc: "Sends compiled prompts over highly optimized API pipelines to secure lightning-fast LLM execution.",
      icon: Send,
      color: "border-pink-500/30 text-pink-400 bg-pink-500/5",
      effect: "Executing inference stream..."
    },
    {
      id: 6,
      title: "Memory Storage",
      desc: "Caches prompt-response pairs to local store / Supabase for future hindsight cache hits.",
      icon: Database,
      color: "border-teal-500/30 text-teal-400 bg-teal-500/5",
      effect: "Flushing logs to database..."
    },
    {
      id: 7,
      title: "Operations Analytics",
      desc: "Aggregates execution latency, token sizing, routing paths, and budget savings in system charts.",
      icon: LineChart,
      color: "border-indigo-500/30 text-indigo-400 bg-indigo-500/5",
      effect: "Aggregating performance reports..."
    }
  ];

  const handleSimulate = async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    
    for (let i = 0; i < pipeline.length; i++) {
      setActiveStep(i);
      await new Promise(resolve => setTimeout(resolve, 1400));
    }
    
    setActiveStep(null);
    setIsPlaying(false);
  };

  const handleReset = () => {
    setActiveStep(null);
    setIsPlaying(false);
  };

  return (
    <div className="space-y-8 text-left">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white font-outfit">
            System Architecture
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Pipeline layout mapping prompt compilation, cache evaluation, and model selection.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-900/60 border border-violet-500/10 text-slate-400 hover:text-slate-200 rounded-xl transition-colors text-xs font-semibold"
          >
            Reset
          </button>
          <button
            onClick={handleSimulate}
            disabled={isPlaying}
            className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 disabled:opacity-55 text-white text-xs font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg shadow-violet-500/15"
          >
            <Play className="w-3.5 h-3.5 fill-white" /> Simulate Pipeline Flow
          </button>
        </div>
      </div>

      {/* Main Grid Map */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* Left Side: Pipeline visual blocks */}
        <div className="xl:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-6 relative">
          
          {pipeline.map((node, idx) => {
            const Icon = node.icon;
            const isActive = activeStep === node.id;
            
            return (
              <motion.div
                key={node.id}
                layout
                animate={{
                  scale: isActive ? 1.02 : 1.0,
                  borderColor: isActive ? 'rgba(139, 92, 246, 0.6)' : 'rgba(139, 92, 246, 0.1)'
                }}
                transition={{ duration: 0.3 }}
                onClick={() => setActiveStep(node.id)}
                className={`p-6 rounded-2xl border text-left flex gap-4 cursor-pointer relative overflow-hidden transition-all duration-300 ${
                  isActive 
                    ? 'bg-slate-900/50 shadow-[0_0_25px_rgba(139,92,246,0.15)]' 
                    : 'bg-slate-900/10 hover:bg-slate-900/30'
                }`}
              >
                {/* Node Active Glow pulse */}
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/5 to-indigo-500/5 pointer-events-none animate-pulse"></div>
                )}
                
                <div className={`p-3 rounded-2xl border h-fit ${node.color}`}>
                  <Icon className="w-5 h-5 animate-pulse" />
                </div>
                
                <div className="space-y-1 z-10 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold tracking-wider uppercase text-slate-300 font-outfit">
                      Step {node.id + 1}: {node.title}
                    </h4>
                    {isActive && (
                      <span className="text-[8px] bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider animate-pulse">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
                    {node.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Right Side: Step Details & Trace Panel */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-violet-500/10 bg-slate-900/20 backdrop-blur-md space-y-4 min-h-[380px] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 border-b border-violet-500/10 pb-3 mb-4">
                <BookOpen className="w-4 h-4 text-violet-400" />
                <h4 className="text-sm font-semibold text-slate-200 font-outfit">Node Trace Diagnostics</h4>
              </div>

              <AnimatePresence mode="wait">
                {activeStep !== null ? (
                  <motion.div
                    key={activeStep}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div className="p-3 bg-violet-600/10 rounded-xl border border-violet-500/15">
                      <span className="text-[9px] text-slate-400 uppercase tracking-widest block">Operational State</span>
                      <span className="text-xs font-bold text-violet-300 font-mono mt-1 block">
                        {pipeline[activeStep].effect}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 space-y-2 leading-relaxed">
                      <h5 className="font-semibold text-slate-200 font-outfit">Action Process:</h5>
                      <p>{pipeline[activeStep].desc}</p>
                    </div>

                    <div className="bg-slate-950 p-3 rounded-lg border border-violet-500/5 text-[10px] font-mono text-slate-500">
                      SYS_STATE // CONNECTED<br />
                      TRACE_ID: {(Math.random() * 100000).toFixed(0)}<br />
                      BUFFER: OK
                    </div>
                  </motion.div>
                ) : (
                  <div className="text-center py-20 text-slate-500 text-xs flex flex-col items-center gap-3">
                    <Terminal className="w-10 h-10 text-slate-700 animate-pulse" />
                    <span>Select a step block or start simulation to inspect trace parameters.</span>
                  </div>
                )}
              </AnimatePresence>
            </div>

            {isPlaying && (
              <div className="bg-violet-950/20 p-3 rounded-xl border border-violet-500/10 flex items-center gap-3">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
                </span>
                <span className="text-[10px] text-violet-300 font-mono font-semibold">Simulating real-time pipeline...</span>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
