import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Line, Text, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface BlochSphereProps {
  key?: string | number;
  rx: number;
  ry: number;
  rz: number;
  label: string;
}

function BlochSphere3D({ rx, ry, rz }: { rx: number; ry: number; rz: number }) {
  const groupRef = useRef<THREE.Group>(null);
  
  // Normalize vector if length > 1 due to floating point
  const length = Math.sqrt(rx * rx + ry * ry + rz * rz);
  const vScale = length > 1 ? 1 / length : 1;

  // Bloch sphere convention:
  // z is |0> to |1> (vertical, so Three.js Y-axis)
  // x is Three.js X-axis
  // y is Three.js Z-axis
  const vec = useMemo(() => new THREE.Vector3(rx * vScale, rz * vScale, ry * vScale), [rx, ry, rz, vScale]);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Sphere */}
      <Sphere args={[1, 32, 32]}>
        <meshPhysicalMaterial
          color="#1e293b"
          transparent
          opacity={0.3}
          roughness={0.1}
          metalness={0.8}
          side={THREE.DoubleSide}
        />
      </Sphere>

      {/* Equator */}
      <Line
        points={Array.from({ length: 65 }).map((_, i) => {
          const angle = (i / 64) * Math.PI * 2;
          return new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));
        })}
        color="#475569"
        lineWidth={1.5}
        dashed
        dashScale={5}
        dashSize={0.2}
        dashOffset={0}
      />

      {/* Axes */}
      <Line points={[[-1.2, 0, 0], [1.2, 0, 0]]} color="#64748b" opacity={0.3} transparent />
      <Line points={[[0, -1.2, 0], [0, 1.2, 0]]} color="#64748b" opacity={0.3} transparent />
      <Line points={[[0, 0, -1.2], [0, 0, 1.2]]} color="#64748b" opacity={0.3} transparent />

      {/* Labels */}
      <Text position={[0, 1.3, 0]} color="#94a3b8" fontSize={0.2}>|0⟩</Text>
      <Text position={[0, -1.3, 0]} color="#94a3b8" fontSize={0.2}>|1⟩</Text>
      <Text position={[1.3, 0, 0]} color="#94a3b8" fontSize={0.2}>x</Text>
      <Text position={[0, 0, 1.3]} color="#94a3b8" fontSize={0.2}>y</Text>

      {/* Vector */}
      <Line points={[[0, 0, 0], vec]} color="#60a5fa" lineWidth={3} />
      <Sphere args={[0.05, 16, 16]} position={vec}>
        <meshBasicMaterial color="#93c5fd" />
      </Sphere>
    </group>
  );
}

export function BlochSphere({ rx, ry, rz, label }: BlochSphereProps) {
  const length = Math.sqrt(rx*rx + ry*ry + rz*rz);
  const isPure = length > 0.99;

  return (
    <div className="flex flex-col items-center gap-4 bg-slate-800/80 p-4 rounded-2xl border border-slate-700/50 shadow-md transition-all hover:shadow-lg hover:bg-slate-800 hover:border-slate-600">
      <div className="text-sm font-mono font-bold text-slate-200 bg-slate-900 px-3 py-1 rounded-md shadow-inner border border-slate-700">
        Qubit {label}
      </div>
      <div className="relative w-40 h-40">
        <Canvas camera={{ position: [1.8, 1.2, 1.8], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <BlochSphere3D rx={rx} ry={ry} rz={rz} />
          <OrbitControls enableZoom={false} enablePan={false} />
        </Canvas>
      </div>
      <div className="flex flex-col items-center gap-1 w-full text-center">
        {!isPure && (
          <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20 mb-1">
            Mixed
          </div>
        )}
        <div className="text-xs text-slate-400 font-mono grid grid-cols-3 gap-2 w-full px-2">
          <div><span className="text-slate-500">x:</span> {rx.toFixed(2)}</div>
          <div><span className="text-slate-500">y:</span> {ry.toFixed(2)}</div>
          <div><span className="text-slate-500">z:</span> {rz.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
}