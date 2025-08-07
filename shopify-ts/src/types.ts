// Game Types and Interfaces

export interface Position {
  x: number;
  y: number;
}

export interface GameColors {
  background: string;
  lane: string;
  hole: string;
  flag: string;
  ball: string;
  stroke: string;
  powerMeter: {
    background: string;
    border: string;
    tick: string;
    fill: string;
  };
}

export interface GameDimensions {
  canvas: {
    width: number;
    height: number;
  };
  lane: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  hole: {
    radius: number;
  };
  ball: {
    radius: number;
  };
  powerMeter: {
    width: number;
    height: number;
    x: number;
    y: number;
  };
}

export interface PowerMeterConfig {
  minPower: number;
  maxPower: number;
  tickSpeed: number; // pixels per frame
  range: number; // total distance units (default 10)
}

export interface PrizeConfig {
  shotsToPrize: Record<
    number,
    {
      name: string;
      code: string;
      description: string;
    }
  >;
}

export interface GameConfig {
  colors: GameColors;
  dimensions: GameDimensions;
  animation: {
    duration: number;
    easing: (t: number) => number;
  };
  powerMeter: PowerMeterConfig;
  prizes: PrizeConfig;
}

export type GameState =
  | "email_required"
  | "ready"
  | "aiming"
  | "shooting"
  | "won"
  | "lost";

export interface GameStats {
  shotsTaken: number;
  currentDistance: number;
  targetDistance: number;
}

export interface GameEvents {
  onWin?: (shots: number, prize: PrizeConfig["shotsToPrize"][number]) => void;
  onLose?: () => void;
  onShoot?: (power: number, newDistance: number) => void;
  onReset?: () => void;
  onEmailSubmitted?: (email: string) => void;
}
