import { useState, useEffect } from 'react';
import { Activity, Play, Loader2, AlertCircle } from 'lucide-react';

const VQELineChart = ({ data, target }: { data: number[], target: number }) => {
  if (!data || data.length === 0) return null;
  const minEnergy = Math.min(...data, target) - 0.2;
  const maxEnergy = Math.max(...data) + 0.2;
  const range = maxEnergy - minEnergy;
  const height = 300;
  const width = 800;

  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1 || 1)) * width;
    const y = height - ((val - minEnergy) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  const targetY = height - ((target - minEnergy) / range) * height;

  return (
    <div className="w-full relative h-[400px] flex flex-col pt-4">
      <div className="absolute right-2 top-0 text-xs font-bold text-emerald-400 flex items-center gap-2 bg-emerald-950/30 px-3 py-1.5 rounded-md border border-emerald-500/20 shadow-md z-10">
         <div className="w-4 h-0.5 bg-emerald-400 border-t-2 border-dashed border-emerald-400"></div> True Ground State
      </div>
      <svg viewBox={`-10 -10 ${width+20} ${height+20}`} className="w-full flex-1 overflow-visible">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map(r => {
           const y = height * r;
           const val = maxEnergy - (range * r);
           return (
              <g key={r}>
                 <line x1="0" y1={y} x2={width} y2={y} stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />
                 <text x="5" y={y - 8} fill="#64748b" fontSize="12" fontFamily="monospace" fontWeight="bold">{val.toFixed(3)} Ha</text>
              </g>
           )
        })}
        {/* Target Energy Line */}
        <line x1="0" y1={targetY} x2={width} y2={targetY} stroke="#10b981" strokeWidth="2" strokeDasharray="8 4" />
        {/* Trace */}
        <polyline points={points} fill="none" stroke="#818cf8" strokeWidth="3" strokeLinejoin="round" className="drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]" />
      </svg>
      <div className="flex justify-between text-xs font-bold text-slate-500 mt-4 px-2 uppercase tracking-widest">
         <span>Iteration 0</span>
         <span>Iteration {data.length}</span>
      </div>
    </div>
  )
}

export function VQEAlgorithm() {
  const [qubits, setQubits] = useState(2);
  const [ansatz, setAnsatz] = useState('RealAmplitudes');
  const [optimizer, setOptimizer] = useState('COBYLA');
  const [shots, setShots] = useState(1024);
  const [hamiltonian, setHamiltonian] = useState('H2 Molecule (0.735 Å)');
  
  const [results, setResults] = useState<{energyTrace: number[], finalEnergy: number, targetEnergy: number, molecule: string} | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRun = async () => {
    setLoading(true);
    setResults(null);
    setError(null);
    try {
      const res = await fetch('http://127.0.0.1:5000/simulate-vqe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qubits, ansatz, optimizer, shots, hamiltonian })
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
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none -z-10"></div>
         
         {/* Page Header */}
         <div className="flex items-center gap-5">
            <div className="w-16 h-16 relative shrink-0">
               <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full"></div>
               <div className="relative w-full h-full bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-3 shadow-xl flex items-center justify-center">
                  <Activity className="w-full h-full text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.6)]" strokeWidth={1.5} />
               </div>
            </div>
            <div>
               <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-500 drop-shadow-md">
                  VQE (Variational Quantum Eigensolver)
               </h1>
               <p className="text-slate-300 mt-2 text-lg drop-shadow">
                  Find the ground state energy of a molecule's Hamiltonian using a hybrid quantum-classical approach.
               </p>
            </div>
         </div>

         <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column: Controls */}
            <div className="w-full lg:w-1/3 space-y-6">
               <div className="bg-slate-900/60 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl p-8 text-slate-200 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-violet-500"></div>
                  
                  <h3 className="text-xl font-bold text-white mb-6">Algorithm Parameters</h3>
                  
                  <div className="space-y-6">
                     <div className="space-y-2">
                        <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Target Molecule / Hamiltonian</label>
                        <select 
                          value={hamiltonian}
                          onChange={(e) => setHamiltonian(e.target.value)}
                          className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all font-semibold"
                        >
                          <option>H2 Molecule (0.735 Å)</option>
                          <option>LiH Molecule (1.595 Å)</option>
                          <option>Custom Pauli String</option>
                        </select>
                     </div>

                     <div className="space-y-2">
                        <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Number of Qubits</label>
                        <input 
                          type="number" 
                          value={qubits}
                          onChange={(e) => setQubits(Number(e.target.value))}
                          className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all font-mono"
                        />
                     </div>
                     
                     <div className="space-y-2">
                        <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Ansatz (Parameterized Circuit)</label>
                        <select 
                          value={ansatz}
                          onChange={(e) => setAnsatz(e.target.value)}
                          className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                        >
                          <option>RealAmplitudes</option>
                          <option>EfficientSU2</option>
                          <option>UCCSD</option>
                        </select>
                     </div>

                     <div className="space-y-2">
                        <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Classical Optimizer</label>
                        <select 
                          value={optimizer}
                          onChange={(e) => setOptimizer(e.target.value)}
                          className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                        >
                          <option>COBYLA</option>
                          <option>SPSA</option>
                          <option>SLSQP</option>
                        </select>
                     </div>

                     <div className="space-y-2">
                        <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Measurement Shots</label>
                        <input 
                          type="number" 
                          value={shots}
                          onChange={(e) => setShots(Number(e.target.value))}
                          className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all font-mono"
                        />
                     </div>

                     <div className="pt-4 space-y-3">
                        <button
                           onClick={handleRun}
                           disabled={loading}
                           className="w-full bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-400 hover:to-violet-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-sm py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)]"
                        >
                           {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
                           {loading ? 'OPTIMIZING ENERGY...' : 'RUN VQE'}
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
                           <h4 className="text-indigo-400 text-xs font-bold tracking-wider uppercase mb-2">Estimated Ground State Energy</h4>
                           <div className="text-sm text-slate-400 mb-1">{results.molecule}</div>
                           <div className="text-3xl font-black text-white font-mono flex items-end gap-2">
                              {results.finalEnergy.toFixed(6)} <span className="text-lg text-slate-500 pb-1">Ha</span>
                           </div>
                        </div>
                        <div className="bg-slate-900/60 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl p-6 relative overflow-hidden group">
                           <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                           <h4 className="text-emerald-400 text-xs font-bold tracking-wider uppercase mb-2">Chemical Accuracy Gap</h4>
                           <div className="text-sm text-slate-400 mb-1">Difference from Exact Target</div>
                           <div className="text-3xl font-black text-white font-mono">
                              {Math.abs(results.finalEnergy - results.targetEnergy).toFixed(6)} <span className="text-lg text-slate-500 pb-1">Ha</span>
                           </div>
                        </div>
                     </div>
                     
                     <div className="bg-slate-900/60 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl p-8 flex-1 flex flex-col relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[50px] rounded-full pointer-events-none"></div>
                        <div className="flex items-center justify-between mb-2 relative z-10">
                           <h3 className="text-2xl font-bold text-white">Optimization Convergence</h3>
                           <div className="px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold tracking-wider shadow-[0_0_10px_rgba(99,102,241,0.1)]">
                              ENERGY LANDSCAPE
                           </div>
                        </div>
                        <div className="flex-1 relative z-10 w-full">
                           <VQELineChart data={results.energyTrace} target={results.targetEnergy} />
                        </div>
                     </div>
                  </div>
               ) : (
                  <div className="bg-slate-900/30 backdrop-blur-xl rounded-3xl border border-white/5 shadow-inner p-8 flex-1 flex items-center justify-center min-h-[500px]">
                     <div className="text-center space-y-6 opacity-40">
                        <div className="w-24 h-24 mx-auto border border-dashed border-slate-500 rounded-full flex items-center justify-center">
                           <Activity className="w-10 h-10 text-slate-500" strokeWidth={1.5} />
                        </div>
                        <p className="text-lg font-medium text-slate-400">Execute VQE to visualize energy convergence</p>
                     </div>
                  </div>
               )}
            </div>
         </div>
      </div>
   );
}