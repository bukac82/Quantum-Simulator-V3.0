import { useState } from 'react';
import { LayoutDashboard, Cpu, BookOpen, Search, Key, Waves, ArrowRight, Target, Activity, BarChart2 } from 'lucide-react';
import { QuantumBackground } from './components/QuantumBackground';
import { CircuitDesigner } from './views/CircuitDesigner';
import { Dashboard } from './views/Dashboard';
import { GroverAlgorithm } from './pages/GroverAlgorithm';
import { ShorAlgorithm } from './pages/ShorAlgorithm';
import { QFTAlgorithm } from './pages/QFTAlgorithm';
import { QAOAAlgorithm } from './pages/QAOAAlgorithm';
import { VQEAlgorithm } from './pages/VQEAlgorithm';

import { StateVisualization } from './pages/StateVisualization';
import { CustomLogo } from './components/CustomLogo';

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'state-visualization', label: 'State Visualization', icon: BarChart2 },
    { id: 'designer', label: 'Circuit Designer', icon: Cpu },
    { id: 'algorithms', label: 'Algorithm Library', icon: BookOpen },
  ];

  const algorithmList = [
    { id: 'algo-grover', label: "Grover's Algorithm", desc: 'Quantum Search for Unstructured Databases', icon: Search, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { id: 'algo-shor', label: "Shor's Algorithm", desc: 'Integer Factorization in Polynomial Time', icon: Key, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { id: 'algo-qft', label: 'Quantum Fourier Transform', desc: 'Phase Estimation and Period Finding', icon: Waves, color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10' },
    { id: 'algo-qaoa', label: 'QAOA', desc: 'Quantum Approximate Optimization Algorithm', icon: Target, color: 'text-rose-400', bg: 'bg-rose-500/10' },
    { id: 'algo-vqe', label: 'VQE', desc: 'Variational Quantum Eigensolver', icon: Activity, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  ];

  return (
    <div className="flex h-screen bg-slate-900 font-sans text-white relative z-0 overflow-hidden">
      <QuantumBackground />
      
      {/* Sidebar */}
      <div className="w-64 bg-slate-900/90 backdrop-blur-2xl border-r border-slate-800/80 flex flex-col z-20 shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.5)] overflow-y-auto">
        <div className="p-6 flex flex-col items-center justify-center gap-3 border-b border-slate-800 cursor-pointer group shrink-0" onClick={() => setActiveView('dashboard')}>
          <div className="relative flex items-center justify-center w-14 h-14">
            <CustomLogo className="w-full h-full text-blue-500 group-hover:text-blue-400 group-hover:scale-105 transition-all duration-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
          </div>
          <div className="flex flex-col items-center">
            <span className="font-extrabold text-lg tracking-wide text-white drop-shadow-sm uppercase group-hover:text-blue-100 transition-colors">Quantum</span>
            <span className="text-[10px] font-bold text-blue-400 tracking-[0.2em] uppercase -mt-1 group-hover:text-blue-300 transition-colors">Simulator</span>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-8 space-y-2">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 px-2">Main Menu</div>
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeView === item.id || (item.id === 'algorithms' && activeView.startsWith('algo-'));
            return (
              <div key={item.id}>
                <button
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all font-medium text-sm ${isActive ? 'bg-blue-600/10 text-blue-400 shadow-inner border border-blue-500/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'}`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} strokeWidth={isActive ? 2 : 1.5} />
                  {item.label}
                </button>
                {item.id === 'algorithms' && isActive && (
                  <div className="mt-2 ml-4 pl-4 border-l border-slate-700/50 flex flex-col gap-1">
                    {algorithmList.map(algo => (
                      <button
                        key={algo.id}
                        onClick={() => setActiveView(algo.id)}
                        className={`text-left text-sm py-2 px-3 rounded-md transition-all ${activeView === algo.id ? 'bg-slate-800/80 text-blue-300 font-semibold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'}`}
                      >
                        {algo.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto relative z-10">
         <div className="p-8 lg:p-12 min-h-full">
           {activeView === 'dashboard' && <Dashboard onViewChange={setActiveView} />}
           {activeView === 'state-visualization' && <StateVisualization />}
           {activeView === 'designer' && <CircuitDesigner />}
           {activeView === 'algo-grover' && <GroverAlgorithm />}
           {activeView === 'algo-shor' && <ShorAlgorithm />}
           {activeView === 'algo-qft' && <QFTAlgorithm />}
           {activeView === 'algo-qaoa' && <QAOAAlgorithm />}
           {activeView === 'algo-vqe' && <VQEAlgorithm />}
           {activeView === 'algorithms' && (
              <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
                <div className="flex items-center gap-4 border-b border-slate-700/50 pb-6">
                  <div className="p-3 bg-blue-500/10 rounded-2xl">
                    <BookOpen className="w-8 h-8 text-blue-400" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">Algorithm Library</h1>
                    <p className="text-slate-400 mt-1 text-lg">Explore and learn fundamental quantum algorithms.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {algorithmList.map(algo => {
                    const Icon = algo.icon;
                    return (
                      <div 
                        key={algo.id}
                        onClick={() => setActiveView(algo.id)}
                        className="bg-slate-800/50 rounded-3xl p-6 border border-slate-700/50 shadow-xl hover:bg-slate-700/50 hover:border-slate-600 hover:-translate-y-1 transition-all cursor-pointer group flex flex-col h-full"
                      >
                        <div className={`p-4 ${algo.bg} rounded-2xl w-fit mb-6`}>
                          <Icon className={`w-8 h-8 ${algo.color}`} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">{algo.label}</h3>
                        <p className="text-slate-400 flex-1">{algo.desc}</p>
                        <div className="mt-6 flex items-center text-sm font-semibold text-blue-400 group-hover:text-blue-300 transition-colors">
                          Explore Algorithm <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
           )}
         </div>
      </div>
    </div>
  );
}