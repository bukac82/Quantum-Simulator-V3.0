import { Complex } from '../quantum/math';

interface PhaseCircleProps {
  amplitude: Complex;
  label: string;
}

export function PhaseCircle({ amplitude, label }: PhaseCircleProps) {
  const prob = amplitude.magSq();
  const phase = amplitude.phase();
  
  const r = amplitude.mag() * 40;
  const x = Math.cos(phase) * r;
  const y = -Math.sin(phase) * r;
  
  return (
    <div className="flex flex-col items-center gap-4 bg-slate-800/60 p-6 rounded-2xl border border-slate-700/50 shadow-md transition-all hover:shadow-lg hover:bg-slate-800 hover:border-slate-600">
      <div className="text-lg font-mono font-bold text-slate-200 bg-slate-900 px-3 py-1 rounded-md shadow-inner border border-slate-700">
        {label}
      </div>
      <div className="relative">
        <svg width="100" height="100" className="bg-slate-900 rounded-full border border-slate-700 shadow-inner">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#475569" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="50" y1="10" x2="50" y2="90" stroke="#334155" strokeWidth="1" />
          <line x1="10" y1="50" x2="90" y2="50" stroke="#334155" strokeWidth="1" />
          {r > 0.01 && (
            <>
              <circle cx="50" cy="50" r={r} fill="#3b82f6" fillOpacity="0.3" stroke="#60a5fa" strokeWidth="1.5" />
              <line x1="50" y1="50" x2={50 + x} y2={50 + y} stroke="#93c5fd" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx={50 + x} cy={50 + y} r="3.5" fill="#bfdbfe" />
            </>
          )}
        </svg>
      </div>
      <div className="flex flex-col items-center gap-1">
        <div className="text-sm font-medium text-slate-300 font-mono">
          <span className="text-slate-500">P:</span> {(prob * 100).toFixed(1).padStart(5, '\u00A0')}%
        </div>
        <div className="text-xs text-slate-400 font-mono">
          <span className="text-slate-500">θ:</span> {(phase * 180 / Math.PI).toFixed(0).padStart(4, '\u00A0')}°
        </div>
      </div>
    </div>
  );
}
