import React from 'react';
import { SimulationState } from '../types';
import { Settings2 } from 'lucide-react';

interface ControlsProps {
  state: SimulationState;
  onUpdate: (newState: Partial<SimulationState>) => void;
}

const Controls: React.FC<ControlsProps> = ({ state, onUpdate }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-slate-200 h-full">
      <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-2">
        <Settings2 className="text-slate-700" />
        <h2 className="text-lg font-bold text-slate-800">Panel de Control</h2>
      </div>

      <div className="space-y-6">
        
        {/* Load Force Slider */}
        <div>
          <label className="flex justify-between text-sm font-medium text-slate-700 mb-2">
            <span>Resistencia (Carga)</span>
            <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded text-xs">{state.loadForce} N</span>
          </label>
          <input
            type="range"
            min="10"
            max="1000"
            step="10"
            value={state.loadForce}
            onChange={(e) => onUpdate({ loadForce: Number(e.target.value) })}
            className="accent-rose-600"
          />
        </div>

        {/* Position Sliders (Alternative to drag) */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
           <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Posiciones (Metros)</h3>
           
           <div>
            <label className="flex justify-between text-sm font-medium text-slate-700 mb-1">
                <span className="text-blue-600">Fulcro (Punto de Apoyo)</span>
                <span>{state.fulcrumPos.toFixed(1)} m</span>
            </label>
            <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={state.fulcrumPos}
                onChange={(e) => onUpdate({ fulcrumPos: Number(e.target.value) })}
                className="accent-blue-600"
            />
           </div>

           <div>
            <label className="flex justify-between text-sm font-medium text-slate-700 mb-1">
                <span className="text-rose-600">Resistencia (Carga)</span>
                <span>{state.loadPos.toFixed(1)} m</span>
            </label>
            <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={state.loadPos}
                onChange={(e) => onUpdate({ loadPos: Number(e.target.value) })}
                className="accent-rose-600"
            />
           </div>

           <div>
            <label className="flex justify-between text-sm font-medium text-slate-700 mb-1">
                <span className="text-emerald-600">Potencia (Esfuerzo)</span>
                <span>{state.effortPos.toFixed(1)} m</span>
            </label>
            <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={state.effortPos}
                onChange={(e) => onUpdate({ effortPos: Number(e.target.value) })}
                className="accent-emerald-600"
            />
           </div>
        </div>

        <div className="pt-4 mt-4 bg-slate-50 p-4 rounded text-xs text-slate-500 italic border border-slate-100">
            "Dame un punto de apoyo y moveré el mundo." — Arquímedes
        </div>
      </div>
    </div>
  );
};

export default Controls;