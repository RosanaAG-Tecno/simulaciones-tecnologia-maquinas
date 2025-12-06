import React, { useState, useMemo } from 'react';
import { SimulationState, CalculationResult, LeverClass } from './types';
import LeverVisualizer from './components/LeverVisualizer';
import Controls from './components/Controls';
import InfoPanel from './components/InfoPanel';
import { getLeverExplanation } from './services/geminiService';
import { Sparkles, BookOpen, Wrench, MousePointerClick, ArrowRight } from 'lucide-react';

const App: React.FC = () => {
  // Initial State
  const [state, setState] = useState<SimulationState>({
    beamLength: 10,
    fulcrumPos: 5,
    effortPos: 0,
    loadPos: 8,
    loadForce: 500,
    effortForce: 0, // Will be calculated
  });

  const [aiExplanation, setAiExplanation] = useState<string>("");
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  // Core Physics Logic
  const results: CalculationResult = useMemo(() => {
    // 1. Calculate Arms (distance from fulcrum)
    const effortArm = Math.abs(state.effortPos - state.fulcrumPos);
    const loadArm = Math.abs(state.loadPos - state.fulcrumPos);

    // 2. Avoid division by zero
    const safeEffortArm = effortArm === 0 ? 0.001 : effortArm;
    
    // 3. Calculate Mechanical Advantage (MA = d_p / d_r)
    // If load is directly on fulcrum, infinite mechanical advantage (theoretical)
    const safeLoadArm = loadArm === 0 ? 0.001 : loadArm;
    const mechanicalAdvantage = safeEffortArm / safeLoadArm;

    // 4. Calculate Required Effort (Law of Lever: Fp * dp = Fr * dr)
    // Fp = (Fr * dr) / dp
    const requiredEffort = (state.loadForce * safeLoadArm) / safeEffortArm;

    // 5. Determine Lever Class
    let leverClass = LeverClass.First;
    const { fulcrumPos, loadPos, effortPos } = state;
    
    // Positions relative to start (0) isn't enough, we need relative order.
    // Class 1: Fulcrum is between Load and Effort
    // Class 2: Load is between Fulcrum and Effort
    // Class 3: Effort is between Fulcrum and Load
    
    const min = Math.min(loadPos, effortPos);
    const max = Math.max(loadPos, effortPos);

    if (fulcrumPos > min && fulcrumPos < max) {
        leverClass = LeverClass.First;
    } else {
        // Fulcrum is on one of the ends
        // Check what is in the middle
        const middlePoint = [loadPos, effortPos, fulcrumPos].sort((a,b) => a-b)[1];
        if (middlePoint === state.loadPos) leverClass = LeverClass.Second;
        if (middlePoint === state.effortPos) leverClass = LeverClass.Third;
    }

    return {
      effortArm,
      loadArm,
      mechanicalAdvantage,
      requiredEffort,
      leverClass,
      equilibrium: true // In this static calculator, we calculate what is needed FOR equilibrium
    };
  }, [state]);

  const updateState = (newState: Partial<SimulationState>) => {
    setState(prev => ({ ...prev, ...newState }));
  };

  const handleAiAnalysis = async () => {
    setIsLoadingAi(true);
    setAiExplanation("");
    const text = await getLeverExplanation(state, results);
    setAiExplanation(text);
    setIsLoadingAi(false);
  };

  const loadPreset = (newState: Partial<SimulationState>) => {
      setState(prev => ({...prev, ...newState}));
      setAiExplanation(""); // Clear previous AI explanation
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 text-white shadow-lg z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
                <Wrench className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">IES La Fresneda</h1>
              <p className="text-xs text-slate-400 uppercase tracking-wider">Taller de Tecnología</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-slate-300 font-medium">
            <span>Curso: Mecanismos</span>
            <span className="bg-slate-800 px-3 py-1 rounded-full text-white">Simulador v1.0</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 lg:p-8">
        
        <div className="mb-8">
             <InfoPanel state={state} results={results} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Visualizer (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <LeverVisualizer state={state} results={results} onUpdateState={updateState} />

            {/* AI Teacher Section */}
            <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-50 to-white p-4 border-b border-indigo-100 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-indigo-600" />
                        <h3 className="font-bold text-slate-800">Análisis Inteligente</h3>
                    </div>
                    <button 
                        onClick={handleAiAnalysis}
                        disabled={isLoadingAi}
                        className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {isLoadingAi ? "Analizando..." : "Preguntar al Profesor Virtual"}
                    </button>
                </div>
                <div className="p-6 min-h-[120px]">
                    {aiExplanation ? (
                        <div className="prose prose-sm text-slate-700 max-w-none">
                            <pre className="whitespace-pre-wrap font-sans">{aiExplanation}</pre>
                        </div>
                    ) : (
                        <div className="text-slate-400 text-center flex flex-col items-center justify-center h-full py-4">
                            <BookOpen className="w-8 h-8 mb-2 opacity-50" />
                            <p>Ajusta la palanca y pulsa el botón para obtener una explicación técnica y ejemplos.</p>
                        </div>
                    )}
                </div>
            </div>
          </div>

          {/* Right Column: Controls (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <Controls state={state} onUpdate={updateState} />
            
            {/* Interactive Scenarios / Examples */}
            <div className="bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                    <MousePointerClick className="w-4 h-4 text-slate-500" />
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                        Cargar Escenarios Reales
                    </h3>
                </div>
                
                <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
                    
                    {/* Class 1 Group */}
                    <div>
                        <h4 className="text-xs font-semibold text-blue-600 mb-2 uppercase border-b border-blue-100 pb-1">
                            1º Género (Interapoyo)
                        </h4>
                        <div className="space-y-2">
                            <button 
                                onClick={() => loadPreset({ fulcrumPos: 5, loadPos: 2, effortPos: 8, loadForce: 100 })}
                                className="w-full text-left bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-200 p-3 rounded-lg transition-all group flex items-start gap-3"
                            >
                                <div className="text-2xl group-hover:scale-110 transition-transform">⚖️</div>
                                <div className="flex-1">
                                    <div className="font-bold text-slate-700 text-sm flex justify-between">
                                        Balanza / Columpio
                                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 text-blue-400 transition-opacity" />
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Fulcro central. Equilibrio y cambio de dirección.
                                    </p>
                                </div>
                            </button>

                            <button 
                                onClick={() => loadPreset({ fulcrumPos: 3, loadPos: 1, effortPos: 9, loadForce: 400 })}
                                className="w-full text-left bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-200 p-3 rounded-lg transition-all group flex items-start gap-3"
                            >
                                <div className="text-2xl group-hover:scale-110 transition-transform">✂️</div>
                                <div className="flex-1">
                                    <div className="font-bold text-slate-700 text-sm flex justify-between">
                                        Alicates / Tijeras
                                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 text-blue-400 transition-opacity" />
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Fulcro cerca de la carga para ganar mucha fuerza.
                                    </p>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Class 2 Group */}
                    <div>
                        <h4 className="text-xs font-semibold text-rose-600 mb-2 uppercase border-b border-rose-100 pb-1">
                            2º Género (Interresistencia)
                        </h4>
                        <div className="space-y-2">
                            <button 
                                onClick={() => loadPreset({ fulcrumPos: 0, loadPos: 3, effortPos: 9, loadForce: 600 })}
                                className="w-full text-left bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 p-3 rounded-lg transition-all group flex items-start gap-3"
                            >
                                <div className="text-2xl group-hover:scale-110 transition-transform">🛒</div>
                                <div className="flex-1">
                                    <div className="font-bold text-slate-700 text-sm flex justify-between">
                                        Carretilla
                                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 text-rose-400 transition-opacity" />
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Siempre gana fuerza (GM &gt; 1).
                                    </p>
                                </div>
                            </button>

                            <button 
                                onClick={() => loadPreset({ fulcrumPos: 0, loadPos: 1.5, effortPos: 8, loadForce: 300 })}
                                className="w-full text-left bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 p-3 rounded-lg transition-all group flex items-start gap-3"
                            >
                                <div className="text-2xl group-hover:scale-110 transition-transform">🌰</div>
                                <div className="flex-1">
                                    <div className="font-bold text-slate-700 text-sm flex justify-between">
                                        Cascanueces
                                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 text-rose-400 transition-opacity" />
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Resistencia muy cerca del fulcro.
                                    </p>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Class 3 Group */}
                    <div>
                        <h4 className="text-xs font-semibold text-emerald-600 mb-2 uppercase border-b border-emerald-100 pb-1">
                            3º Género (Interpotencia)
                        </h4>
                        <div className="space-y-2">
                            <button 
                                onClick={() => loadPreset({ fulcrumPos: 0, effortPos: 2.5, loadPos: 9.5, loadForce: 40 })}
                                className="w-full text-left bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 p-3 rounded-lg transition-all group flex items-start gap-3"
                            >
                                <div className="text-2xl group-hover:scale-110 transition-transform">🎣</div>
                                <div className="flex-1">
                                    <div className="font-bold text-slate-700 text-sm flex justify-between">
                                        Caña de Pescar
                                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 text-emerald-400 transition-opacity" />
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Gana velocidad/distancia, pierde fuerza.
                                    </p>
                                </div>
                            </button>

                            <button 
                                onClick={() => loadPreset({ fulcrumPos: 0, effortPos: 4, loadPos: 10, loadForce: 10 })}
                                className="w-full text-left bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 p-3 rounded-lg transition-all group flex items-start gap-3"
                            >
                                <div className="text-2xl group-hover:scale-110 transition-transform">🧊</div>
                                <div className="flex-1">
                                    <div className="font-bold text-slate-700 text-sm flex justify-between">
                                        Pinzas (Hielo/Depilar)
                                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 text-emerald-400 transition-opacity" />
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Precisión de movimiento.
                                    </p>
                                </div>
                            </button>

                             <button 
                                onClick={() => loadPreset({ fulcrumPos: 0, effortPos: 2, loadPos: 8, loadForce: 100 })}
                                className="w-full text-left bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 p-3 rounded-lg transition-all group flex items-start gap-3"
                            >
                                <div className="text-2xl group-hover:scale-110 transition-transform">💪</div>
                                <div className="flex-1">
                                    <div className="font-bold text-slate-700 text-sm flex justify-between">
                                        Bíceps Humano
                                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 text-emerald-400 transition-opacity" />
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Potencia (músculo) entre codo y mano.
                                    </p>
                                </div>
                            </button>
                            
                            <button 
                                onClick={() => loadPreset({ fulcrumPos: 10, effortPos: 6, loadPos: 1, loadForce: 20 })}
                                className="w-full text-left bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 p-3 rounded-lg transition-all group flex items-start gap-3"
                            >
                                <div className="text-2xl group-hover:scale-110 transition-transform">🧹</div>
                                <div className="flex-1">
                                    <div className="font-bold text-slate-700 text-sm flex justify-between">
                                        Escoba
                                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 text-emerald-400 transition-opacity" />
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Mano superior fija (fulcro), inferior empuja.
                                    </p>
                                </div>
                            </button>
                        </div>
                    </div>

                </div>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
};

export default App;