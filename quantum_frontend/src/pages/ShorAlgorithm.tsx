import { useState, useEffect } from 'react';
import { Key, Play, Wand2, Loader2, AlertCircle } from 'lucide-react';
import { Histogram } from '../components/Histogram';

export function ShorAlgorithm() {
  const [numberToFactor, setNumberToFactor] = useState(15);
  const [base, setBase] = useState(7);
  const [shots, setShots] = useState(1024);
  const [results, setResults] = useState<{counts: Record<string, number>, executedShots: number, period: number, factors: number[], numQubits: number} | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRun = async () => {
    setLoading(true);
    setResults(null);
    setError(null);
    try {
      const res = await fetch('http://127.0.0.1:5000/simulate-shor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ N: numberToFactor, a: base, shots })
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

   return (
      <div className="w-full max-w-7xl mx-auto animate-in fade-in duration-500 relative space-y-8">
         {/* Background Glow */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-amber-500/20 blur-[120px] rounded-full pointer-events-none -z-10"></div>
         
         {/* Page Header */}
         <div className="flex items-center gap-5">
            <div className="w-16 h-16 relative shrink-0">
               <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full"></div>
               <div className="relative w-full h-full bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-3 shadow-xl flex items-center justify-center">
                  <Key className="w-full h-full text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" strokeWidth={1.5} />
               </div>
            </div>
            <div>
               <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400 drop-shadow-md">
                  Shor's Algorithm
               </h1>
               <p className="text-slate-300 mt-2 text-lg drop-shadow">
                  Factorize integers in polynomial time using quantum period finding and classical post-processing.
               </p>
            </div>
         </div>

         <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column: Controls */}
            <div className="w-full lg:w-1/3 space-y-6">
               <div className="bg-slate-900/60 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl p-8 text-slate-200 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500"></div>
                  
                  <h3 className="text-xl font-bold text-white mb-6">Algorithm Parameters</h3>

                  <div className="space-y-6">
                     <div className="space-y-2">
                        <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Number to Factor (N)</label>
                        <input
                           type="number"
                           value={numberToFactor}
                           onChange={(e) => setNumberToFactor(Number(e.target.value))}
                           className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all font-mono"
                        />
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider pt-1">Must be composite, not a prime power</p>
                     </div>

                     <div className="space-y-2">
                        <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Coprime Base (a)</label>
                        <div className="flex gap-3 items-center">
                           <input
                              type="number"
                              value={base}
                              onChange={(e) => setBase(Number(e.target.value))}
                              className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all font-mono"
                           />
                           <button
                              onClick={() => setBase(numberToFactor === 15 ? 7 : 2)}
                              className="text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold px-4 py-3 rounded-xl border border-amber-500/30 transition-all whitespace-nowrap flex items-center gap-1.5"
                           >
                              <Wand2 className="w-3.5 h-3.5" /> Valid
                           </button>
                        </div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider pt-1">GCD(a, N) = 1</p>
                     </div>

                     <div className="space-y-2">
                        <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Measurement Shots</label>
                        <input
                           type="number"
                           value={shots}
                           onChange={(e) => setShots(Number(e.target.value))}
                           className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all font-mono"
                        />
                     </div>

                     <div className="pt-4 space-y-3">
                        <button
                           onClick={handleRun}
                           disabled={loading}
                           className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-sm py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)]"
                        >
                           {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
                           {loading ? 'FACTORING...' : 'EXECUTE ALGORITHM'}
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
                           <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                           <h4 className="text-indigo-400 text-xs font-bold tracking-wider uppercase mb-2">Classical Processing</h4>
                           <div className="text-sm text-slate-400 mb-1">Found Period (r)</div>
                           <div className="text-4xl font-black text-white">{results.period}</div>
                        </div>
                        <div className="bg-slate-900/60 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl p-6 relative overflow-hidden group">
                           <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                           <h4 className="text-emerald-400 text-xs font-bold tracking-wider uppercase mb-2">Prime Factors of {numberToFactor}</h4>
                           <div className="text-sm text-slate-400 mb-1">Algorithm Result</div>
                           <div className="text-4xl font-black text-white">
                              {results.factors.length > 0 ? results.factors.filter(f => f > 1 && f < numberToFactor).join(' & ') || 'Trivial' : 'Failed'}
                           </div>
                        </div>
                     </div>
                     
                     <div className="bg-slate-900/60 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl p-8 flex-1 flex flex-col relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[50px] rounded-full pointer-events-none"></div>
                        <div className="flex items-center justify-between mb-8 relative z-10">
                           <h3 className="text-2xl font-bold text-white">Quantum Period Finding</h3>
                           <div className="px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold tracking-wider">
                              QFT MEASUREMENT
                           </div>
                        </div>
                        <div className="flex-1 min-h-[300px] relative z-10">
                           <Histogram counts={results.counts} shots={results.executedShots} numQubits={results.numQubits} />
                        </div>
                     </div>
                  </div>
               ) : (
                  <div className="bg-slate-900/30 backdrop-blur-xl rounded-3xl border border-white/5 shadow-inner p-8 flex-1 flex items-center justify-center min-h-[500px]">
                     <div className="text-center space-y-6 opacity-40">
                        <div className="w-24 h-24 mx-auto border border-dashed border-slate-500 rounded-full flex items-center justify-center">
                           <Key className="w-10 h-10 text-slate-500" strokeWidth={1.5} />
                        </div>
                        <p className="text-lg font-medium text-slate-400">Execute algorithm to find prime factors</p>
                     </div>
                  </div>
               )}
            </div>
         </div>
      </div>
   );
}