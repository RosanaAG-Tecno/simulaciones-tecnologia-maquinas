import React from 'react';
import { CalculationResult, SimulationState } from '../types';
import { Scale, Activity, ArrowUpFromLine, GraduationCap } from 'lucide-react';

interface InfoPanelProps {
  state: SimulationState;
  results: CalculationResult;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ state, results }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg shadow border border-slate-200">
        <div className="flex items-center gap-2 mb-2">
          <GraduationCap className="w-5 h-5 text-indigo-600" />
          <h3 className="font-semibold text-slate-700">Tipo de Palanca</h3>
        </div>
        <p className="text-xl font-bold text-indigo-900">{results.leverClass}</p>
        <p className="text-sm text-slate-500 mt-1">
            {results.leverClass.includes("1º") && "El fulcro está entre la potencia y la resistencia."}
            {results.leverClass.includes("2º") && "La resistencia está entre el fulcro y la potencia."}
            {results.leverClass.includes("3º") && "La potencia está entre el fulcro y la resistencia."}
        </p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow border border-slate-200">
        <div className="flex items-center gap-2 mb-2">
          <Scale className="w-5 h-5 text-emerald-600" />
          <h3 className="font-semibold text-slate-700">Ganancia Mecánica (GM)</h3>
        </div>
        <p className="text-3xl font-bold text-emerald-700">{results.mechanicalAdvantage.toFixed(2)}</p>
        <p className="text-sm text-slate-500 mt-1">
          {results.mechanicalAdvantage > 1 
            ? "Multiplica la fuerza (Eficaz)" 
            : results.mechanicalAdvantage < 1 
              ? "Gana velocidad/distancia" 
              : "Fuerzas equilibradas"}
        </p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow border border-slate-200">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-5 h-5 text-rose-600" />
          <h3 className="font-semibold text-slate-700">Fuerzas (Equilibrio)</h3>
        </div>
        <div className="space-y-1">
            <div className="flex justify-between">
                <span className="text-sm text-slate-600">Resistencia (Carga):</span>
                <span className="font-mono font-bold text-rose-700">{state.loadForce} N</span>
            </div>
            <div className="flex justify-between border-t border-slate-100 pt-1">
                <span className="text-sm text-slate-600">Potencia necesaria:</span>
                <span className="font-mono font-bold text-emerald-700">{results.requiredEffort.toFixed(1)} N</span>
            </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow border border-slate-200">
        <div className="flex items-center gap-2 mb-2">
          <ArrowUpFromLine className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-slate-700">Amplitud Movimiento</h3>
        </div>
        <div className="flex items-center justify-between mt-2">
            <div className="text-center">
                <p className="text-xs text-slate-500">Arco Carga</p>
                <div className="h-2 w-full bg-rose-200 rounded mt-1 overflow-hidden relative">
                     <div className="absolute top-0 left-0 h-full bg-rose-500" style={{ width: '100%' }}></div>
                </div>
                <p className="text-xs font-mono mt-1">1x (Ref)</p>
            </div>
            <div className="text-slate-400 font-bold">vs</div>
            <div className="text-center">
                <p className="text-xs text-slate-500">Arco Potencia</p>
                <div className="h-2 w-full bg-emerald-200 rounded mt-1 overflow-hidden relative">
                    <div className="absolute top-0 left-0 h-full bg-emerald-500" style={{ width: '100%' }}></div>
                </div>
                <p className="text-xs font-mono mt-1">{(results.effortArm / (results.loadArm || 0.1)).toFixed(1)}x</p>
            </div>
        </div>
        <p className="text-xs text-slate-500 mt-2 text-center">
            Relación de velocidades inversa a la fuerza.
        </p>
      </div>
    </div>
  );
};

export default InfoPanel;