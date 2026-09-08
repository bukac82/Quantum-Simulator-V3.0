import { useState, useEffect } from 'react';
import { Waves, Play, Loader2, AlertCircle } from 'lucide-react';
import { BlochSphere } from '../components/BlochSphere';

export function QFTAlgorithm() {
  const [qubits, setQubits] = useState(3);
  const [inputState, setInputState] = useState('001');
  const [inverse, setInverse] = useState(false);
  const [results, setResults] = useState<{qubit: number, rx: number, ry: number, rz: number}[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRun = async () => {
    setLoading(true);
    setResults(null);
    setError(null);
    try {
      const res = await fetch('http://127.0.0.1:5000/simulate-qft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qubits, inputState, inverse })
      });
      const data = await res.json();
      if (res.ok) {
        setResults(data.blochVectors);
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
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-fuchsia-500/20 blur-[120px] rounded-full pointer-events-none -z-10"></div>
         
         {/* Page Header */}
         <div className="flex items-center gap-5">
            <div className="w-16 h-16 relative shrink-0">
               <div className="absolute inset-0 bg-fuchsia-500/20 blur-xl rounded-full"></div>
               <div className="relative w-full h-full bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-3 shadow-xl flex items-center justify-center">
                  <Waves className="w-full h-full text-fuchsia-400 drop-shadow-[0_0_8px_rgba(232,121,249,0.6)]" strokeWidth={1.5} />
               </div>
            </div>
            <div>
               <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-pink-500 drop-shadow-md">
                  Quantum Fourier Transform
               </h1>
               <p className="text-slate-300 mt-2 text-lg drop-shadow">
                  Transform a quantum state from the computational basis to the Fourier basis.
               </p>
            </div>
         </div>

         <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column: Controls */}
            <div className="w-full lg:w-1/3 space-y-6">
               <div className="bg-slate-900/60 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl p-8 text-slate-200 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-fuchsia-500 to-pink-500"></div>
                  
                  <h3 className="text-xl font-bold text-white mb-6">Algorithm Parameters</h3>

                  <div className="space-y-6">
                     <div className="space-y-2">
                        <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Number of Qubits</label>
                        <input
                           type="number"
                           value={qubits}
                           onChange={(e) => setQubits(Number(e.target.value))}
                           className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-fuchsia-500/50 focus:ring-2 focus:ring-fuchsia-500/20 transition-all font-mono"
                        />
                     </div>

                     <div className="space-y-2">
                        <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Input State (Binary)</label>
                        <input
                           type="text"
                           value={inputState}
                           onChange={(e) => setInputState(e.target.value)}
                           className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 text-fuchsia-400 font-bold font-mono focus:outline-none focus:border-fuchsia-500/50 focus:ring-2 focus:ring-fuchsia-500/20 transition-all tracking-widest"
                        />
                     </div>

                     <div className="flex items-center space-x-3 pt-2">
                        <div className="relative flex items-center justify-center">
                           <input
                              type="checkbox"
                              id="inverse"
                              checked={inverse}
                              onChange={(e) => setInverse(e.target.checked)}
                              className="peer sr-only"
                           />
                           <div className="w-11 h-6 bg-slate-800 rounded-full border border-slate-700 peer-checked:bg-fuchsia-500/50 peer-checked:border-fuchsia-500 transition-all"></div>
                           <div className="absolute left-1 top-1 w-4 h-4 bg-slate-400 rounded-full peer-checked:translate-x-5 peer-checked:bg-fuchsia-400 transition-all shadow-md"></div>
                        </div>
                        <label htmlFor="inverse" className="text-sm font-bold tracking-wider text-slate-300 uppercase cursor-pointer">
                           Inverse QFT
                        </label>
                     </div>

                     <div className="pt-4 space-y-3">
                        <button
                           onClick={handleRun}
                           disabled={loading}
                           className="w-full bg-gradient-to-r from-fuchsia-500 to-pink-500 hover:from-fuchsia-400 hover:to-pink-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-sm py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(217,70,239,0.3)] hover:shadow-[0_0_30px_rgba(217,70,239,0.5)]"
                        >
                           {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
                           {loading ? 'TRANSFORMING...' : (inverse ? 'APPLY IQFT' : 'APPLY QFT')}
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
                  <div className="bg-slate-900/60 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl p-8 flex-1 flex flex-col animate-in slide-in-from-right-8 duration-500 relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/10 blur-[50px] rounded-full pointer-events-none"></div>
                     <div className="flex items-center justify-between mb-8 relative z-10">
                        <h3 className="text-2xl font-bold text-white">Fourier Basis State</h3>
                        <div className="px-4 py-1.5 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 text-xs font-bold tracking-wider shadow-[0_0_10px_rgba(217,70,239,0.1)]">
                           3D BLOCH SPHERES
                        </div>
                     </div>
                     <div className="flex-1 relative z-10">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar pb-4">
                           {results.map((vec) => (
                              <BlochSphere 
                                 key={vec.qubit} 
                                 rx={vec.rx} 
                                 ry={vec.ry} 
                                 rz={vec.rz} 
                                 label={vec.qubit.toString()} 
                              />
                           ))}
                        </div>
                     </div>
                  </div>
               ) : (
                  <div className="bg-slate-900/30 backdrop-blur-xl rounded-3xl border border-white/5 shadow-inner p-8 flex-1 flex items-center justify-center min-h-[500px]">
                     <div className="text-center space-y-6 opacity-40">
                        <div className="w-24 h-24 mx-auto border border-dashed border-slate-500 rounded-full flex items-center justify-center">
                           <Waves className="w-10 h-10 text-slate-500" strokeWidth={1.5} />
                        </div>
                        <p className="text-lg font-medium text-slate-400">Apply transform to visualize phase distribution</p>
                     </div>
                  </div>
               )}
            </div>
         </div>
      </div>
   );
}