from flask import Blueprint, request, jsonify
from app.services.quantum_sim import QuantumSimulator
from app.services.qiskit_parser import parse_qiskit_code
from app.services.grover import simulate_grover
from app.services.shor import simulate_shor
from app.services.qft import simulate_qft_state
from app.services.qaoa import simulate_qaoa_maxcut
from app.services.vqe import simulate_vqe_convergence
import re
import random

api = Blueprint('api', __name__)

@api.route('/simulate', methods=['POST'])
def simulate():
    data = request.json
    num_qubits = data.get('numQubits', 2)
    steps = data.get('steps', [])
    shots = data.get('shots', 1024)

    sim = QuantumSimulator(n_qubits=num_qubits, device='cpu')
    
    for step in steps:
        # Check for two-qubit gates
        if 'CTRL' in step and 'TARG' in step:
            ctrl = step.index('CTRL')
            targ = step.index('TARG')
            sim.cnot(ctrl, targ)
        if 'SWAP1' in step and 'SWAP2' in step:
            w1 = step.index('SWAP1')
            w2 = step.index('SWAP2')
            sim.swap(w1, w2)
        if 'CZ_CTRL' in step and 'CZ_TARG' in step:
            ctrl = step.index('CZ_CTRL')
            targ = step.index('CZ_TARG')
            sim.cz(ctrl, targ)
            
        # Check for single-qubit gates
        for w, gate in enumerate(step):
            if not gate or gate in ['CTRL', 'TARG', 'SWAP1', 'SWAP2', 'CZ_CTRL', 'CZ_TARG']:
                continue
            
            if gate == 'H': sim.h(w)
            elif gate == 'X': sim.x(w)
            elif gate == 'Y': sim.y(w)
            elif gate == 'Z': sim.z(w)
            elif gate == 'S': sim.s(w)
            elif gate == 'T': sim.t(w)
            elif gate.startswith('RX'):
                match = re.search(r'RX\(([-.\d]+)\)', gate)
                if match: sim.rx(float(match.group(1)), w)
            elif gate.startswith('RY'):
                match = re.search(r'RY\(([-.\d]+)\)', gate)
                if match: sim.ry(float(match.group(1)), w)
            elif gate.startswith('RZ'):
                match = re.search(r'RZ\(([-.\d]+)\)', gate)
                if match: sim.rz(float(match.group(1)), w)

    # Get state vector
    state = sim.get_state()
    state_vector = [{"re": float(amp.real), "im": float(amp.imag)} for amp in state]

    # Get probabilities
    probs = sim.get_probabilities().tolist()

    # Simulate shots
    counts = {}
    for _ in range(shots):
        r = random.random()
        accum = 0
        for i, p in enumerate(probs):
            accum += p
            if r <= accum or i == len(probs) - 1:
                bin_str = format(i, f'0{num_qubits}b')
                counts[bin_str] = counts.get(bin_str, 0) + 1
                break

    return jsonify({
        "stateVector": state_vector,
        "counts": counts,
        "executedShots": shots
    })

@api.route('/parse-qiskit', methods=['POST'])
def parse_qiskit():
    data = request.json
    code = data.get('code', '')
    
    parsed = parse_qiskit_code(code)
    if parsed is None:
        return jsonify({"error": "Failed to parse Qiskit code. Please check syntax."}), 400
        
    return jsonify(parsed)

@api.route('/simulate-grover', methods=['POST'])
def grover_endpoint():
    data = request.json
    num_qubits = data.get('qubits', 3)
    target = data.get('target', '101')
    iterations = data.get('iterations', 2)
    shots = data.get('shots', 1024)
    
    result = simulate_grover(num_qubits, target, iterations, shots)
    return jsonify(result)

@api.route('/simulate-shor', methods=['POST'])
def shor_endpoint():
    data = request.json
    N = data.get('N', 15)
    a = data.get('a', 7)
    shots = data.get('shots', 1024)
    
    result = simulate_shor(N, a, shots)
    if "error" in result:
        return jsonify(result), 400
    return jsonify(result)

@api.route('/simulate-qft', methods=['POST'])
def qft_endpoint():
    data = request.json
    num_qubits = data.get('qubits', 3)
    input_state_bin = data.get('inputState', '000')
    inverse = data.get('inverse', False)
    
    try:
        input_state = int(input_state_bin, 2)
    except ValueError:
        return jsonify({"error": "Invalid binary input state."}), 400
        
    result = simulate_qft_state(num_qubits, input_state, inverse)
    if "error" in result:
        return jsonify(result), 400
    return jsonify(result)

@api.route('/simulate-qaoa', methods=['POST'])
def qaoa_endpoint():
    data = request.json
    qubits = data.get('qubits', 4)
    layers = data.get('layers', 2)
    shots = data.get('shots', 1000)
    mixer_type = data.get('mixerType', 'Standard (X mixer)')
    warm_start = data.get('warmStart', False)
    edges = data.get('edges', '[]')
    
    result = simulate_qaoa_maxcut(qubits, layers, edges, shots, mixer_type, warm_start)
    if "error" in result:
        return jsonify(result), 400
    return jsonify(result)

@api.route('/simulate-vqe', methods=['POST'])
def vqe_endpoint():
    data = request.json
    qubits = data.get('qubits', 2)
    ansatz = data.get('ansatz', 'RealAmplitudes')
    optimizer = data.get('optimizer', 'COBYLA')
    shots = data.get('shots', 1024)
    hamiltonian = data.get('hamiltonian', 'H2 Molecule')
    
    result = simulate_vqe_convergence(hamiltonian, qubits, ansatz, optimizer, shots)
    if "error" in result:
        return jsonify(result), 400
    return jsonify(result)
