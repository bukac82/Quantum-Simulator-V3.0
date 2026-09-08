import { useState } from 'react';
import { Search, Play, Loader2, Wand2 } from 'lucide-react';
import { Histogram } from '../components/Histogram';

export function GroverAlgorithm() {
   const [qubits, setQubits] = useState(3);
   const [target, setTarget] = useState('101');
   const [iterations, setIterations] = useState(2);
   const [shots, setShots] = useState(1024);
   const [results, setResults] = useState<{ counts: Record<string, number>, executedShots: number } | null>(null);
   const [loading, setLoading] = useState(false);

   const handleRun = async () => {
      setLoading(true);
      setResults(null);
      try {
         const res = await fetch('http://127.0.0.1:5000/simulate-grover', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ qubits, target, iterations, shots })
         });
         if (res.ok) {
            const data = await res.json();
            setResults(data);
         }
      } catch (e) {
         console.error(e);
      }
      setLoading(false);
   };

   return (
      <div className="w-full max-w-7xl mx-auto animate-in fade-in duration-500 relative space-y-8">
         {/* Background Glow */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none -z-10"></div>
         
         {/* Page Header */}
         <div className="flex items-center gap-5">
            <div className="w-16 h-16 relative shrink-0">
               <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full"></div>
               <div className="relative w-full h-full bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-3 shadow-xl flex items-center justify-center">
                  <Search className="w-full h-full text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]" strokeWidth={1.5} />
               </div>
            </div>
            <div>
               <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 drop-shadow-md">
                  Grover's Algorithm
               </h1>
               <p className="text-slate-300 mt-2 text-lg drop-shadow">
                  Find a specific target state in an unstructured database with quadratic speedup.
               </p>
            </div>
         </div>

         <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column: Controls */}
            <div className="w-full lg:w-1/3 space-y-6">
               <div className="bg-slate-900/60 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl p-8 text-slate-200 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl -z-10"></div>
                  
                  <h3 className="text-xl font-bold text-white mb-6">Algorithm Parameters</h3>

                  <div className="space-y-6">
                     <div className="space-y-2">
                        <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Number of Qubits</label>
                        <input
                           type="number"
                           value={qubits}
                           onChange={(e) => setQubits(Number(e.target.value))}
                           className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all font-mono shadow-inner"
                        />
                     </div>

                     <div className="space-y-2">
                        <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Target State (Binary)</label>
                        <input
                           type="text"
                           value={target}
                           onChange={(e) => setTarget(e.target.value)}
                           className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 text-cyan-400 font-bold font-mono focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all tracking-widest shadow-inner"
                        />
                     </div>

                     <div className="space-y-2">
                        <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Iterations (Oracle)</label>
                        <div className="flex gap-3 items-center">
                           <input
                              type="number"
                              value={iterations}
                              onChange={(e) => setIterations(Number(e.target.value))}
                              className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all font-mono shadow-inner"
                           />
                           <button
                              onClick={() => setIterations(Math.max(1, Math.floor(Math.PI / 4 * Math.sqrt(Math.pow(2, qubits)))))}
                              className="text-xs bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 font-bold px-4 py-3 rounded-xl border border-cyan-500/30 transition-all whitespace-nowrap shadow-sm">
                              <Wand2 className='w-3 h-3'/> Optimal
                           </button>
                        </div>
                     </div>

                     <div className="space-y-2">
                        <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Measurement Shots</label>
                        <input
                           type="number"
                           value={shots}
                           onChange={(e) => setShots(Number(e.target.value))}
                           className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all font-mono shadow-inner"
                        />
                     </div>

                     <div className="pt-4">
                        <button
                           onClick={handleRun}
                           disabled={loading}
                           className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-sm py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] border border-white/10"
                        >
                           {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
                           {loading ? 'SIMULATING QPU...' : 'EXECUTE ALGORITHM'}
                        </button>
                     </div>
                  </div>
               </div>
            </div>

            {/* Right Column: Results */}
            <div className="w-full lg:w-2/3 flex flex-col">
               {results ? (
                  <div className="bg-slate-900/60 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl p-8 flex-1 flex flex-col animate-in slide-in-from-right-8 duration-500 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-cyan-500/20 transition-colors duration-700"></div>
                     <div className="flex items-center justify-between mb-8 relative z-10">
                        <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                           <div className="w-2 h-8 bg-gradient-to-b from-blue-400 to-cyan-400 rounded-full"></div>
                           Measurement Results
                        </h3>
                        <div className="px-5 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.2)] flex items-center gap-2">
                           <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                           </span>
                           TARGET: |{target}⟩
                        </div>
                     </div>
                     <div className="flex-1 min-h-[400px] relative z-10 bg-slate-950/30 rounded-2xl p-4 border border-white/5 shadow-inner">
                        <Histogram counts={results.counts} shots={results.executedShots} numQubits={qubits} />
                     </div>
                  </div>
               ) : (
                  <div className="bg-slate-900/30 backdrop-blur-xl rounded-3xl border border-white/5 shadow-inner p-8 flex-1 flex items-center justify-center min-h-[500px] relative overflow-hidden">
                     <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>
                     <div className="text-center space-y-6 opacity-40 relative z-10 hover:opacity-70 transition-opacity duration-300">
                        <div className="w-28 h-28 mx-auto border-2 border-dashed border-slate-500 rounded-full flex items-center justify-center bg-slate-800/50 shadow-inner">
                           <Search className="w-12 h-12 text-slate-400" strokeWidth={1.5} />
                        </div>
                        <p className="text-lg font-medium text-slate-400 max-w-sm mx-auto">
                           Define your parameters and execute the oracle to search the quantum state space.
                        </p>
                     </div>
                  </div>
               )}
            </div>
         </div>
      </div>
   );
}
