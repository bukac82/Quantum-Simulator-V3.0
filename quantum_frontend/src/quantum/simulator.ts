import { Complex, type Vector } from './math';

const invSqrt2 = 1 / Math.SQRT2;

export const Gates: Record<string, Complex[][]> = {
  I: [
    [Complex.ONE, Complex.ZERO],
    [Complex.ZERO, Complex.ONE]
  ],
  H: [
    [new Complex(invSqrt2, 0), new Complex(invSqrt2, 0)],
    [new Complex(invSqrt2, 0), new Complex(-invSqrt2, 0)]
  ],
  X: [
    [Complex.ZERO, Complex.ONE],
    [Complex.ONE, Complex.ZERO]
  ],
  Y: [
    [Complex.ZERO, new Complex(0, -1)],
    [new Complex(0, 1), Complex.ZERO]
  ],
  Z: [
    [Complex.ONE, Complex.ZERO],
    [Complex.ZERO, new Complex(-1, 0)]
  ],
  S: [
    [Complex.ONE, Complex.ZERO],
    [Complex.ZERO, Complex.I]
  ],
  T: [
    [Complex.ONE, Complex.ZERO],
    [Complex.ZERO, new Complex(invSqrt2, invSqrt2)]
  ]
};

export function getGateMatrix(gateStr: string): Complex[][] | null {
  if (Gates[gateStr]) return Gates[gateStr];
  
  const match = gateStr.match(/^(RX|RY|RZ)\(([-.\d]+)\)$/);
  if (match) {
    const type = match[1];
    const theta = parseFloat(match[2]);
    const cos = Math.cos(theta / 2);
    const sin = Math.sin(theta / 2);
    
    if (type === 'RX') {
      return [
        [new Complex(cos, 0), new Complex(0, -sin)],
        [new Complex(0, -sin), new Complex(cos, 0)]
      ];
    } else if (type === 'RY') {
      return [
        [new Complex(cos, 0), new Complex(-sin, 0)],
        [new Complex(sin, 0), new Complex(cos, 0)]
      ];
    } else if (type === 'RZ') {
      return [
        [new Complex(Math.cos(-theta/2), Math.sin(-theta/2)), Complex.ZERO],
        [Complex.ZERO, new Complex(Math.cos(theta/2), Math.sin(theta/2))]
      ];
    }
  }
  return null;
}

export const GateInfo: Record<string, {name: string, desc: string}> = {
  H: { name: 'Hadamard (H)', desc: 'Creates a superposition. Maps |0⟩ to (|0⟩+|1⟩)/√2 and |1⟩ to (|0⟩-|1⟩)/√2.' },
  X: { name: 'Pauli-X (X)', desc: 'Quantum NOT gate. Flips |0⟩ to |1⟩ and vice versa.' },
  Y: { name: 'Pauli-Y (Y)', desc: 'Rotates around the Y axis. Applies a bit and phase flip.' },
  Z: { name: 'Pauli-Z (Z)', desc: 'Phase flip. Leaves |0⟩ unchanged, flips the sign of |1⟩.' },
  S: { name: 'S Gate', desc: 'Phase gate. Rotates state by π/2 around Z-axis.' },
  T: { name: 'T Gate', desc: 'π/8 gate. Rotates state by π/4 around Z-axis.' },
  RX: { name: 'RX(θ)', desc: 'Rotation around X-axis by angle θ.' },
  RY: { name: 'RY(θ)', desc: 'Rotation around Y-axis by angle θ.' },
  RZ: { name: 'RZ(θ)', desc: 'Rotation around Z-axis by angle θ.' },
  CNOT: { name: 'Controlled-NOT', desc: 'Select control then target. Flips target if control is |1⟩.' },
  SWAP: { name: 'SWAP', desc: 'Swaps the states of two qubits.' },
  CZ: { name: 'Controlled-Z', desc: 'Applies Z gate to target if control is |1⟩.' },
  ERASER: { name: 'Eraser', desc: 'Remove a gate from the circuit.' },
  CTRL: { name: 'Control Qubit', desc: 'Condition for the CNOT gate.' },
  TARG: { name: 'Target Qubit', desc: 'Flipped if the control qubit is |1⟩.' },
  SWAP1: { name: 'SWAP Qubit 1', desc: 'First qubit to swap.' },
  SWAP2: { name: 'SWAP Qubit 2', desc: 'Second qubit to swap.' },
  CZ_CTRL: { name: 'CZ Control', desc: 'Control for CZ gate.' },
  CZ_TARG: { name: 'CZ Target', desc: 'Target for CZ gate.' }
};

export async function simulateArbitrary(numQubits: number, steps: (string | null)[][], shots: number = 1024): Promise<{stateVector: Vector, counts: Record<string, number>, executedShots: number}> {
  // Try to call backend first
  try {
    const res = await fetch('http://127.0.0.1:5000/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ numQubits, steps, shots })
    });
    if (res.ok) {
      const data = await res.json();
      return {
        stateVector: data.stateVector.map((c: any) => new Complex(c.re, c.im)),
        counts: data.counts,
        executedShots: data.executedShots
      };
    }
  } catch (e) {
    console.warn("Backend unavailable or failed. Falling back to local simulator.", e);
  }

  const size = 1 << numQubits;
  const state: Vector = Array(size).fill(Complex.ZERO);
  state[0] = Complex.ONE; // Initialize |0...0>

  for (const step of steps) {
    const ctrl = step.indexOf('CTRL');
    const targ = step.indexOf('TARG');
    if (ctrl !== -1 && targ !== -1) {
      applyCnotInPlace(state, numQubits, ctrl, targ);
    }

    const swap1 = step.indexOf('SWAP1');
    const swap2 = step.indexOf('SWAP2');
    if (swap1 !== -1 && swap2 !== -1) {
      applySwapInPlace(state, numQubits, swap1, swap2);
    }

    const czCtrl = step.indexOf('CZ_CTRL');
    const czTarg = step.indexOf('CZ_TARG');
    if (czCtrl !== -1 && czTarg !== -1) {
      applyCzInPlace(state, numQubits, czCtrl, czTarg);
    }

    for (let w = 0; w < numQubits; w++) {
      const g = step[w];
      if (g && !['CTRL', 'TARG', 'SWAP1', 'SWAP2', 'CZ_CTRL', 'CZ_TARG'].includes(g)) {
        const matrix = getGateMatrix(g);
        if (matrix) {
          applyGateInPlace(state, numQubits, w, matrix);
        }
      }
    }
  }
  
  const probs = state.map(c => c.magSq());
  const counts: Record<string, number> = {};
  for (let s = 0; s < shots; s++) {
    const r = Math.random();
    let accum = 0;
    for (let i = 0; i < probs.length; i++) {
      accum += probs[i];
      if (r <= accum || i === probs.length - 1) {
        const bin = i.toString(2).padStart(numQubits, '0');
        counts[bin] = (counts[bin] || 0) + 1;
        break;
      }
    }
  }

  return { stateVector: state, counts, executedShots: shots };
}

export function getBlochVector(state: Vector, numQubits: number, wire: number): [number, number, number] {
  const bit = 1 << (numQubits - 1 - wire);
  let rx = 0;
  let ry = 0;
  let rz = 0;

  for (let i = 0; i < state.length; i++) {
    if ((i & bit) === 0) {
      const j = i | bit;
      const c0 = state[i];
      const c1 = state[j];
      
      rx += 2 * (c0.re * c1.re + c0.im * c1.im);
      ry += 2 * (c0.re * c1.im - c0.im * c1.re);
      rz += c0.magSq() - c1.magSq();
    }
  }
  return [rx, ry, rz];
}

function applyGateInPlace(state: Vector, numQubits: number, wire: number, matrix: Complex[][]) {
  const next = [...state];
  const bit = 1 << (numQubits - 1 - wire); // wire 0 is most significant bit
  
  for (let i = 0; i < state.length; i++) {
    if ((i & bit) === 0) {
      const j = i | bit;
      const s0 = state[i];
      const s1 = state[j];
      next[i] = s0.mul(matrix[0][0]).add(s1.mul(matrix[0][1]));
      next[j] = s0.mul(matrix[1][0]).add(s1.mul(matrix[1][1]));
    }
  }
  
  for (let i = 0; i < state.length; i++) state[i] = next[i];
}

function applyCnotInPlace(state: Vector, numQubits: number, ctrl: number, targ: number) {
  const next = [...state];
  const ctrlBit = 1 << (numQubits - 1 - ctrl);
  const targBit = 1 << (numQubits - 1 - targ);
  
  for (let i = 0; i < state.length; i++) {
    if ((i & ctrlBit) !== 0 && (i & targBit) === 0) {
      const j = i | targBit;
      const temp = next[i];
      next[i] = next[j];
      next[j] = temp;
    }
  }
  
  for (let i = 0; i < state.length; i++) state[i] = next[i];
}

function applySwapInPlace(state: Vector, numQubits: number, q1: number, q2: number) {
  const next = [...state];
  const bit1 = 1 << (numQubits - 1 - q1);
  const bit2 = 1 << (numQubits - 1 - q2);
  
  for (let i = 0; i < state.length; i++) {
    if (((i & bit1) !== 0) !== ((i & bit2) !== 0)) {
      const j = i ^ bit1 ^ bit2;
      // To avoid double swapping, only swap if i < j
      if (i < j) {
        const temp = next[i];
        next[i] = next[j];
        next[j] = temp;
      }
    }
  }
  
  for (let i = 0; i < state.length; i++) state[i] = next[i];
}

function applyCzInPlace(state: Vector, numQubits: number, ctrl: number, targ: number) {
  const ctrlBit = 1 << (numQubits - 1 - ctrl);
  const targBit = 1 << (numQubits - 1 - targ);
  
  for (let i = 0; i < state.length; i++) {
    if ((i & ctrlBit) !== 0 && (i & targBit) !== 0) {
      state[i] = new Complex(-state[i].re, -state[i].im);
    }
  }
}
