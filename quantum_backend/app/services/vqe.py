import math
import random

def simulate_vqe_convergence(molecule: str, qubits: int, ansatz: str, optimizer: str, shots: int):
    # Determine target energy based on molecule
    if "H2" in molecule:
        target_energy = -1.137306
        start_energy = -0.1
    elif "LiH" in molecule:
        target_energy = -7.882
        start_energy = -5.0
    else:
        target_energy = -3.5
        start_energy = -1.0
        
    # Optimizer convergence characteristics
    if optimizer == "COBYLA":
        num_iters = 80
        noise = 0.005
        decay = 0.06
    elif optimizer == "SPSA":
        num_iters = 150
        noise = 0.08
        decay = 0.04
    elif optimizer == "SLSQP":
        num_iters = 40
        noise = 0.001
        decay = 0.15
    else:
        num_iters = 100
        noise = 0.01
        decay = 0.05
        
    energy_trace = []
    
    for i in range(num_iters):
        # Exponential decay towards target energy
        ideal_energy = target_energy + (start_energy - target_energy) * math.exp(-decay * i)
        
        # Add noise based on optimizer and shots
        shot_noise = 1.0 / math.sqrt(max(shots, 1)) if shots > 0 else 0
        actual_noise = noise + (shot_noise * 0.1)
        
        if optimizer == "SPSA":
            # SPSA has high variance early on that decreases
            jitter = (random.random() - 0.5) * actual_noise * abs(target_energy) * (1.0 - i/num_iters)
        else:
            jitter = (random.random() - 0.5) * actual_noise * 0.2
            
        current_energy = ideal_energy + jitter
        
        # Don't let it drift significantly below true ground state
        if current_energy < target_energy - 0.01:
            current_energy = target_energy - (random.random() * 0.01)
            
        energy_trace.append(current_energy)
        
    final_energy = energy_trace[-1]
    
    return {
        "molecule": molecule,
        "finalEnergy": final_energy,
        "targetEnergy": target_energy,
        "energyTrace": energy_trace,
        "optimizer": optimizer,
        "ansatz": ansatz,
        "numQubits": qubits
    }
