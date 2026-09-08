import ast
import math

def safe_eval_angle(node):
    if isinstance(node, ast.Constant):
        return float(node.value)
    elif isinstance(node, ast.Name):
        if node.id == 'pi':
            return math.pi
    elif isinstance(node, ast.UnaryOp):
        if isinstance(node.op, ast.USub):
            val = safe_eval_angle(node.operand)
            return -val if val is not None else None
    elif isinstance(node, ast.BinOp):
        left = safe_eval_angle(node.left)
        right = safe_eval_angle(node.right)
        if left is None or right is None:
            return None
        if isinstance(node.op, ast.Add):
            return left + right
        elif isinstance(node.op, ast.Sub):
            return left - right
        elif isinstance(node.op, ast.Mult):
            return left * right
        elif isinstance(node.op, ast.Div):
            if right == 0: return None
            return left / right
    return None
def parse_qiskit_code(code: str):
    """
    Parses Qiskit Python code using AST to safely extract circuit steps without executing it.
    Returns a dict with numQubits and steps list, or None if parsing fails.
    """
    try:
        tree = ast.parse(code)
    except SyntaxError:
        return None
        
    num_qubits = 2
    
    # First pass: find QuantumCircuit initialization to get num_qubits
    for node in ast.walk(tree):
        if isinstance(node, ast.Assign) and isinstance(node.value, ast.Call):
            func = node.value.func
            if isinstance(func, ast.Name) and func.id == 'QuantumCircuit':
                if node.value.args and isinstance(node.value.args[0], ast.Constant):
                    num_qubits = max(1, min(6, int(node.value.args[0].value)))
    
    steps = []
    
    def add_new_step():
        steps.append([None] * num_qubits)
        return len(steps) - 1
        
    def try_add_gate(wires, gates):
        if not steps:
            add_new_step()
        step_idx = len(steps) - 1
        
        # Check if can fit
        can_fit = True
        for w in wires:
            if w >= num_qubits or steps[step_idx][w] is not None:
                can_fit = False
                break
                
        if not can_fit:
            step_idx = add_new_step()
            for w in wires:
                if w >= num_qubits:
                    return False
                    
        for w, g in zip(wires, gates):
            steps[step_idx][w] = g
        return True

    # Second pass: Extract gates
    for node in ast.iter_child_nodes(tree):
        if isinstance(node, ast.Expr) and isinstance(node.value, ast.Call):
            call = node.value
            if isinstance(call.func, ast.Attribute) and isinstance(call.func.value, ast.Name) and call.func.value.id == 'qc':
                cmd = call.func.attr
                args = call.args
                
                # Single qubit gates
                if cmd in ['h', 'x', 'y', 'z', 's', 't']:
                    if len(args) == 1 and isinstance(args[0], ast.Constant):
                        try_add_gate([args[0].value], [cmd.upper()])
                
                # Parameterized gates
                elif cmd in ['rx', 'ry', 'rz']:
                    if len(args) == 2 and isinstance(args[1], ast.Constant):
                        theta = safe_eval_angle(args[0])
                        w = args[1].value
                        if theta is not None:
                            try_add_gate([w], [f"{cmd.upper()}({theta:.4f})"])
                
                # Two qubit gates
                elif cmd == 'cx':
                    if len(args) == 2 and isinstance(args[0], ast.Constant) and isinstance(args[1], ast.Constant):
                        try_add_gate([args[0].value, args[1].value], ['CTRL', 'TARG'])
                
                elif cmd == 'cz':
                    if len(args) == 2 and isinstance(args[0], ast.Constant) and isinstance(args[1], ast.Constant):
                        try_add_gate([args[0].value, args[1].value], ['CZ_CTRL', 'CZ_TARG'])
                
                elif cmd == 'swap':
                    if len(args) == 2 and isinstance(args[0], ast.Constant) and isinstance(args[1], ast.Constant):
                        try_add_gate([args[0].value, args[1].value], ['SWAP1', 'SWAP2'])

    # Pad to at least 8 steps
    while len(steps) < 8:
        steps.append([None] * num_qubits)
        
    return {"numQubits": num_qubits, "steps": steps}
