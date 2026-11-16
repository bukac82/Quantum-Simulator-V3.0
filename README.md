# ⚛️ Quantum Circuit Simulator

An interactive, browser-based quantum computing playground. Build circuits with a visual designer, watch the state evolve on a Bloch sphere, and explore five classic quantum algorithms through guided visualizations.

**Stack:** React + TypeScript + Vite (frontend) · Flask + PyTorch (backend)

> **Please read:** this is an **educational visualization tool**, not a production quantum SDK. The circuit designer and Grover's algorithm run real state-vector simulations. The Shor, QFT, QAOA and VQE pages are **illustrative models** — see [What's real and what's illustrative](#-whats-real-and-whats-illustrative) below.

---

## ✨ Features

| Area | What it does |
|------|--------------|
| **Circuit Designer** | Build 1–6 qubit circuits (up to 30 steps) with H, X, Y, Z, S, T, RX/RY/RZ, CNOT, CZ and SWAP. Run up to 100,000 shots and view the measurement histogram and state vector. |
| **Qiskit IDE** | Paste Qiskit-style code and sync it into the visual circuit (parsed, **not executed** — see [limitations](#qiskit-ide-limitations)). |
| **Qiskit code export** | The designer generates equivalent Qiskit code for your circuit. |
| **State Visualization** | Per-qubit Bloch spheres (Three.js) and complex-amplitude phase circles. |
| **Algorithm pages** | Grover's search, Shor's factoring, QFT, QAOA (Max-Cut), VQE. |
| **Local fallback** | If the backend is unreachable, the designer falls back to a built-in TypeScript simulator. |

*Roadmap item shown in the UI:* connecting to real quantum hardware (not implemented).

---

## 🔬 What's real and what's illustrative

| Feature | Status | How it works |
|---------|--------|--------------|
| Circuit Designer | ✅ **Real simulation** | Full state-vector simulation (PyTorch on the backend, TypeScript in the browser fallback). Shot sampling from the exact probabilities. |
| Grover's algorithm | ✅ **Real simulation** | Oracle sign-flip and diffusion (reflection about the mean) applied directly to the amplitude vector. |
| Shor's algorithm | 🟡 **Hybrid** | The period `r` is found **classically** by brute force. The post-measurement register state is then built analytically and the QFT is applied via FFT. Factors come from classical post-processing. |
| QFT | 🟡 **Analytic** | Bloch-sphere angles are computed from a closed-form formula for **computational-basis inputs only**; it does not simulate arbitrary input states. |
| QAOA | 🔴 **Illustrative model** | Computes the Max-Cut cost of every bitstring, then samples from a Boltzmann-style distribution `∝ exp(α · cost)` where α grows with the layer count. No cost/mixer unitaries are applied and no parameters are optimized. |
| VQE | 🔴 **Illustrative model** | Plots a synthetic convergence curve (exponential decay + noise) toward hardcoded reference energies (H₂ ≈ −1.137, LiH ≈ −7.882). Ansatz, qubit count and Hamiltonian do not affect the result; no optimizer runs. |

Contributions that replace the QAOA and VQE models with real variational simulations are very welcome (see [Contributing](#-contributing)).

---

## 🚀 Quick Start

### Prerequisites

- **Python 3** with `pip` (a recent version — the pinned `numpy`/`torch` releases need a modern Python; 3.11+ is a safe choice)
- **Node.js 20+** with `npm` (required by the current Vite version)
- **Git**

> ⚠️ The backend depends on **PyTorch**, which is a large download (hundreds of MB to several GB depending on platform/CUDA). A CPU-only build is sufficient — see the [PyTorch install selector](https://pytorch.org/get-started/locally/) if you want to install it manually first.

### 1. Clone

```bash
git clone https://github.com/bukac82/Quantum-Simulator-V3.0.git
cd Quantum-Simulator-V3.0
```

### 2. Backend (Flask)

```bash
cd quantum_backend
python -m venv venv

# macOS / Linux
source venv/bin/activate
# Windows
venv\Scripts\activate

pip install -r requirement.txt
python run.py
```

The API runs at **http://localhost:5000** (note: the requirements file is named `requirement.txt`, singular).

### 3. Frontend (React + Vite)

```bash
cd quantum_frontend
npm install
npm run dev
```

Open **http://localhost:5173**.

---

## 📡 API Reference

All endpoints are `POST`, accept and return JSON, and are served from the root path (there is **no** `/api` prefix).

| Endpoint | Purpose | Request body (defaults in parentheses) |
|----------|---------|----------------------------------------|
| `/simulate` | Run a circuit | `numQubits` (2), `steps`, `shots` (1024) |
| `/parse-qiskit` | Convert Qiskit-style code to circuit steps | `code` |
| `/simulate-grover` | Grover's search | `qubits` (3), `target` ("101"), `iterations` (2), `shots` (1024) |
| `/simulate-shor` | Period finding / factoring | `N` (15), `a` (7), `shots` (1024) |
| `/simulate-qft` | QFT Bloch vectors | `qubits` (3), `inputState` ("000"), `inverse` (false) |
| `/simulate-qaoa` | Max-Cut QAOA model | `qubits` (4), `layers` (2), `edges` (JSON string, e.g. `"[[0,1],[1,2]]"`), `shots` (1000), `mixerType`, `warmStart` |
| `/simulate-vqe` | VQE convergence model | `qubits` (2), `ansatz`, `optimizer` ("COBYLA"), `shots` (1024), `hamiltonian` ("H2 Molecule") |

### `steps` format for `/simulate`

`steps` is a list of columns (time steps). Each column is a list with one entry per qubit wire: a gate name or `null`.

```json
{
  "numQubits": 2,
  "shots": 1024,
  "steps": [
    ["H", null],
    ["CTRL", "TARG"]
  ]
}
```

Gate tokens: `H X Y Z S T`, `RX(θ) RY(θ) RZ(θ)` (θ in radians, e.g. `"RX(1.5708)"`), and paired two-qubit markers `CTRL/TARG` (CNOT), `CZ_CTRL/CZ_TARG` (CZ), `SWAP1/SWAP2` (SWAP).

Qubit ordering: **wire 0 is the most significant bit** in the state vector and in bitstring labels.

**Example**

```bash
curl -X POST http://localhost:5000/simulate \
  -H "Content-Type: application/json" \
  -d '{"numQubits":2,"shots":1000,"steps":[["H",null],["CTRL","TARG"]]}'
```

Returns `stateVector` (list of `{re, im}`), `counts`, and `executedShots`. A Bell-state circuit should give roughly 50/50 `00` and `11`.

---

## 🧩 Qiskit IDE limitations

The Qiskit IDE uses Python's `ast` module to **read** your code — it never runs it, which is a deliberate safety choice. As a result, it only understands a small subset:

- The circuit variable must be named **`qc`**, created with `QuantumCircuit(n)`.
- Supported calls (top level only, with literal arguments): `h x y z s t`, `rx ry rz` (angles may use `pi` and `+ - * /`), `cx`, `cz`, `swap`.
- **Qubits are clamped to 6.** Gates on wires beyond the limit are dropped.
- Loops, functions, variables as qubit indices, other gates (`ccx`, etc.), and `measure` are **silently ignored**.

If "Run & Sync" produces fewer gates than you expect, one of these is why.

---

## 📂 Project Structure

```
Quantum-Simulator-V3.0/
├── quantum_backend/
│   ├── run.py                     # Entry point (port 5000)
│   ├── requirement.txt
│   └── app/
│       ├── __init__.py            # Flask app factory (CORS enabled)
│       ├── routes.py              # All API endpoints
│       └── services/
│           ├── quantum_sim.py     # N-qubit state-vector simulator (PyTorch)
│           ├── grover.py
│           ├── shor.py
│           ├── qft.py
│           ├── qaoa.py
│           ├── vqe.py
│           └── qiskit_parser.py   # AST-based Qiskit subset parser
│
└── quantum_frontend/
    └── src/
        ├── App.tsx
        ├── views/                 # Dashboard.tsx, CircuitDesigner.tsx
        ├── pages/                 # Grover, Shor, QFT, QAOA, VQE, StateVisualization
        ├── components/            # BlochSphere, Histogram, PhaseCircle,
        │                          # QiskitIde, PythonCodeView, ...
        └── quantum/               # simulator.ts (local fallback), math.ts, qiskitParser.ts
```

---

## 🛠️ Technology

**Frontend:** React 19, TypeScript, Vite, Tailwind CSS 4, Three.js with `@react-three/fiber` / `drei`, lucide-react
**Backend:** Flask 3, Flask-CORS, PyTorch, NumPy

Exact versions are pinned in `quantum_backend/requirement.txt` and `quantum_frontend/package.json`.

---

## 🧪 Development

```bash
# Frontend
cd quantum_frontend
npm run dev      # dev server
npm run lint     # ESLint
npm run build    # type-check + production build → dist/
```

There is **no automated test suite yet**. Good first tests to add:

- Bell state → ~50/50 `00`/`11`
- GHZ state → ~50/50 `000`/`111`
- Grover (3 qubits, 2 iterations) → target probability ≈ 94%
- Backend and TypeScript simulators agree on random circuits

### Known limitations

- Simulation cost grows as 2ⁿ. The UI caps the designer at 6 qubits; the backend does **not** validate `numQubits` on `/simulate`, `/simulate-grover` or `/simulate-shor`, so don't expose it to untrusted users as-is.
- `run.py` starts Flask with `debug=True` and CORS open to all origins. This is for **local development only** — do not deploy it that way.
- The frontend calls `http://127.0.0.1:5000` directly (hardcoded). If you host the backend elsewhere, update the URLs in `src/quantum/` and `src/pages/`.
- The designer silently falls back to the local TypeScript simulator when the backend is unreachable.

---

## 🤝 Contributing

1. Fork the repo and create a branch (`git checkout -b feature/my-change`)
2. Make your changes and commit
3. Open a pull request

Especially welcome:

- A real statevector **QAOA** and **VQE** (cost/mixer unitaries or an ansatz + classical optimizer)
- Input validation and qubit caps on the backend
- A test suite (pytest + Vitest)
- A configurable API URL (`VITE_API_URL`)
- Better Qiskit parsing (loops, `measure`, `ccx`) with clear errors for unsupported code

---

## 📝 License

Add a `LICENSE` file to the repository root (e.g. MIT) so others know how they may use this project.

---

## 📚 Learning Resources

- [Qiskit Documentation](https://docs.quantum.ibm.com/)
- [Qiskit Textbook](https://github.com/Qiskit/textbook)
- [arXiv quant-ph](https://arxiv.org/list/quant-ph/recent)
