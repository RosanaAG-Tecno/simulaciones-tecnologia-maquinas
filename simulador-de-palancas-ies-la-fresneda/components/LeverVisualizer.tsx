import React, { useRef, useEffect, useState } from 'react';
import { SimulationState, CalculationResult } from '../types';

interface LeverVisualizerProps {
  state: SimulationState;
  results: CalculationResult;
  onUpdateState: (newState: Partial<SimulationState>) => void;
}

const LeverVisualizer: React.FC<LeverVisualizerProps> = ({ state, results, onUpdateState }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDragging, setIsDragging] = useState<'fulcrum' | 'effort' | 'load' | null>(null);

  // Constants for visualization scaling
  const WIDTH = 800;
  const HEIGHT = 400;
  const PADDING = 50;
  const BEAM_Y = HEIGHT / 2 + 50;
  const SCALE_X = (WIDTH - PADDING * 2) / 10; // 10 meters total length

  // Convert logical units (0-10) to SVG coordinates
  const toSvgX = (val: number) => PADDING + val * SCALE_X;
  const fromSvgX = (x: number) => {
    let val = (x - PADDING) / SCALE_X;
    return Math.max(0, Math.min(10, val));
  };

  const handlePointerDown = (type: 'fulcrum' | 'effort' | 'load') => (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture(e.pointerId);
    setIsDragging(type);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newVal = fromSvgX(x);

    // Simple constraints to prevent overlapping logic breaking math (though math handles it, UI is cleaner)
    // We allow overlap but users might find it confusing.
    
    if (isDragging === 'fulcrum') {
      onUpdateState({ fulcrumPos: newVal });
    } else if (isDragging === 'effort') {
      onUpdateState({ effortPos: newVal });
    } else if (isDragging === 'load') {
      onUpdateState({ loadPos: newVal });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(null);
    (e.target as Element).releasePointerCapture(e.pointerId);
  };

  // Visualization of Angle/Motion
  // We simulate a small tilt angle (e.g., +/- 10 degrees) to show range of motion
  const MAX_TILT_ANGLE = 15 * (Math.PI / 180);
  
  // Pivot point is always the fulcrum
  const pivotX = toSvgX(state.fulcrumPos);
  const pivotY = BEAM_Y;

  // Calculate endpoints of beam for tilt
  const startX = toSvgX(0);
  const endX = toSvgX(10);
  
  // Function to rotate point around fulcrum
  const rotatePoint = (x: number, y: number, angle: number) => {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const dx = x - pivotX;
    const dy = y - pivotY;
    return {
      x: pivotX + (dx * cos - dy * sin),
      y: pivotY + (dx * sin + dy * cos)
    };
  };

  const startUp = rotatePoint(startX, BEAM_Y, -MAX_TILT_ANGLE);
  const endUp = rotatePoint(endX, BEAM_Y, -MAX_TILT_ANGLE);
  const startDown = rotatePoint(startX, BEAM_Y, MAX_TILT_ANGLE);
  const endDown = rotatePoint(endX, BEAM_Y, MAX_TILT_ANGLE);

  // Load and Effort vectors
  const loadX = toSvgX(state.loadPos);
  const effortX = toSvgX(state.effortPos);
  
  // Directions (Physics logic)
  // Usually Load acts down (Gravity).
  // Effort direction depends on class to maintain equilibrium against gravity.
  // Class 1: Load Down, Effort Down (to lift load)
  // Class 2: Load Down, Effort Up (to lift load)
  // Class 3: Load Down, Effort Up (to lift load)
  
  // However, for simplified viz:
  // Resistance is always Gravity (Down).
  // Power is the force applied.
  
  const resistanceVectorLen = 50 + (state.loadForce / 200) * 50; // Scale visual
  const effortVectorLen = 50 + (results.requiredEffort / 200) * 50;

  // Arc of motion for Load
  const loadPointUp = rotatePoint(loadX, BEAM_Y, -MAX_TILT_ANGLE);
  const loadPointDown = rotatePoint(loadX, BEAM_Y, MAX_TILT_ANGLE);
  
  // Arc of motion for Effort
  const effortPointUp = rotatePoint(effortX, BEAM_Y, -MAX_TILT_ANGLE);
  const effortPointDown = rotatePoint(effortX, BEAM_Y, MAX_TILT_ANGLE);

  return (
    <div className="w-full bg-slate-900 rounded-lg shadow-xl overflow-hidden border border-slate-700 relative">
        <div className="absolute top-4 left-4 text-slate-400 text-xs font-mono">
            IES LA FRESNEDA // TALLER VIRTUAL
        </div>
      <svg 
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`} 
        className="w-full h-auto touch-none select-none cursor-crosshair"
        onPointerMove={handlePointerMove}
      >
        <defs>
          <marker id="arrowhead-red" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#ef4444" />
          </marker>
          <marker id="arrowhead-green" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#22c55e" />
          </marker>
        </defs>

        {/* Grid Background */}
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="1"/>
        </pattern>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Range of Motion Ghosts (Dashed) */}
        <line x1={startUp.x} y1={startUp.y} x2={endUp.x} y2={endUp.y} stroke="#475569" strokeWidth="2" strokeDasharray="5,5" opacity="0.5" />
        <line x1={startDown.x} y1={startDown.y} x2={endDown.x} y2={endDown.y} stroke="#475569" strokeWidth="2" strokeDasharray="5,5" opacity="0.5" />
        
        {/* Arcs showing amplitude */}
        <path d={`M ${loadPointUp.x} ${loadPointUp.y} Q ${loadX} ${BEAM_Y} ${loadPointDown.x} ${loadPointDown.y}`} stroke="#ef4444" fill="none" strokeWidth="1" strokeDasharray="2,2" opacity="0.6" />
        <path d={`M ${effortPointUp.x} ${effortPointUp.y} Q ${effortX} ${BEAM_Y} ${effortPointDown.x} ${effortPointDown.y}`} stroke="#22c55e" fill="none" strokeWidth="1" strokeDasharray="2,2" opacity="0.6" />

        {/* Main Beam */}
        <line 
          x1={PADDING} 
          y1={BEAM_Y} 
          x2={WIDTH - PADDING} 
          y2={BEAM_Y} 
          stroke="#cbd5e1" 
          strokeWidth="8" 
          strokeLinecap="round"
        />

        {/* Graduations on Beam */}
        {Array.from({ length: 11 }).map((_, i) => (
          <line 
            key={i}
            x1={toSvgX(i)} 
            y1={BEAM_Y - 5} 
            x2={toSvgX(i)} 
            y2={BEAM_Y + 5} 
            stroke="#64748b" 
            strokeWidth="2"
          />
        ))}

        {/* Resistance (Load) - RED */}
        <g 
          className="cursor-ew-resize hover:opacity-80 transition-opacity"
          onPointerDown={handlePointerDown('load')}
          onPointerUp={handlePointerUp}
        >
            {/* Connection Point */}
            <circle cx={loadX} cy={BEAM_Y} r="6" fill="#ef4444" />
            {/* Force Vector (Down for gravity) */}
            <line 
                x1={loadX} y1={BEAM_Y + 10} 
                x2={loadX} y2={BEAM_Y + 10 + resistanceVectorLen} 
                stroke="#ef4444" strokeWidth="4" 
                markerEnd="url(#arrowhead-red)"
            />
            {/* Load Box */}
            <rect 
                x={loadX - 20} y={BEAM_Y + 10 + resistanceVectorLen} 
                width="40" height="40" 
                fill="#fca5a5" stroke="#ef4444" strokeWidth="2"
            />
            <text x={loadX} y={BEAM_Y - 15} textAnchor="middle" fill="#ef4444" fontWeight="bold" fontSize="12">
                R (Carga)
            </text>
        </g>

        {/* Power (Effort) - GREEN */}
        <g 
          className="cursor-ew-resize hover:opacity-80 transition-opacity"
          onPointerDown={handlePointerDown('effort')}
          onPointerUp={handlePointerUp}
        >
            {/* Connection */}
            <circle cx={effortX} cy={BEAM_Y} r="6" fill="#22c55e" />
            
            {/* Force Vector - Direction depends on leverage logic simply for viz */}
            {/* For visualization, we simply draw it opposite to where it needs to pull/push or just generic vertical */}
            <line 
                x1={effortX} y1={BEAM_Y - 10} 
                x2={effortX} y2={BEAM_Y - 10 - effortVectorLen} 
                stroke="#22c55e" strokeWidth="4" 
                markerEnd="url(#arrowhead-green)" 
            />
             <text x={effortX} y={BEAM_Y + 25} textAnchor="middle" fill="#22c55e" fontWeight="bold" fontSize="12">
                P (Potencia)
            </text>
        </g>

        {/* Fulcrum - BLUE */}
        <g 
          className="cursor-ew-resize hover:opacity-80 transition-opacity"
          onPointerDown={handlePointerDown('fulcrum')}
          onPointerUp={handlePointerUp}
        >
          <polygon 
            points={`${pivotX},${BEAM_Y} ${pivotX - 15},${BEAM_Y + 30} ${pivotX + 15},${BEAM_Y + 30}`} 
            fill="#3b82f6" stroke="#1d4ed8" strokeWidth="2"
          />
          <text x={pivotX} y={BEAM_Y + 50} textAnchor="middle" fill="#3b82f6" fontWeight="bold" fontSize="12">
             Fulcro
          </text>
        </g>

        {/* Dimension Lines (Arms) */}
        {/* Resistance Arm */}
        <line x1={pivotX} y1={BEAM_Y + 60} x2={loadX} y2={BEAM_Y + 60} stroke="#ef4444" strokeWidth="1" strokeDasharray="4,2" />
        <text x={(pivotX + loadX)/2} y={BEAM_Y + 75} textAnchor="middle" fill="#ef4444" fontSize="11">
            dᵣ: {results.loadArm.toFixed(2)}m
        </text>

        {/* Power Arm */}
        <line x1={pivotX} y1={BEAM_Y + 90} x2={effortX} y2={BEAM_Y + 90} stroke="#22c55e" strokeWidth="1" strokeDasharray="4,2" />
        <text x={(pivotX + effortX)/2} y={BEAM_Y + 105} textAnchor="middle" fill="#22c55e" fontSize="11">
            dₚ: {results.effortArm.toFixed(2)}m
        </text>

      </svg>
    </div>
  );
};

export default LeverVisualizer;