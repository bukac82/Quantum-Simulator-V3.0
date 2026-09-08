import torch
import numpy as np
import math
from typing import Union, List

class QuantumSimulator:
    """An N-qubit quantum simulator using PyTorch"""
    
    def __init__(self, n_qubits=2, device=None):
        if device is None:
            self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        else:
            self.device = device
        self.n_qubits = n_qubits
        self.state_size = 2**self.n_qubits
        
        # Initialize to |0...0⟩ state
        self.state = torch.zeros(self.state_size, dtype=torch.complex64, device=self.device)
        self.state[0] = 1.0 + 0j
        
        # Define Pauli matrices
        self.I = torch.tensor([[1, 0], [0, 1]], dtype=torch.complex64, device=self.device)
        self.X = torch.tensor([[0, 1], [1, 0]], dtype=torch.complex64, device=self.device)
        self.Y = torch.tensor([[0, -1j], [1j, 0]], dtype=torch.complex64, device=self.device)
        self.Z = torch.tensor([[1, 0], [0, -1]], dtype=torch.complex64, device=self.device)
        self.H = torch.tensor([[1, 1], [1, -1]], dtype=torch.complex64, device=self.device) / math.sqrt(2)
        
        self.S = torch.tensor([[1, 0], [0, 1j]], dtype=torch.complex64, device=self.device)
        t_phase = complex(math.cos(math.pi/4), math.sin(math.pi/4))
        self.T = torch.tensor([[1, 0], [0, t_phase]], dtype=torch.complex64, device=self.device)
    
    def reset(self):
        self.state = torch.zeros(self.state_size, dtype=torch.complex64, device=self.device)
        self.state[0] = 1.0 + 0j
    
    def get_state(self):
        return self.state.clone()
    
    def set_state(self, state: torch.Tensor):
        if state.shape != (self.state_size,):
            raise ValueError(f"State must have shape ({self.state_size},)")
        norm = torch.sqrt(torch.sum(torch.abs(state)**2))
        self.state = state / norm
    
    def get_probabilities(self):
        return torch.abs(self.state)**2
    
    def _single_qubit_gate(self, gate: torch.Tensor, qubit: int):
        tensor_state = self.state.view([2] * self.n_qubits)
        out = torch.tensordot(gate, tensor_state, dims=([1], [qubit]))
        out = torch.movedim(out, 0, qubit)
        self.state = out.reshape(-1)
    
    def _two_qubit_gate(self, gate: torch.Tensor, q1: int, q2: int):
        tensor_state = self.state.view([2] * self.n_qubits)
        U_reshaped = gate.view(2, 2, 2, 2)
        out = torch.tensordot(U_reshaped, tensor_state, dims=([2, 3], [q1, q2]))
        
        rem_indices = [i for i in range(self.n_qubits) if i not in (q1, q2)]
        perm = [0] * self.n_qubits
        perm[q1] = 0
        perm[q2] = 1
        for i, orig_idx in enumerate(rem_indices):
            perm[orig_idx] = i + 2
            
        out = out.permute(perm)
        self.state = out.reshape(-1)
    
    # Single qubit gates
    def x(self, qubit: int): self._single_qubit_gate(self.X, qubit)
    def y(self, qubit: int): self._single_qubit_gate(self.Y, qubit)
    def z(self, qubit: int): self._single_qubit_gate(self.Z, qubit)
    def h(self, qubit: int): self._single_qubit_gate(self.H, qubit)
    def s(self, qubit: int): self._single_qubit_gate(self.S, qubit)
    def t(self, qubit: int): self._single_qubit_gate(self.T, qubit)
    
    def rx(self, angle: float, qubit: int):
        cos_half = math.cos(angle / 2)
        sin_half = math.sin(angle / 2)
        rx_gate = torch.tensor([
            [cos_half, -1j * sin_half],
            [-1j * sin_half, cos_half]
        ], dtype=torch.complex64, device=self.device)
        self._single_qubit_gate(rx_gate, qubit)
    
    def ry(self, angle: float, qubit: int):
        cos_half = math.cos(angle / 2)
        sin_half = math.sin(angle / 2)
        ry_gate = torch.tensor([
            [cos_half, -sin_half],
            [sin_half, cos_half]
        ], dtype=torch.complex64, device=self.device)
        self._single_qubit_gate(ry_gate, qubit)
    
    def rz(self, angle: float, qubit: int):
        exp_neg = complex(math.cos(-angle/2), math.sin(-angle/2))
        exp_pos = complex(math.cos(angle/2), math.sin(angle/2))
        rz_gate = torch.tensor([
            [exp_neg, 0],
            [0, exp_pos]
        ], dtype=torch.complex64, device=self.device)
        self._single_qubit_gate(rz_gate, qubit)
    
    # Two-qubit gates
    def cnot(self, control: int, target: int):
        if control == target:
            raise ValueError("Control and target must be different")
        cnot_gate = torch.tensor([
            [1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 0, 1],
            [0, 0, 1, 0]
        ], dtype=torch.complex64, device=self.device)
        self._two_qubit_gate(cnot_gate, control, target)
    
    def cz(self, control: int, target: int):
        if control == target:
            raise ValueError("Control and target must be different")
        cz_gate = torch.tensor([
            [1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, -1]
        ], dtype=torch.complex64, device=self.device)
        self._two_qubit_gate(cz_gate, control, target)
    
    def swap(self, q1: int, q2: int):
        if q1 == q2:
            return
        swap_gate = torch.tensor([
            [1, 0, 0, 0],
            [0, 0, 1, 0],
            [0, 1, 0, 0],
            [0, 0, 0, 1]
        ], dtype=torch.complex64, device=self.device)
        self._two_qubit_gate(swap_gate, q1, q2)
        
    def measure(self, qubit: int = None):
        probabilities = self.get_probabilities()
        
        if qubit is None:
            # Measure all qubits
            outcome = torch.multinomial(probabilities, 1).item()
            self.state = torch.zeros_like(self.state)
            self.state[outcome] = 1.0 + 0j
            return outcome
        else:
            # Measure single qubit
            tensor_probs = probabilities.view([2] * self.n_qubits)
            # Sum over all axes except `qubit` to get marginal probability
            axes_to_sum = [i for i in range(self.n_qubits) if i != qubit]
            if axes_to_sum:
                marginals = torch.sum(tensor_probs, dim=axes_to_sum)
            else:
                marginals = tensor_probs
            prob_0 = marginals[0].item()
            
            outcome = 0 if torch.rand(1).item() < prob_0 else 1
            
            # Collapse state
            tensor_state = self.state.view([2] * self.n_qubits)
            if outcome == 0:
                # Set slices where qubit=1 to 0
                idx = [slice(None)] * self.n_qubits
                idx[qubit] = 1
                tensor_state[tuple(idx)] = 0
                norm = math.sqrt(prob_0)
            else:
                idx = [slice(None)] * self.n_qubits
                idx[qubit] = 0
                tensor_state[tuple(idx)] = 0
                norm = math.sqrt(1 - prob_0)
                
            if norm > 0:
                self.state = (tensor_state / norm).reshape(-1)
            else:
                self.state = tensor_state.reshape(-1)
                
            return outcome
            
    def expectation_value(self, observable: torch.Tensor):
        if observable.shape != (self.state_size, self.state_size):
            raise ValueError(f"Observable must be {self.state_size}x{self.state_size}")
        return torch.real(torch.conj(self.state) @ observable @ self.state).item()

    def print_state(self):
        print("Quantum State:")
        for i, amplitude in enumerate(self.state):
            if torch.abs(amplitude) > 1e-10:
                real_part = torch.real(amplitude).item()
                imag_part = torch.imag(amplitude).item()
                label = format(i, f'0{self.n_qubits}b')
                
                if abs(imag_part) < 1e-10:
                    print(f"  {real_part:.4f} |{label}⟩")
                elif abs(real_part) < 1e-10:
                    print(f"  {imag_part:.4f}i |{label}⟩")
                else:
                    sign = "+" if imag_part >= 0 else "-"
                    print(f"  ({real_part:.4f} {sign} {abs(imag_part):.4f}i) |{label}⟩")
