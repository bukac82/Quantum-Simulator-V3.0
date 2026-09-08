# ⚛️ Quantum Circuit Simulator

A full-stack quantum computing simulator featuring an interactive circuit designer, real-time state visualization, and multiple quantum algorithm implementations — built with **React + TypeScript** (frontend) and **Python Flask + Qiskit** (backend).

---

## 🗂️ Project Structure

```
GitRepo/
├── quantum_backend/        # Python Flask API (Qiskit-powered)
│   ├── app/
│   │   ├── __init__.py     # Flask app factory
│   │   ├── routes.py       # API endpoints
│   │   └── services/       # Algorithm implementations
│   │       ├── quantum_sim.py
│   │       ├── grover.py
│   │       ├── shor.py
│   │       ├── qaoa.py
│   │       ├── qft.py
│   │       ├── vqe.py
│   │       ├── qiskit_parser.py
│   │       └── __init__.py
│   ├── run.py              # Entry point
│   └── requirement.txt     # Python dependencies
│
└── quantum_frontend/       # React + TypeScript + Vite app
    ├── src/
    │   ├── App.tsx          # Root component & routing
    │   ├── main.tsx         # React entry point
    │   ├── index.css        # Global styles
    │   ├── components/      # Reusable UI components
    │   │   ├── BlochSphere.tsx
    │   │   ├── Histogram.tsx
    │   │   ├── PhaseCircle.tsx
    │   │   ├── PythonCodeView.tsx
    │   │   ├── QiskitIde.tsx
    │   │   ├── QuantumBackground.tsx
    │   │   └── CustomLogo.tsx
    │   ├── pages/           # Algorithm-specific pages
    │   │   ├── GroverAlgorithm.tsx
    │   │   ├── ShorAlgorithm.tsx
    │   │   ├── QAOAAlgorithm.tsx
    │   │   ├── QFTAlgorithm.tsx
    │   │   ├── VQEAlgorithm.tsx
    │   │   └── StateVisualization.tsx
    │   ├── views/           # Main views
    │   │   ├── CircuitDesigner.tsx
    │   │   └── Dashboard.tsx
    │   └── quantum/         # Core quantum logic (TypeScript)
    │       ├── simulator.ts
    │       ├── math.ts
    │       └── qiskitParser.ts
    ├── public/
    │   ├── favicon.svg
    │   └── icons.svg
    ├── index.html
    ├── package.json
    ├── vite.config.ts
    ├── tsconfig.json
    ├── tsconfig.app.json
    ├── tsconfig.node.json
    └── eslint.config.js
```

---

## 🚀 Getting Started

### Prerequisites

- **Python** 3.9+ with `pip`
- **Node.js** 18+ with `npm`

---

### 🔧 Backend Setup

```bash
cd quantum_backend

# Create and activate virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirement.txt

# Run the Flask server
python run.py
```

The backend API will be available at: `http://localhost:5000`

---

### 🎨 Frontend Setup

```bash
cd quantum_frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at: `http://localhost:5173`

---

## ⚙️ Features

| Feature | Description |
|---|---|
| 🔲 Circuit Designer | Drag-and-drop quantum circuit builder with real-time simulation |
| 🌐 Bloch Sphere | 3D qubit state visualization |
| 📊 Histogram | Measurement probability distribution charts |
| 🔄 Grover's Algorithm | Quantum search algorithm with step-by-step walkthrough |
| 🔢 Shor's Algorithm | Integer factorization quantum algorithm |
| 🌊 QFT | Quantum Fourier Transform visualization |
| 🔬 VQE | Variational Quantum Eigensolver |
| 🗺️ QAOA | Quantum Approximate Optimization Algorithm |
| 💻 Qiskit IDE | Write and run Qiskit Python code in the browser |

---

## 🛠️ Tech Stack

### Frontend
- **React 18** + **TypeScript**
- **Vite** (build tool)
- **Three.js** (3D Bloch sphere)

### Backend
- **Python Flask** (REST API)
- **Qiskit** (quantum circuit simulation)
- **NumPy** (linear algebra / matrix operations)

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/simulate` | Run a custom quantum circuit |
| POST | `/api/grover` | Run Grover's search algorithm |
| POST | `/api/shor` | Run Shor's factorization |
| POST | `/api/qft` | Run Quantum Fourier Transform |
| POST | `/api/vqe` | Run VQE algorithm |
| POST | `/api/qaoa` | Run QAOA algorithm |
| POST | `/api/qiskit` | Execute raw Qiskit code |

---

## 📄 License

MIT License — feel free to use, modify, and distribute.
