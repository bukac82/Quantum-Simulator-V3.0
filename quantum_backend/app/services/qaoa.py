import json
import torch
import math

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

def simulate_qaoa_maxcut(qubits: int, layers: int, edges_json: str, shots: int, mixer_type: str, warm_start: bool):
    try:
        edges = json.loads(edges_json)
    except:
        return {"error": "Invalid JSON format for edges. Expected format: [[0,1], [1,2], ...]"}
        
    if qubits > 15:
        return {"error": "Maximum 15 qubits supported for QAOA simulation."}
        
    N = 2**qubits
    
    # We will compute the Max-Cut cost for every possible bitstring
    costs = torch.zeros(N, dtype=torch.float32)
    
    valid_edges = []
    for edge in edges:
        if isinstance(edge, list) and len(edge) == 2:
            u, v = edge
            if 0 <= u < qubits and 0 <= v < qubits:
                valid_edges.append((u, v))
                
    if not valid_edges:
        return {"error": "No valid edges provided for the given number of qubits."}
    
    for i in range(N):
        cost = 0
        for u, v in valid_edges:
            bit_u = (i >> u) & 1
            bit_v = (i >> v) & 1
            if bit_u != bit_v:
                cost += 1
        costs[i] = cost
        
    costs = costs.to(device)
        
    max_cost = torch.max(costs).item()
    
    # Simulate the outcome distribution of an optimized QAOA circuit
    # Higher p (layers) means the probability distribution is sharper around the optimal solutions.
    alpha = 1.0 + (layers * 0.8)
    if warm_start:
        alpha += 1.5
    if mixer_type == 'XY Mixer':
        alpha += 0.5
        
    probs = torch.exp(alpha * costs)
    probs = probs / torch.sum(probs)
    
    counts = {}
    if shots > 0:
        outcomes = torch.multinomial(probs, shots, replacement=True)
        for outcome in outcomes:
            bin_str = format(outcome.item(), f'0{qubits}b')
            counts[bin_str] = counts.get(bin_str, 0) + 1
            
    best_cost_indices = (costs == max_cost).nonzero(as_tuple=True)[0]
    best_cuts = [format(idx.item(), f'0{qubits}b') for idx in best_cost_indices]
    
    return {
        "counts": counts,
        "executedShots": shots,
        "maxCutValue": int(max_cost),
        "bestCuts": best_cuts,
        "numQubits": qubits
    }
