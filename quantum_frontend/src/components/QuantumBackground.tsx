import { useEffect, useRef } from 'react';

export function QuantumBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const nodes: { x: number; y: number; z: number; vx: number; vy: number; vz: number }[] = [];
    const numNodes = 300; // Increased density

    for (let i = 0; i < numNodes; i++) {
      nodes.push({
        x: (Math.random() - 0.5) * 4000,
        y: (Math.random() - 0.5) * 4000,
        z: (Math.random() - 0.5) * 4000,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        vz: (Math.random() - 0.5) * 2,
      });
    }

    let animationFrameId: number;
    let angle = 0;

    const draw = () => {
      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      angle += 0.001;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);

      const fov = 800;

      const projectedNodes = nodes.map(node => {
        node.x += node.vx;
        node.y += node.vy;
        node.z += node.vz;

        if (Math.abs(node.x) > 2000) node.vx *= -1;
        if (Math.abs(node.y) > 2000) node.vy *= -1;
        if (Math.abs(node.z) > 2000) node.vz *= -1;

        const rx = node.x * cos - node.z * sin;
        const rz = node.z * cos + node.x * sin;
        const ry = node.y;

        const z = rz + 2000;
        const scale = fov / Math.max(fov + z, 1);
        
        return {
          px: rx * scale + width / 2,
          py: ry * scale + height / 2,
          scale,
          z
        };
      });

      ctx.lineWidth = 1;
      
      for (let i = 0; i < projectedNodes.length; i++) {
        for (let j = i + 1; j < projectedNodes.length; j++) {
          const dx = projectedNodes[i].px - projectedNodes[j].px;
          const dy = projectedNodes[i].py - projectedNodes[j].py;
          const distSq = dx * dx + dy * dy;
          if (distSq < 25000) {
             const alpha = 1 - Math.sqrt(distSq) / Math.sqrt(25000);
             ctx.strokeStyle = `rgba(96, 165, 250, ${alpha * 0.4 * projectedNodes[i].scale})`;
             ctx.beginPath();
             ctx.moveTo(projectedNodes[i].px, projectedNodes[i].py);
             ctx.lineTo(projectedNodes[j].px, projectedNodes[j].py);
             ctx.stroke();
          }
        }
      }

      for (let i = 0; i < projectedNodes.length; i++) {
        const p = projectedNodes[i];
        if (p.z < -fov + 100) continue; 
        
        ctx.fillStyle = `rgba(147, 197, 253, ${0.9 * p.scale})`; // blue-300
        ctx.beginPath();
        ctx.arc(p.px, p.py, Math.max(1, 4 * p.scale), 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none z-[-1] opacity-70"
    />
  );
}
