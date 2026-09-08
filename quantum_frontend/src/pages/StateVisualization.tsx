import { useState, useEffect } from 'react';
import { BarChart2, RefreshCw, Activity, Atom } from 'lucide-react';
import { BlochSphere } from '../components/BlochSphere';
import { Histogram } from '../components/Histogram';
import { simulateArbitrary, getBlochVector } from '../quantum/simulator';
import type { Vector } from '../quantum/math';

export function StateVisualization() {
  const [selectedState, setSelectedState] = useState('plus');
  const [results, setResults] = useState<{ stateVector: Vector, counts: Record<string, number>, executedShots: number } | null>(null);

  const states = [
    { id: 'zero', label: '|0⟩ State', desc: 'The fundamental ground state.', qubits: 1, steps: [] },
    { id: 'one', label: '|1⟩ State', desc: 'The excited state (after X gate).', qubits: 1, steps: [['X']] },
    { id: 'plus', label: '|+⟩ State', desc: 'Superposition with equal probabilities and zero phase.', qubits: 1, steps: [['H']] },
    { id: 'minus', label: '|-⟩ State', desc: 'Superposition with equal probabilities and π phase.', qubits: 1, steps: [['X'], ['H']] },
    { id: 'i', label: '|i⟩ State', desc: 'Superposition with equal probabilities and π/2 phase.', qubits: 1, steps: [['H'], ['S']] },
    { id: 'bell', label: 'Bell State |Φ+⟩', desc: 'Maximally entangled 2-qubit state.', qubits: 2, steps: [['H', null], ['CTRL', 'TARG']] },
    { id: 'ghz', label: 'GHZ State', desc: 'Maximally entangled 3-qubit state.', qubits: 3, steps: [['H', null, null], ['CTRL', 'TARG', null], [null, 'CTRL', 'TARG']] },
  ];

  const runSimulation = async () => {
    const stateDef = states.find(s => s.id === selectedState) || states[0];
    const numQubits = stateDef.qubits;
    const steps = stateDef.steps;
    
    const paddedSteps = steps.map(step => {
       const newStep = [...step];
       while (newStep.length < numQubits) newStep.push(null);
       return newStep;
    });

    const shots = 2048;
    const { stateVector, counts, executedShots } = await simulateArbitrary(numQubits, paddedSteps, shots);
        
    setResults({ stateVector, counts, executedShots });
  };

  const handleStateSelect = (id: string) => {
    setSelectedState(id);
    setResults(null);
  };

  useEffect(() => {
    runSimulation();
  }, [selectedState]);

  const stateDef = states.find(s => s.id === selectedState) || states[0];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 relative z-10 animate-in fade-in duration-500">
      <header className="text-center md:text-left mb-8 flex items-center gap-5">
        <div className="w-16 h-16 relative shrink-0">
          <div className="absolute inset-0 bg-fuchsia-500/20 blur-xl rounded-full"></div>
          <div className="relative w-full h-full bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-3 shadow-xl flex items-center justify-center">
            <BarChart2 className="w-full h-full text-fuchsia-400 drop-shadow-[0_0_8px_rgba(232,121,249,0.6)]" strokeWidth={1.5} />
          </div>
        </div>
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white drop-shadow-md">State Visualization</h1>
          <p className="text-slate-300 mt-2 text-lg drop-shadow">Visualize standard quantum states on the Bloch Sphere and view measurement distributions.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-800/80 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-slate-700/50">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-fuchsia-400" />
              Select State
            </h2>
            <div className="space-y-2">
              {states.map(s => (
                <button
                  key={s.id}
                  onClick={() => handleStateSelect(s.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${selectedState === s.id ? 'bg-fuchsia-600/20 border-fuchsia-500/50 text-white shadow-inner' : 'bg-slate-900/50 border-slate-700/50 text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'}`}
                >
                  <div className="font-bold">{s.label}</div>
                  <div className="text-xs mt-1 opacity-80">{s.desc}</div>
                </button>
              ))}
            </div>
            
            <button
              onClick={runSimulation}
              className="mt-6 w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors border border-slate-600 hover:border-slate-500"
            >
              <RefreshCw className="w-4 h-4" /> Resimulate Measurements
            </button>
          </div>
        </div>
        
        <div className="lg:col-span-8 flex flex-col gap-6">
          {results && (
            <>
              <div className="bg-slate-800/80 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-slate-700/50">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Atom className="w-5 h-5 text-fuchsia-400" />
                  Bloch Spheres
                </h2>
                <div className="flex flex-wrap gap-6 justify-center items-center min-h-[220px]">
                  {Array.from({ length: stateDef.qubits }).map((_, i) => {
                    const [rx, ry, rz] = getBlochVector(results.stateVector, stateDef.qubits, i);
                    return <BlochSphere key={i} label={`q[${i}]`} rx={rx} ry={ry} rz={rz} />;
                  })}
                </div>
              </div>
              
              <div className="flex-1">
                <Histogram counts={results.counts} shots={results.executedShots} numQubits={stateDef.qubits} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}