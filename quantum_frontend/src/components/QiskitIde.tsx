import { useState, useEffect } from 'react';
import { Play, Code2 } from 'lucide-react';
import { parseQiskitToSteps } from '../quantum/qiskitParser';

interface QiskitIdeProps {
  initialCode: string;
  onSync: (numQubits: number, steps: (string | null)[][]) => void;
}

export function QiskitIde({ initialCode, onSync }: QiskitIdeProps) {
  const [code, setCode] = useState(initialCode);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only update if the initialCode changes substantially from outside?
    // We'll leave this to avoid overriding user's typing unless we really want 2-way sync.
  }, []);

  const handleRun = async () => {
    setError(null);
    try {
      const parsed = await parseQiskitToSteps(code);
      if (parsed) {
         onSync(parsed.numQubits, parsed.steps);
      }
    } catch (e: any) {
      setError(e.message || "Failed to parse Qiskit code.");
    }
  };

  return (
    <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg border border-slate-700/50 flex flex-col h-full">
      <div className="bg-slate-800/80 px-6 py-3 border-b border-slate-700 flex justify-between items-center">
        <span className="text-sm font-mono font-bold text-slate-300 flex items-center gap-2">
          <Code2 className="w-4 h-4 text-emerald-400" />
          Qiskit IDE
        </span>
        <button 
          onClick={handleRun}
          className="group relative flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-400 text-emerald-400 hover:text-emerald-300 text-[11px] uppercase tracking-widest font-bold rounded-lg transition-all overflow-hidden shadow-[0_0_15px_rgba(16,185,129,0.05)] hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-emerald-500/0 -translate-x-full group-hover:translate-x-full duration-1000 transition-transform" />
          <Play className="w-3.5 h-3.5 fill-current relative z-10" />
          <span className="relative z-10">Run & Sync</span>
        </button>
      </div>
      <div className="flex-1 relative">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck="false"
          className="absolute inset-0 w-full h-full bg-transparent text-emerald-400 font-mono text-sm p-6 focus:outline-none resize-none leading-relaxed"
        />
      </div>
      {error && (
        <div className="bg-red-900/50 border-t border-red-500/50 text-red-200 text-xs px-6 py-3">
           {error}
        </div>
      )}
    </div>
  );
}