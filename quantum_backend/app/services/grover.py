import torch
import math

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

def simulate_grover(n_qubits: int, target_binary: str, iterations: int, shots: int):
    """
    Simulates Grover's algorithm directly using tensor operations for the Oracle and Diffusion.
    """
    state_size = 2 ** n_qubits
    
    # Step 1: Initialize to equal superposition |+...+\rangle
    state = torch.ones(state_size, dtype=torch.complex64, device=device) / math.sqrt(state_size)
    
    try:
        target_idx = int(target_binary, 2)
    except ValueError:
        target_idx = 0
        
    if target_idx >= state_size:
        target_idx = state_size - 1
    
    # Step 2: Grover Iterations
    for _ in range(iterations):
        # Oracle: flip the sign of the target amplitude
        state[target_idx] *= -1
        
        # Diffusion operator: reflection about the mean
        mean_amp = torch.mean(state)
        state = 2 * mean_amp - state
        
    # Calculate probabilities
    probs = torch.abs(state)**2
    
    # Sample counts
    counts = {}
    
    # If the probability is perfectly concentrated on the target (which happens at optimal iterations), 
    # we can just use torch.multinomial to sample.
    if shots > 0:
        outcomes = torch.multinomial(probs, shots, replacement=True)
        for outcome in outcomes:
            bin_str = format(outcome.item(), f'0{n_qubits}b')
            counts[bin_str] = counts.get(bin_str, 0) + 1
            
    # Serialize state vector
    state_vector = [{"re": float(c.real), "im": float(c.imag)} for c in state]
    
    return {
        "stateVector": state_vector,
        "counts": counts,
        "executedShots": shots
    }
