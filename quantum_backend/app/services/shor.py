import torch
import math

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

def gcd(a, b):
    while b:
        a, b = b, a % b
    return a

def simulate_shor(N: int, a: int, shots: int):
    """
    Simulates the quantum part of Shor's algorithm (Period Finding) 
    using efficient FFT for the QFT over the counting register.
    """
    if gcd(a, N) != 1:
        return {"error": f"Base {a} and N={N} are not coprime. GCD is {gcd(a, N)}."}
        
    # Find period r classically
    r = 1
    val = a % N
    while val != 1:
        val = (val * a) % N
        r += 1
        if r > N + 1:
            return {"error": "Could not find period."}
            
    # Number of qubits for counting register: Q >= N^2
    n = math.ceil(math.log2(N**2))
    if n < 8: n = 8 # minimum 8 qubits for nice visuals
    
    Q = 2**n
    
    # We simulate the state of the top register AFTER measuring the bottom register.
    # Suppose the bottom register measured a^x0 mod N.
    # The top register collapses to a superposition of |x0 + m*r>
    import random
    x0 = random.randint(0, r - 1)
    
    state = torch.zeros(Q, dtype=torch.complex64)
    
    m_count = 0
    for m in range((Q - x0 + r - 1) // r):
        idx = x0 + m * r
        if idx < Q:
            state[idx] = 1.0
            m_count += 1
            
    # Move to device
    state = state.to(device)
            
    # Normalize
    state = state / math.sqrt(m_count)
    
    # Apply QFT (which is just Inverse FFT mathematically)
    state_qft = torch.fft.ifft(state, norm="ortho")
    
    # Calculate probabilities
    probs = torch.abs(state_qft)**2
    
    # Sample counts
    counts = {}
    if shots > 0:
        outcomes = torch.multinomial(probs, shots, replacement=True)
        for outcome in outcomes:
            bin_str = format(outcome.item(), f'0{n}b')
            counts[bin_str] = counts.get(bin_str, 0) + 1
            
    # Calculate Factors (Classical Post-processing)
    factors = []
    if r % 2 == 0:
        p = gcd(pow(a, r // 2, N) - 1, N)
        q = gcd(pow(a, r // 2, N) + 1, N)
        factors = [p, q]
            
    return {
        "counts": counts,
        "executedShots": shots,
        "period": r,
        "factors": factors,
        "numQubits": n
    }
