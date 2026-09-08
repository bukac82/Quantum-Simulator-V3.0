export async function parseQiskitToSteps(code: string): Promise<{ numQubits: number, steps: (string | null)[][] } | null> {
  try {
    const res = await fetch('http://127.0.0.1:5000/parse-qiskit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });
    
    if (res.ok) {
      const parsed = await res.json();
      return { numQubits: parsed.numQubits, steps: parsed.steps };
    } else {
      const err = await res.json();
      console.error("Backend parser error:", err.error);
      throw new Error(err.error || "Failed to parse Qiskit code.");
    }
  } catch (err) {
    console.error("Error communicating with parsing backend", err);
    throw err;
  }
}