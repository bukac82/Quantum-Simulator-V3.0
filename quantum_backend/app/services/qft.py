import math

def simulate_qft_state(num_qubits: int, input_state: int, inverse: bool = False):
    N = 2**num_qubits
    if input_state < 0 or input_state >= N:
        return {"error": f"Input state {input_state} out of bounds for {num_qubits} qubits."}
        
    if num_qubits > 20:
        return {"error": "Maximum 20 qubits supported for QFT visualization."}
        
    sign = -1.0 if inverse else 1.0
    
    bloch_vectors = []
    # Qiskit convention: qubit 0 is the least significant bit (LSB)
    for k in range(num_qubits):
        phase = sign * 2.0 * math.pi * input_state / (2**(k + 1))
        bloch_vectors.append({
            "qubit": k,
            "rx": math.cos(phase),
            "ry": math.sin(phase),
            "rz": 0.0
        })
    
    return {
        "blochVectors": bloch_vectors,
        "numQubits": num_qubits,
        "inputState": input_state,
        "inverse": inverse
    }
