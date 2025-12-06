export enum LeverClass {
  First = "1º Género (Interapoyo)",
  Second = "2º Género (Interresistencia)",
  Third = "3º Género (Interpotencia)"
}

export interface SimulationState {
  beamLength: number; // in meters/units, typically fixed for viz like 10
  fulcrumPos: number; // 0 to 10
  effortPos: number; // 0 to 10
  loadPos: number; // 0 to 10
  loadForce: number; // Newtons
  effortForce: number; // Newtons (Calculated or input)
}

export interface CalculationResult {
  effortArm: number;
  loadArm: number;
  mechanicalAdvantage: number;
  requiredEffort: number;
  leverClass: LeverClass;
  equilibrium: boolean;
}

export interface Example {
  name: string;
  description: string;
  imageIcon: string; // Using Lucide icon names conceptually or emojis
  type: LeverClass;
}