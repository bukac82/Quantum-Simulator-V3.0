interface HistogramProps {
  counts: Record<string, number>;
  shots: number;
  numQubits: number;
}

export function Histogram({ counts, shots, numQubits }: HistogramProps) {
  let keys = Object.keys(counts);
  if (numQubits <= 3) {
    const size = 1 << numQubits;
    for (let i = 0; i < size; i++) {
      const bin = i.toString(2).padStart(numQubits, '0');
      if (counts[bin] === undefined) counts[bin] = 0;
    }
    keys = Object.keys(counts).sort();
  } else {
    keys = keys.sort();
  }

  const maxCount = Math.max(...Object.values(counts), 1);
  
  return (
    <div className="bg-slate-800/80 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-slate-700/50 h-full flex flex-col">
       <h3 className="text-xl font-extrabold text-white mb-2">Measurement Outcomes</h3>
       <p className="text-sm text-slate-400 mb-8">Simulated execution over {shots.toLocaleString()} shots.</p>
       
       <div className="flex items-end gap-2 h-64 overflow-x-auto pb-4 flex-1">
          {keys.map(key => {
             const count = counts[key] || 0;
             const percentage = (count / shots) * 100;
             const height = (count / maxCount) * 100;
             
             return (
               <div key={key} className="flex flex-col items-center flex-1 min-w-[60px] gap-2 h-full justify-end">
                  <div className="text-xs font-semibold text-slate-400">{percentage.toFixed(1)}%</div>
                  <div className="w-full relative flex items-end justify-center h-full">
                     <div 
                       className="w-12 bg-blue-500/80 rounded-t-md hover:bg-blue-400 transition-colors group relative cursor-pointer" 
                       style={{ height: `${Math.max(height, 1)}%` }}
                     >
                        <div className="absolute bottom-full mb-2 hidden group-hover:block bg-slate-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50 left-1/2 -translate-x-1/2">
                          {count} counts
                        </div>
                     </div>
                  </div>
                  <div className="text-xs font-mono font-bold text-slate-300 border-t-2 border-slate-700 pt-2 w-full text-center">
                    |{key}⟩
                  </div>
               </div>
             )
          })}
       </div>
    </div>
  );
}
