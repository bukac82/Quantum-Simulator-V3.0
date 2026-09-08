interface PythonCodeViewProps {
  numQubits: number;
  steps: (string | null)[][];
  shots: number;
}

export function PythonCodeView({ numQubits, steps, shots }: PythonCodeViewProps) {
  let code = `from qiskit import QuantumCircuit, transpile\n`;
  code += `from qiskit_aer import AerSimulator\n\n`;
  code += `# Initialize a circuit with ${numQubits} qubits and classical bits\n`;
  code += `qc = QuantumCircuit(${numQubits}, ${numQubits})\n\n`;

  steps.forEach((step) => {
    let addedGate = false;
    
    // Check Two Qubit Gates
    const ctrl = step.indexOf('CTRL');
    const targ = step.indexOf('TARG');
    if (ctrl !== -1 && targ !== -1) {
      code += `qc.cx(${ctrl}, ${targ})\n`;
      addedGate = true;
    }
    
    const swap1 = step.indexOf('SWAP1');
    const swap2 = step.indexOf('SWAP2');
    if (swap1 !== -1 && swap2 !== -1) {
      code += `qc.swap(${swap1}, ${swap2})\n`;
      addedGate = true;
    }
    
    const czCtrl = step.indexOf('CZ_CTRL');
    const czTarg = step.indexOf('CZ_TARG');
    if (czCtrl !== -1 && czTarg !== -1) {
      code += `qc.cz(${czCtrl}, ${czTarg})\n`;
      addedGate = true;
    }
    
    step.forEach((gate, w) => {
      if (gate && !['CTRL', 'TARG', 'SWAP1', 'SWAP2', 'CZ_CTRL', 'CZ_TARG'].includes(gate)) {
        const match = gate.match(/^(RX|RY|RZ)\(([-.\d]+)\)$/);
        if (match) {
          code += `qc.${match[1].toLowerCase()}(${match[2]}, ${w})\n`;
        } else {
          code += `qc.${gate.toLowerCase()}(${w})\n`;
        }
        addedGate = true;
      }
    });
    
    if (addedGate) {
      code += `qc.barrier()\n`;
    }
  });

  code += `\n# Measure all qubits\n`;
  code += `qc.measure(range(${numQubits}), range(${numQubits}))\n\n`;
  code += `# Run simulation using AerSimulator\n`;
  code += `simulator = AerSimulator()\n`;
  code += `compiled_circuit = transpile(qc, simulator)\n`;
  code += `job = simulator.run(compiled_circuit, shots=${shots})\n`;
  code += `result = job.result()\n`;
  code += `counts = result.get_counts(compiled_circuit)\n`;
  code += `print("Measurement outcomes:", counts)\n`;

  return (
    <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg border border-slate-700/50 flex flex-col h-full">
      <div className="bg-slate-800/80 px-6 py-3 border-b border-slate-700 flex justify-between items-center">
        <span className="text-sm font-mono font-bold text-slate-300">circuit.py</span>
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Live Qiskit Translation</span>
      </div>
      <div className="p-6 overflow-x-auto flex-1">
        <pre className="text-sm font-mono text-emerald-400 leading-relaxed">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
