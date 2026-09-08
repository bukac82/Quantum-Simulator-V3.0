import { useState, useEffect } from 'react';
import { Target, Play, Dices, Loader2, AlertCircle } from 'lucide-react';
import { Histogram } from '../components/Histogram';

export function QAOAAlgorithm() {
  const [qubits, setQubits] = useState(4);
  const [layers, setLayers] = useState(2);
  const [shots, setShots] = useState(1000);
  const [mixerType, setMixerType] = useState('Standard (X mixer)');
  const [warmStart, setWarmStart] = useState(false);
  const [edges, setEdges] = useState('[[0,1], [1,2], [2,3], [3,0], [0,2]]');
  
  const [results, setResults] = useState<{counts: Record<string, number>, executedShots: number, maxCutValue: number, bestCuts: string[], numQubits: number} | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRun = async () => {
    setLoading(true);
    setResults(null);
    setError(null);
    try {
      const res = await fetch('http://127.0.0.1:5000/simulate-qaoa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qubits, layers, shots, mixerType, warmStart, edges })
      });
      const data = await res.json();
      if (res.ok) {
        setResults(data);
      } else {
        setError(data.error || "Simulation failed.");
      }
    } catch(e) {
      console.error(e);
      setError("Failed to connect to the simulation server.");
    }
    setLoading(false);
  };
  
  useEffect(() => {
    handleRun();
  }, []);

  const generateRandomGraph = () => {
    const newEdges = [];
    for(let i=0; i<qubits; i++) {
       for(let j=i+1; j<qubits; j++) {
          if (Math.random() > 0.5) newEdges.push([i, j]);
       }
    }
    setEdges(JSON.stringify(newEdges));
  };

  return (
      <div className="w-full max-w-7xl mx-auto animate-in fade-in duration-500 relative space-y-8">
         {/* Background Glow */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-rose-500/20 blur-[120px] rounded-full pointer-events-none -z-10"></div>
         
         {/* Page Header */}
         <div className="flex items-center gap-5">
            <div className="w-16 h-16 relative shrink-0">
               <div className="absolute inset-0 bg-rose-500/20 blur-xl rounded-full"></div>
               <div className="relative w-full h-full bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-3 shadow-xl flex items-center justify-center">
                  <Target className="w-full h-full text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]" strokeWidth={1.5} />
               </div>
            </div>
            <div>
               <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-pink-500 drop-shadow-md">
                  QAOA (Quantum Approximate Optimization)
               </h1>
               <p className="text-slate-300 mt-2 text-lg drop-shadow">
                  Solve combinatorial optimization problems like Max-Cut on complex graphs.
               </p>
            </div>
         </div>

         <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column: Controls */}
            <div className="w-full lg:w-1/3 space-y-6">
               <div className="bg-slate-900/60 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl p-8 text-slate-200 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-pink-500"></div>
                  
                  <h3 className="text-xl font-bold text-white mb-6">Algorithm Parameters</h3>
                  
                  <div className="space-y-6">
                     <div className="space-y-2">
                        <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Number of Qubits (Vertices)</label>
                        <input 
                          type="number" 
                          value={qubits}
                          onChange={(e) => setQubits(Number(e.target.value))}
                          className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose-500/50 focus:ring-2 focus:ring-rose-500/20 transition-all font-mono"
                        />
                     </div>

                     <div className="space-y-2">
                        <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">QAOA Layers (p)</label>
                        <input 
                          type="number" 
                          value={layers}
                          onChange={(e) => setLayers(Number(e.target.value))}
                          className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose-500/50 focus:ring-2 focus:ring-rose-500/20 transition-all font-mono"
                        />
                     </div>

                     <div className="space-y-2">
                        <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Measurement Shots</label>
                        <input 
                          type="number" 
                          value={shots}
                          onChange={(e) => setShots(Number(e.target.value))}
                          className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose-500/50 focus:ring-2 focus:ring-rose-500/20 transition-all font-mono"
                        />
                     </div>

                     <div className="space-y-2">
                        <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Mixer Type</label>
                        <select 
                          value={mixerType}
                          onChange={(e) => setMixerType(e.target.value)}
                          className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose-500/50 focus:ring-2 focus:ring-rose-500/20 transition-all"
                        >
                          <option>Standard (X mixer)</option>
                          <option>XY Mixer</option>
                        </select>
                     </div>

                     <div className="flex items-center space-x-3 pt-2">
                        <div className="relative flex items-center justify-center">
                           <input
                              type="checkbox"
                              id="warmStart"
                              checked={warmStart}
                              onChange={(e) => setWarmStart(e.target.checked)}
                              className="peer sr-only"
                           />
                           <div className="w-11 h-6 bg-slate-800 rounded-full border border-slate-700 peer-checked:bg-rose-500/50 peer-checked:border-rose-500 transition-all"></div>
                           <div className="absolute left-1 top-1 w-4 h-4 bg-slate-400 rounded-full peer-checked:translate-x-5 peer-checked:bg-rose-400 transition-all shadow-md"></div>
                        </div>
                        <label htmlFor="warmStart" className="text-sm font-bold tracking-wider text-slate-300 uppercase cursor-pointer">
                           Classical Warm Start
                        </label>
                     </div>

                     <div className="space-y-2 pt-2">
                        <div className="flex justify-between items-center mb-1">
                           <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Graph Edges</label>
                           <button onClick={generateRandomGraph} className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-bold">
                              <Dices className="w-3 h-3" /> RANDOM
                           </button>
                        </div>
                        <textarea 
                          value={edges}
                          onChange={(e) => setEdges(e.target.value)}
                          rows={3}
                          className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-rose-500/50 focus:ring-2 focus:ring-rose-500/20 resize-y transition-all leading-relaxed"
                        />
                     </div>

                     <div className="pt-4 space-y-3">
                        <button
                           onClick={handleRun}
                           disabled={loading}
                           className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-sm py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(244,63,94,0.3)] hover:shadow-[0_0_30px_rgba(244,63,94,0.5)]"
                        >
                           {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
                           {loading ? 'OPTIMIZING...' : 'RUN QAOA'}
                        </button>
                        {error && (
                           <div className="text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center justify-center gap-2 text-xs font-bold text-center">
                              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                           </div>
                        )}
                     </div>
                  </div>
               </div>
            </div>

            {/* Right Column: Results */}
            <div className="w-full lg:w-2/3 flex flex-col">
               {results ? (
                  <div className="flex-1 flex flex-col gap-6 animate-in slide-in-from-right-8 duration-500">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-slate-900/60 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl p-6 relative overflow-hidden group">
                           <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                           <h4 className="text-rose-400 text-xs font-bold tracking-wider uppercase mb-2">Max-Cut Score</h4>
                           <div className="text-sm text-slate-400 mb-1">Optimal Edges Cut</div>
                           <div className="text-4xl font-black text-white">{results.maxCutValue}</div>
                        </div>
                        <div className="bg-slate-900/60 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl p-6 relative overflow-hidden group">
                           <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                           <h4 className="text-fuchsia-400 text-xs font-bold tracking-wider uppercase mb-2">Best Bitstrings Found</h4>
                           <div className="text-sm text-slate-400 mb-1">Optimal Partitions</div>
                           <div className="text-2xl font-black text-white max-h-12 overflow-y-auto custom-scrollbar">
                              {results.bestCuts.slice(0, 3).join(', ')}{results.bestCuts.length > 3 ? '...' : ''}
                           </div>
                        </div>
                     </div>
                     
                     <div className="bg-slate-900/60 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl p-8 flex-1 flex flex-col relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 blur-[50px] rounded-full pointer-events-none"></div>
                        <div className="flex items-center justify-between mb-8 relative z-10">
                           <h3 className="text-2xl font-bold text-white">Measurement Results</h3>
                           <div className="px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold tracking-wider shadow-[0_0_10px_rgba(244,63,94,0.1)]">
                              PROBABILITY DISTRIBUTION
                           </div>
                        </div>
                        <div className="flex-1 min-h-[400px] relative z-10">
                           <Histogram counts={results.counts} shots={results.executedShots} numQubits={results.numQubits} />
                        </div>
                     </div>
                  </div>
               ) : (
                  <div className="bg-slate-900/30 backdrop-blur-xl rounded-3xl border border-white/5 shadow-inner p-8 flex-1 flex items-center justify-center min-h-[500px]">
                     <div className="text-center space-y-6 opacity-40">
                        <div className="w-24 h-24 mx-auto border border-dashed border-slate-500 rounded-full flex items-center justify-center">
                           <Target className="w-10 h-10 text-slate-500" strokeWidth={1.5} />
                        </div>
                        <p className="text-lg font-medium text-slate-400">Execute QAOA to visualize optimization distribution</p>
                     </div>
                  </div>
               )}
            </div>
         </div>
      </div>
   );
}