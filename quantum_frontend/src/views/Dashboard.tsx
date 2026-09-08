import { Cpu, Library, Server, Activity } from 'lucide-react';
import { CustomLogo } from '../components/CustomLogo';

export function Dashboard({ onViewChange }: { onViewChange: (v: string) => void }) {
  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 relative z-10 animate-in fade-in duration-500">
      <header className="mb-12 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 mb-6 relative">
          <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full"></div>
          <div className="relative w-full h-full bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl flex items-center justify-center">
            <CustomLogo className="w-full h-full text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
          </div>
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight text-white drop-shadow-md mb-4 uppercase">
          Quantum <span className="text-blue-400">Simulator</span>
        </h1>
        <p className="text-blue-200/80 text-xl drop-shadow max-w-2xl font-light">
          Explore the fascinating world of quantum computing through interactive simulations.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button onClick={() => onViewChange('designer')} className="text-left bg-slate-800/80 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-slate-700/50 hover:bg-slate-700/80 hover:border-slate-500 transition-all group flex flex-col items-start h-full">
           <Cpu className="w-12 h-12 text-blue-400 mb-4 group-hover:scale-110 transition-transform" />
           <h2 className="text-2xl font-bold text-white mb-2">Circuit Designer</h2>
           <p className="text-slate-400">Build interactive 2-6 qubit circuits, simulate execution, and visualize state probabilities in real-time.</p>
        </button>

        <button onClick={() => onViewChange('state-visualization')} className="text-left bg-slate-800/80 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-slate-700/50 hover:bg-slate-700/80 hover:border-slate-500 transition-all group flex flex-col items-start h-full">
           <Activity className="w-12 h-12 text-indigo-400 mb-4 group-hover:scale-110 transition-transform" />
           <h2 className="text-2xl font-bold text-white mb-2">State Visualization</h2>
           <p className="text-slate-400">Explore Bloch spheres and complex amplitude phase circles for advanced insights.</p>
        </button>

        <button onClick={() => onViewChange('algorithms')} className="text-left bg-slate-800/80 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-slate-700/50 hover:bg-slate-700/80 hover:border-slate-500 transition-all group flex flex-col items-start h-full">
           <Library className="w-12 h-12 text-emerald-400 mb-4 group-hover:scale-110 transition-transform" />
           <h2 className="text-2xl font-bold text-white mb-2">Algorithm Library</h2>
           <p className="text-slate-400">Explore and learn fundamental quantum algorithms like Grover's, Shor's, and QFT.</p>
        </button>

        <div className="bg-slate-800/50 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-slate-700/30 opacity-70 flex flex-col items-start h-full">
           <Server className="w-12 h-12 text-purple-400 mb-4" />
           <h2 className="text-2xl font-bold text-white mb-2">Hardware Backends</h2>
           <p className="text-slate-400">Connect to real quantum hardware providers and dispatch live jobs. (Coming Soon)</p>
        </div>
      </div>
    </div>
  );
}