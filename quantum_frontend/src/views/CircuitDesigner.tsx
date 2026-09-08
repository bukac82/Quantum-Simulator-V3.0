import { useState } from 'react';
import { Eraser, Play, RefreshCw, Trash2, Atom, X, BarChart2, Bot, Cpu } from 'lucide-react';
import { simulateArbitrary, GateInfo, getBlochVector } from '../quantum/simulator';
import { BlochSphere } from '../components/BlochSphere';
import { PythonCodeView } from '../components/PythonCodeView';
import { Histogram } from '../components/Histogram';
import type { Vector } from '../quantum/math';
import { QiskitIde } from '../components/QiskitIde';

type Tool = 'H' | 'X' | 'Y' | 'Z' | 'S' | 'T' | 'RX' | 'RY' | 'RZ' | 'CNOT' | 'SWAP' | 'CZ' | 'ERASER' | null;

export function CircuitDesigner() {
  const [numQubitsStr, setNumQubitsStr] = useState('2');
  const [depthStr, setDepthStr] = useState('8');
  const [shotsStr, setShotsStr] = useState('1024');

  const [numQubits, setNumQubits] = useState(2);
  const [depth, setDepth] = useState(8);
  const [shots, setShots] = useState(1024);

  const [steps, setSteps] = useState<(string | null)[][]>(
    Array(8).fill(null).map(() => Array(2).fill(null))
  );
  
  const [selectedTool, setSelectedTool] = useState<Tool>('H');
  const [pendingTwoQubit, setPendingTwoQubit] = useState<{step: number, wire: number, gate: string} | null>(null);
  
  const [paramsModal, setParamsModal] = useState<{ gate: string, stepIdx: number, wireIdx: number, tempValue: string } | null>(null);
  const [showIde, setShowIde] = useState(true);

  const [results, setResults] = useState<{
    stateVector: Vector, 
    counts: Record<string, number>,
    executedShots: number
  } | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [tourStep, setTourStep] = useState(-1);
  const isTourActive = tourStep >= 0;
  const highlightClass = (step: number) => isTourActive && tourStep === step ? 'relative z-[60] ring-4 ring-amber-500 ring-offset-4 ring-offset-slate-900 rounded-xl' : '';

  const handleUpdate = () => {
    let nQ = parseInt(numQubitsStr) || 2;
    let nD = parseInt(depthStr) || 8;
    
    nQ = Math.min(Math.max(nQ, 1), 6);
    nD = Math.min(Math.max(nD, 1), 30);
    const finalShots = Math.min(Math.max(parseInt(shotsStr) || 1024, 1), 100000);
    
    setNumQubitsStr(nQ.toString());
    setDepthStr(nD.toString());
    setShotsStr(finalShots.toString());
    
    setNumQubits(nQ);
    setDepth(nD);
    setShots(finalShots);
    
    setSteps(prev => {
      const newSteps: (string | null)[][] = [];
      for(let i = 0; i < nD; i++) {
        const oldStep = prev[i] || [];
        const newStep: (string | null)[] = [];
        for(let w = 0; w < nQ; w++) {
          newStep.push(oldStep[w] || null);
        }
        
        // Remove unpaired two-qubit gate components
        const pairedCheck = (g1: string, g2: string) => {
          const idx1 = newStep.indexOf(g1);
          const idx2 = newStep.indexOf(g2);
          if (idx1 !== -1 && idx2 === -1) newStep[idx1] = null;
          if (idx2 !== -1 && idx1 === -1) newStep[idx2] = null;
        };

        pairedCheck('CTRL', 'TARG');
        pairedCheck('SWAP1', 'SWAP2');
        pairedCheck('CZ_CTRL', 'CZ_TARG');
        
        newSteps.push(newStep);
      }
      return newSteps;
    });
    setPendingTwoQubit(null);
    setParamsModal(null);
    setResults(null);
  };

  const clearAll = () => {
    setSteps(Array(depth).fill(null).map(() => Array(numQubits).fill(null)));
    setPendingTwoQubit(null);
    setParamsModal(null);
    setResults(null);
  };

  const executeCircuit = async () => {
    const { stateVector, counts, executedShots } = await simulateArbitrary(numQubits, steps, shots);
    setResults({ stateVector, counts, executedShots });
  };

  const handleCellClick = (stepIdx: number, wireIdx: number) => {
    if (!selectedTool) return;
    setResults(null);
    setPendingTwoQubit(null);

    if (['RX', 'RY', 'RZ', 'CNOT', 'SWAP', 'CZ'].includes(selectedTool)) {
      setParamsModal({
        gate: selectedTool,
        stepIdx,
        wireIdx,
        tempValue: ['RX', 'RY', 'RZ'].includes(selectedTool) ? '1.57' : (wireIdx === 0 ? '1' : '0')
      });
      return;
    }

    setSteps(s => {
      const newS = s.map(step => [...step]);
      const step = newS[stepIdx];
      
      const isTwoQubitComp = (val: string | null) => 
        ['CTRL', 'TARG', 'SWAP1', 'SWAP2', 'CZ_CTRL', 'CZ_TARG'].includes(val || '');

      if (selectedTool === 'ERASER') {
        if (isTwoQubitComp(step[wireIdx])) {
          // erase both parts
          for (let i = 0; i < numQubits; i++) {
            if (isTwoQubitComp(step[i])) step[i] = null;
          }
        } else {
          step[wireIdx] = null;
        }
      } 
      else {
        if (isTwoQubitComp(step[wireIdx])) {
          for (let i = 0; i < numQubits; i++) {
            if (isTwoQubitComp(step[i])) step[i] = null;
          }
        }
        step[wireIdx] = selectedTool;
      }
      return newS;
    });
  };

  const applyParamsModal = () => {
    if (!paramsModal) return;
    
    setSteps(s => {
      const newS = s.map(step => [...step]);
      const step = newS[paramsModal.stepIdx];
      const isTwoQubitComp = (val: string | null) => 
        ['CTRL', 'TARG', 'SWAP1', 'SWAP2', 'CZ_CTRL', 'CZ_TARG'].includes(val || '');

      // First clean up any existing two-qubit gate components in these wires if needed
      if (isTwoQubitComp(step[paramsModal.wireIdx])) {
        for (let i = 0; i < numQubits; i++) {
          if (isTwoQubitComp(step[i])) step[i] = null;
        }
      }

      if (['RX', 'RY', 'RZ'].includes(paramsModal.gate)) {
        step[paramsModal.wireIdx] = `${paramsModal.gate}(${paramsModal.tempValue})`;
      } else {
        const targetWire = parseInt(paramsModal.tempValue);
        if (targetWire !== paramsModal.wireIdx && targetWire >= 0 && targetWire < numQubits) {
          // Clean up target wire if it has a two-qubit component
          if (isTwoQubitComp(step[targetWire])) {
             for (let i = 0; i < numQubits; i++) {
               if (isTwoQubitComp(step[i])) step[i] = null;
             }
          }
          
          if (paramsModal.gate === 'CNOT') {
            step[paramsModal.wireIdx] = 'CTRL';
            step[targetWire] = 'TARG';
          } else if (paramsModal.gate === 'SWAP') {
            step[paramsModal.wireIdx] = 'SWAP1';
            step[targetWire] = 'SWAP2';
          } else if (paramsModal.gate === 'CZ') {
            step[paramsModal.wireIdx] = 'CZ_CTRL';
            step[targetWire] = 'CZ_TARG';
          }
        }
      }
      return newS;
    });
    setParamsModal(null);
  };

  const handleIdeSync = async (newNumQubits: number, newSteps: (string | null)[][]) => {
    setNumQubitsStr(newNumQubits.toString());
    setNumQubits(newNumQubits);
    setDepthStr(newSteps.length.toString());
    setDepth(newSteps.length);
    setSteps(newSteps);
    
    const { stateVector, counts, executedShots } = await simulateArbitrary(newNumQubits, newSteps, shots);
    setResults({ stateVector, counts, executedShots });
  };

  return (
    <div className="w-full max-w-[100rem] mx-auto space-y-6 relative z-10 animate-in fade-in duration-500">
      {isTourActive && <div className="fixed inset-0 bg-slate-950/70 z-[40] pointer-events-none transition-opacity" />}
      {isTourActive && (
        <div className="fixed bottom-8 right-8 z-[100] w-96 bg-slate-800 border border-amber-500/50 rounded-2xl shadow-2xl p-6 shadow-amber-500/10 animate-in slide-in-from-bottom-8 duration-300">
          <div className="absolute -top-3 -left-3 w-8 h-8 bg-amber-500 text-slate-900 rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
            {tourStep + 1}/6
          </div>
          <h3 className="text-xl font-bold text-amber-400 mb-2">
            {tourStep === 0 && "Welcome to the Circuit Designer!"}
            {tourStep === 1 && "1. Select a Gate"}
            {tourStep === 2 && "2. Place the Gate"}
            {tourStep === 3 && "3. Add Entanglement"}
            {tourStep === 4 && "4. Execute the Circuit"}
            {tourStep === 5 && "5. Qiskit IDE"}
          </h3>
          <p className="text-slate-300 mb-6 leading-relaxed">
            {tourStep === 0 && "Let's take a quick tour to learn how to build a basic quantum circuit (a Bell State)."}
            {tourStep === 1 && "This is the Gates Palette. Click on the 'H' (Hadamard) gate to select it. The H gate puts a qubit into superposition."}
            {tourStep === 2 && "Now click on the first wire (Qubit 0) in the grid to place the H gate. Your first quantum step!"}
            {tourStep === 3 && "Select the 'CNOT' gate from the palette, then click Qubit 0 (Control), followed by Qubit 1 (Target) in the next column to entangle them."}
            {tourStep === 4 && "Click 'Execute Circuit' to run the simulation and generate the quantum state and measurement probabilities."}
            {tourStep === 5 && "Notice how the equivalent Python code is automatically generated! You can also type code here to sync it back to the grid."}
          </p>
          <div className="flex justify-between items-center">
            <button onClick={() => setTourStep(-1)} className="text-slate-400 hover:text-white text-sm font-semibold transition-colors">Skip Tour</button>
            <div className="flex gap-2">
              {tourStep > 0 && <button onClick={() => setTourStep(tourStep - 1)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-bold text-white transition-colors">Back</button>}
              <button onClick={() => {
                if (tourStep === 5) setTourStep(-1);
                else setTourStep(tourStep + 1);
              }} className="px-4 py-2 bg-amber-500 hover:bg-amber-400 rounded-lg text-sm font-bold text-slate-900 transition-colors shadow-lg shadow-amber-900/20">
                {tourStep === 5 ? 'Finish' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Floating IDE Toggle Button */}
      <button 
        onClick={() => setShowIde(!showIde)}
        className="fixed right-8 bottom-8 z-50 w-14 h-14 bg-emerald-900/80 hover:bg-emerald-600 backdrop-blur-md border border-emerald-500/50 text-emerald-400 hover:text-white rounded-full shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all flex items-center justify-center group"
      >
        {showIde ? <Bot className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
        
        {/* Tooltip */}
        <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-900 border border-slate-700 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl pointer-events-none">
          Qiskit IDE
          <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-slate-900 border-r border-t border-slate-700 rotate-45" />
        </div>
      </button>

      <div className={`grid grid-cols-1 ${showIde ? 'xl:grid-cols-12' : 'xl:grid-cols-1'} gap-8`}>
        <div className={`${showIde ? 'xl:col-span-8' : 'xl:col-span-1'} flex flex-col gap-6`}>
          <header className="text-center md:text-left mb-8 flex items-center gap-5">
        <div className="w-16 h-16 relative shrink-0">
          <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full"></div>
          <div className="relative w-full h-full bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-2.5 shadow-xl flex items-center justify-center">
            <Cpu className="w-full h-full text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
          </div>
        </div>
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white drop-shadow-md">Circuit Designer</h1>
          <div className="flex flex-wrap items-center gap-4 mb-2">
            <h1 className="text-4xl font-extrabold tracking-tight text-white drop-shadow-md">Circuit Designer</h1>
            <button onClick={() => setTourStep(0)} className="px-3 py-1.5 bg-amber-500/20 text-amber-400 border border-amber-500/50 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-amber-500/30 transition-colors flex items-center gap-1 shadow-lg shadow-amber-900/20">
              <Play className="w-3 h-3 fill-current" />
              Interactive Tour
            </button>
          </div>
          <p className="text-blue-200 text-lg drop-shadow">Design arbitrary quantum circuits and simulate results in real-time.</p>
          {/* <p className="text-blue-200 mt-2 text-lg drop-shadow">Design arbitrary quantum circuits and simulate results in real-time.</p> */}
        </div>
      </header>
      
      {/* Settings Bar */}
        <div className="bg-slate-800/80 backdrop-blur-md p-5 rounded-2xl shadow-lg border border-slate-700/50 flex flex-wrap gap-6 items-end">
          <div className="flex flex-col">
             <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Number of Qubits</label>
             <input type="number" min="1" max="6" value={numQubitsStr} onChange={e => setNumQubitsStr(e.target.value)} className="bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 w-24 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div className="flex flex-col">
             <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Circuit Depth</label>
             <input type="number" min="1" max="30" value={depthStr} onChange={e => setDepthStr(e.target.value)} className="bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 w-24 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div className="flex flex-col">
             <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Measurement Shots</label>
             <input type="number" min="1" max="100000" value={shotsStr} onChange={e => setShotsStr(e.target.value)} className="bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 w-32 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          
          <div className="w-px h-12 bg-slate-700 hidden md:block" />
          
          <div className="flex gap-3 flex-wrap flex-1">
             <button onClick={handleUpdate} className="px-5 py-2.5 bg-slate-700/50 hover:bg-slate-600/80 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 border border-slate-600/50">
                <RefreshCw className="w-4 h-4" />
                <span>Update Circuit</span>
             </button>
             <button onClick={clearAll} className="px-5 py-2.5 bg-slate-700/50 hover:bg-slate-600/80 text-red-400 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 border border-slate-600/50">
                <Trash2 className="w-4 h-4" />
                <span>Clear All</span>
             </button>
             <div className="ml-auto flex items-center gap-3">
               {results && (
                 <button onClick={() => setIsModalOpen(true)} className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 border border-slate-600">
                    <BarChart2 className="w-4 h-4 text-blue-400" />
                    <span>View Results</span>
                 </button>
               )}
               <button onClick={executeCircuit} className={`px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-900/50 transition-all flex items-center justify-center gap-2 ${highlightClass(4)}`}>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Execute Circuit</span>
               </button>
             </div>
          </div>
        </div>

        {/* Gate Toolbar */}
        <div className={`relative z-50 bg-slate-800/80 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-slate-700/50 flex flex-wrap gap-3 items-center transition-all ${highlightClass(1)}`}>
          <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider mr-2">Gates Palette</span>
          
          {(['H', 'X', 'Y', 'Z', 'S', 'T'] as string[]).map(gate => (
            <ToolbarBtn key={gate} gate={gate} selected={selectedTool === gate} onClick={() => { setSelectedTool(gate as Tool); setPendingTwoQubit(null); }} />
          ))}

          <div className="w-px h-8 bg-slate-700 mx-2" />
          
          {(['RX', 'RY', 'RZ'] as string[]).map(gate => (
            <ToolbarBtn key={gate} gate={gate} selected={selectedTool === gate} onClick={() => { setSelectedTool(gate as Tool); setPendingTwoQubit(null); }} />
          ))}

          <div className="w-px h-8 bg-slate-700 mx-2" />
          
          {(['CNOT', 'SWAP', 'CZ'] as string[]).map(gate => (
            <ToolbarBtn key={gate} gate={gate} selected={selectedTool === gate} onClick={() => { setSelectedTool(gate as Tool); setPendingTwoQubit(null); }} />
          ))}

          <div className="w-px h-8 bg-slate-700 mx-2" />
          
          <button 
            onClick={() => { setSelectedTool('ERASER'); setPendingTwoQubit(null); }}
            className={`relative group hover:z-50 w-12 h-12 rounded-xl flex items-center justify-center transition-all ${selectedTool === 'ERASER' ? 'bg-red-500 text-white shadow-lg ring-2 ring-red-500 ring-offset-2 ring-offset-slate-800' : 'bg-slate-700/50 hover:bg-slate-600/80 text-slate-300 border border-slate-600/50'}`}
          >
            <Eraser className="w-5 h-5" />
            <Tooltip info={GateInfo['ERASER']} />
          </button>
        </div>

        {/* Circuit Editor */}
        <div className={`bg-slate-800/80 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-slate-700/50 overflow-x-auto relative transition-all ${isTourActive && (tourStep === 2 || tourStep === 3) ? 'relative z-[60] ring-4 ring-amber-500 ring-offset-4 ring-offset-slate-900' : ''}`}>
          <div className="flex flex-row min-w-[max-content]">
            
            {/* Wire Labels */}
            <div className="flex flex-col pr-8 z-10" style={{ gap: '2rem' }}>
              {Array.from({length: numQubits}).map((_, w) => (
                 <div key={w} className="h-12 flex items-center font-mono font-bold text-slate-400 text-xl tracking-tight">|0⟩</div>
              ))}
            </div>
            
            {/* Horizontal Wires (Background) */}
            <div className="absolute left-20 right-0 top-8 bottom-8 pointer-events-none z-0 flex flex-col" style={{ gap: '2rem' }}>
              {Array.from({length: numQubits}).map((_, w) => (
                 <div key={w} className="h-12 flex items-center"><div className="w-full h-0.5 bg-slate-600 rounded-full" /></div>
              ))}
            </div>

            {/* Steps Grid */}
            <div className="flex gap-4 relative z-10">
               {steps.map((step, i) => {
                  let minWire = -1;
                  let maxWire = -1;
                  let lineColor = 'bg-indigo-400';
                  
                  if (step.includes('CTRL') && step.includes('TARG')) {
                    minWire = Math.min(step.indexOf('CTRL'), step.indexOf('TARG'));
                    maxWire = Math.max(step.indexOf('CTRL'), step.indexOf('TARG'));
                  } else if (step.includes('SWAP1') && step.includes('SWAP2')) {
                    minWire = Math.min(step.indexOf('SWAP1'), step.indexOf('SWAP2'));
                    maxWire = Math.max(step.indexOf('SWAP1'), step.indexOf('SWAP2'));
                    lineColor = 'bg-teal-400';
                  } else if (step.includes('CZ_CTRL') && step.includes('CZ_TARG')) {
                    minWire = Math.min(step.indexOf('CZ_CTRL'), step.indexOf('CZ_TARG'));
                    maxWire = Math.max(step.indexOf('CZ_CTRL'), step.indexOf('CZ_TARG'));
                    lineColor = 'bg-fuchsia-400';
                  }

                  const hasTwoQubit = minWire !== -1;

                  return (
                    <div key={i} className="flex flex-col relative group w-12" style={{ gap: '2rem' }}>
                       {/* Two-Qubit Vertical Line */}
                       {hasTwoQubit && (
                         <div 
                           className={`absolute w-0.5 z-0 left-1/2 -translate-x-1/2 ${lineColor}`}
                           style={{ top: `${minWire * 80 + 24}px`, height: `${(maxWire - minWire) * 80}px` }} 
                         />
                       )}
                       
                       {step.map((gate, w) => {
                           const isPending = pendingTwoQubit?.step === i && pendingTwoQubit?.wire === w;
                           let overrideGate = gate;
                           if (isPending) {
                             if (pendingTwoQubit.gate === 'CNOT') overrideGate = 'CTRL';
                             if (pendingTwoQubit.gate === 'SWAP') overrideGate = 'SWAP1';
                             if (pendingTwoQubit.gate === 'CZ') overrideGate = 'CZ_CTRL';
                           }
                           return (
                             <GateCell 
                               key={`gate-${i}-${w}`}
                               gate={overrideGate} 
                               onClick={() => handleCellClick(i, w)} 
                             />
                           )
                       })}
                    </div>
                  )
               })}
            </div>
          </div>
        </div>
        
        {/* Bloch Spheres Section */}
        {results && (
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700/50 mt-6">
            <h3 className="text-lg font-bold text-slate-300 mb-6 flex items-center gap-2">
              <Atom className="w-5 h-5 text-emerald-400" />
              Qubit States (Bloch Spheres)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
               {Array.from({length: numQubits}).map((_, i) => {
                 const [rx, ry, rz] = getBlochVector(results.stateVector, numQubits, i);
                 return <BlochSphere key={`bloch-${i}`} rx={rx} ry={ry} rz={rz} label={i.toString()} />
               })}
            </div>
          </div>
        )}
        </div>
        
        {showIde && (
           <div className={`xl:col-span-4 flex flex-col h-full min-h-[600px] transition-all ${highlightClass(5)}`}>
            <QiskitIde 
              initialCode={`from qiskit import QuantumCircuit, transpile\nfrom qiskit_aer import AerSimulator\n\n# Initialize a circuit with 2 qubits\nqc = QuantumCircuit(2, 2)\n\nqc.h(0)\nqc.cx(0, 1)\n\nqc.measure([0,1], [0,1])\n`} 
              onSync={handleIdeSync} 
            />
          </div>
        )}
      </div>

        {/* Params Modal */}
        {paramsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
            <div className="bg-slate-800 rounded-3xl border border-slate-700/50 shadow-2xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200">
              <h3 className="text-xl font-bold text-white mb-4">
                {['RX', 'RY', 'RZ'].includes(paramsModal.gate) ? 'Rotation Gate Angle' : `${paramsModal.gate} Target`}
              </h3>
              
              <div className="mb-6">
                {['RX', 'RY', 'RZ'].includes(paramsModal.gate) ? (
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Enter angle in radians:
                    <input 
                      type="number"
                      step="any"
                      value={paramsModal.tempValue}
                      onChange={e => setParamsModal({...paramsModal, tempValue: e.target.value})}
                      className="mt-1 block w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </label>
                ) : (
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Target Qubit:
                    <select 
                      value={paramsModal.tempValue}
                      onChange={e => setParamsModal({...paramsModal, tempValue: e.target.value})}
                      className="mt-1 block w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {Array.from({length: numQubits}).map((_, i) => (
                        <option key={i} value={i} disabled={i === paramsModal.wireIdx}>
                          Qubit {i}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </div>

              <div className="flex gap-3 justify-end">
                <button 
                  onClick={() => setParamsModal(null)}
                  className="px-4 py-2 rounded-xl text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={applyParamsModal}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
            <div className="bg-slate-800 rounded-3xl border border-slate-700/50 shadow-2xl w-full max-w-7xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 mt-10 mb-10">
              <div className="flex items-center justify-between p-6 border-b border-slate-700/50 bg-slate-800 sticky top-0 z-10">
                <h2 className="text-2xl font-extrabold text-white flex items-center gap-3">
                  <BarChart2 className="w-6 h-6 text-blue-400" />
                  Measurement Outcomes & Circuit Code
                </h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-white p-2 hover:bg-slate-700 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex flex-col gap-6">
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[400px]">
                  {/* Histogram */}
                  {results ? (
                    <Histogram counts={results.counts} shots={results.executedShots} numQubits={numQubits} />
                  ) : (
                    <div className="bg-slate-800/80 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-slate-700/50 flex flex-col items-center justify-center text-slate-500 border-dashed border-2 min-h-[300px]">
                      <Play className="w-12 h-12 mb-4 opacity-20" />
                      <p className="font-semibold">Execute circuit to see measurement results</p>
                    </div>
                  )}
                  {/* Live Python Code */}
                  <PythonCodeView numQubits={numQubits} steps={steps} shots={shots} />
                </div>
              </div>
            </div>
          </div>
        )}

    </div>
  );
}

function ToolbarBtn({ gate, selected, onClick }: { key?: string | number, gate: string, selected: boolean, onClick: () => void }) {
  const info = GateInfo[gate];
  return (
    <button 
      onClick={onClick}
      className={`relative group hover:z-50 px-4 h-12 rounded-xl flex items-center justify-center text-lg font-mono font-bold transition-all ${selected ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-600 ring-offset-2 ring-offset-slate-800' : 'bg-slate-700/50 hover:bg-slate-600/80 text-slate-200 border border-slate-600/50'}`}
    >
      {gate}
      <Tooltip info={info} />
    </button>
  );
}

function GateCell({ gate, onClick }: { key?: string | number, gate: string | null, onClick: () => void }) {
  let infoKey = gate || '';
  if (gate && gate.startsWith('RX(')) infoKey = 'RX';
  else if (gate && gate.startsWith('RY(')) infoKey = 'RY';
  else if (gate && gate.startsWith('RZ(')) infoKey = 'RZ';
  
  const info = GateInfo[infoKey];

  let content;
  if (gate === 'CTRL' || gate === 'CZ_CTRL' || gate === 'CZ_TARG') {
    const color = gate === 'CTRL' ? 'bg-indigo-400' : 'bg-fuchsia-400';
    content = (
      <button onClick={onClick} className="w-12 h-12 flex items-center justify-center cursor-pointer hover:bg-slate-700/80 rounded-xl transition-colors focus:outline-none">
        <div className={`w-4 h-4 ${color} rounded-full z-10 shadow-sm`} />
      </button>
    );
  } else if (gate === 'TARG') {
    content = (
      <button onClick={onClick} className="w-12 h-12 flex items-center justify-center cursor-pointer hover:bg-slate-700/80 rounded-xl transition-colors focus:outline-none">
        <div className="w-8 h-8 rounded-full border-[3px] border-indigo-400 flex items-center justify-center bg-slate-800 z-10 shadow-sm">
          <div className="w-full h-[3px] bg-indigo-400 absolute" />
          <div className="h-full w-[3px] bg-indigo-400 absolute" />
        </div>
      </button>
    );
  } else if (gate === 'SWAP1' || gate === 'SWAP2') {
    content = (
      <button onClick={onClick} className="w-12 h-12 flex items-center justify-center cursor-pointer hover:bg-slate-700/80 rounded-xl transition-colors focus:outline-none">
        <div className="relative w-6 h-6 flex items-center justify-center bg-slate-800 z-10 shadow-sm">
          <div className="w-[120%] h-[3px] bg-teal-400 absolute rotate-45 rounded" />
          <div className="w-[120%] h-[3px] bg-teal-400 absolute -rotate-45 rounded" />
        </div>
      </button>
    );
  } else {
    // Single Qubit Gate
    let text = gate;
    let cls = 'border-blue-400 bg-blue-500/20 text-blue-300';
    
    if (gate && (gate.startsWith('RX') || gate.startsWith('RY') || gate.startsWith('RZ'))) {
      text = gate.substring(1, 2); // 'X', 'Y', or 'Z'
      cls = 'border-emerald-400 bg-emerald-500/20 text-emerald-300';
    } else if (gate && ['S', 'T'].includes(gate)) {
      cls = 'border-amber-400 bg-amber-500/20 text-amber-300';
    }
    
    content = (
      <button 
        onClick={onClick}
        className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center font-mono text-xl font-bold transition-all cursor-pointer z-10 focus:outline-none
          ${gate ? `${cls} shadow-sm backdrop-blur-sm` : 'border-dashed border-slate-600 bg-slate-800/50 hover:border-blue-400/50 hover:bg-blue-900/30 text-slate-500 hover:text-blue-400'}`}
      >
        {text || '+'}
      </button>
    );
  }

  return (
    <div className="relative group hover:z-50 flex justify-center items-center">
      {content}
      {info && (
        <Tooltip info={info} />
      )}
    </div>
  );
}

function Tooltip({ info }: { info: { name: string, desc: string } }) {
  if (!info) return null;
  return (
    <div className="absolute top-full mt-2 w-56 p-3 bg-slate-900 border border-slate-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl left-1/2 -translate-x-1/2">
       <strong className="block mb-1 text-sm text-blue-400">{info.name}</strong>
       <span className="text-slate-300 font-sans leading-relaxed">{info.desc}</span>
       <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 border-t border-l border-slate-700 rotate-45" />
    </div>
  );
}