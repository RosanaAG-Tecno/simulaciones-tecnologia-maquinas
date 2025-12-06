import { GoogleGenAI } from "@google/genai";
import { SimulationState, CalculationResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getLeverExplanation = async (
  state: SimulationState,
  results: CalculationResult
): Promise<string> => {
  const model = "gemini-2.5-flash";
  
  const prompt = `
    Actúa como un profesor experto de Tecnología en el IES La Fresneda.
    Analiza la siguiente simulación de una palanca configurada por un alumno:
    
    - Tipo de Palanca: ${results.leverClass}
    - Brazo de Potencia: ${results.effortArm.toFixed(2)} m
    - Brazo de Resistencia: ${results.loadArm.toFixed(2)} m
    - Ganancia Mecánica (Ventaja Mecánica): ${results.mechanicalAdvantage.toFixed(2)}
    - Fuerza de Resistencia (Carga): ${state.loadForce} N
    - Fuerza de Potencia necesaria: ${results.requiredEffort.toFixed(2)} N
    
    Por favor, proporciona una explicación breve y educativa (máximo 100 palabras) sobre:
    1. ¿Es eficiente esta configuración? (¿Ganamos fuerza o velocidad?)
    2. Un ejemplo de la vida cotidiana que use EXACTAMENTE este principio físico.
    3. Un consejo práctico para el alumno sobre cómo mejorar la ventaja mecánica moviendo el fulcro.
    
    Usa un tono motivador y técnico adecuado para estudiantes de secundaria. Usa formato Markdown.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });
    return response.text || "No se pudo generar la explicación en este momento.";
  } catch (error) {
    console.error("Error fetching explanation:", error);
    return "Error al conectar con el asistente virtual del taller.";
  }
};