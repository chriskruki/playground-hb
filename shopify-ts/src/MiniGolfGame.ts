import type {
  Position,
  GameConfig,
  GameState,
  GameEvents,
  GameStats,
} from "./types.js";
import { CONFIG } from "./config.js";

export class MiniGolfGame {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private ballPosition: Position;
  private readonly holePosition: Position;
  private state: GameState = "email_required";
  private readonly config: GameConfig;
  private readonly events: GameEvents;
  private stats: GameStats;

  // Power meter properties
  private powerMeterTick: number = 0;
  private tickDirection: number = 1;
  private animationId: number | null = null;
  private currentPower: number = 1;

  // Ball animation properties
  private ballAnimationStart: number = 0;
  private ballStartDistance: number = 0;
  private ballTargetDistance: number = 0;
  private ballAnimationId: number | null = null;

  constructor(
    canvasId: string,
    config?: Partial<GameConfig>,
    events?: GameEvents
  ) {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) {
      throw new Error(`Canvas with id "${canvasId}" not found`);
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("2D context not supported");
    }

    this.canvas = canvas;
    this.ctx = ctx;
    this.ballPosition = {
      x: CONFIG.POSITIONS.BALL.x,
      y: CONFIG.POSITIONS.BALL.y,
    };
    this.holePosition = {
      x: CONFIG.POSITIONS.HOLE.x,
      y: CONFIG.POSITIONS.HOLE.y,
    };
    this.events = events || {};

    // Default configuration using CONFIG constants
    this.config = {
      colors: {
        background: CONFIG.COLORS.BACKGROUND,
        lane: CONFIG.COLORS.LANE,
        hole: CONFIG.COLORS.HOLE,
        flag: CONFIG.COLORS.FLAG,
        ball: CONFIG.COLORS.BALL,
        stroke: CONFIG.COLORS.STROKE,
        powerMeter: {
          background: CONFIG.COLORS.POWER_METER.BACKGROUND,
          border: CONFIG.COLORS.POWER_METER.BORDER,
          tick: CONFIG.COLORS.POWER_METER.TICK,
          fill: CONFIG.COLORS.POWER_METER.FILL,
        },
      },
      dimensions: {
        canvas: { width: CONFIG.CANVAS.WIDTH, height: CONFIG.CANVAS.HEIGHT },
        lane: {
          x: CONFIG.POSITIONS.LANE.x,
          y: CONFIG.POSITIONS.LANE.y,
          width: CONFIG.POSITIONS.LANE.width,
          height: CONFIG.POSITIONS.LANE.height,
        },
        hole: { radius: CONFIG.POSITIONS.HOLE.radius },
        ball: { radius: CONFIG.POSITIONS.BALL.radius },
        powerMeter: {
          width: CONFIG.GAME.POWER_METER.METER_WIDTH,
          height: CONFIG.GAME.POWER_METER.METER_HEIGHT,
          x: CONFIG.POSITIONS.POWER_METER.x,
          y: CONFIG.POSITIONS.POWER_METER.y,
        },
      },
      animation: {
        duration: CONFIG.GAME.ANIMATION.BALL_DURATION,
        easing: CONFIG.GAME.ANIMATION.BALL_EASING,
      },
      powerMeter: {
        minPower: CONFIG.GAME.POWER_METER.MIN_POWER,
        maxPower: CONFIG.GAME.POWER_METER.MAX_POWER,
        tickSpeed: CONFIG.GAME.POWER_METER.TICK_SPEED,
        range: CONFIG.GAME.TARGET_DISTANCE,
      },
      prizes: {
        shotsToPrize: CONFIG.PRIZES,
      },
      ...config,
    };

    this.stats = {
      shotsTaken: 0,
      currentDistance: 0,
      targetDistance: CONFIG.GAME.TARGET_DISTANCE,
    };

    this.init();
  }

  private init(): void {
    this.setupCanvas();
    this.drawGame();
    this.setupEventListeners();
  }

  private setupCanvas(): void {
    const { canvas: canvasConfig } = this.config.dimensions;
    this.canvas.width = canvasConfig.width;
    this.canvas.height = canvasConfig.height;
  }

  private drawGame(): void {
    this.clearCanvas();
    this.drawLane();
    this.drawHole();
    this.drawFlag();
    this.drawBall();

    if (this.state === "aiming") {
      this.drawPowerMeter();
    }
  }

  private clearCanvas(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private drawLane(): void {
    const { lane } = this.config.dimensions;
    const { lane: laneColor, stroke } = this.config.colors;

    this.ctx.fillStyle = laneColor;
    this.ctx.strokeStyle = stroke;
    this.ctx.lineWidth = 4;
    this.ctx.fillRect(lane.x, lane.y, lane.width, lane.height);
    this.ctx.strokeRect(lane.x, lane.y, lane.width, lane.height);
  }

  private drawHole(): void {
    const { hole: holeColor } = this.config.colors;
    const { hole } = this.config.dimensions;

    this.ctx.beginPath();
    this.ctx.arc(
      this.holePosition.x,
      this.holePosition.y,
      hole.radius,
      0,
      Math.PI * 2
    );
    this.ctx.fillStyle = holeColor;
    this.ctx.fill();
  }

  private drawFlag(): void {
    const { stroke, flag: flagColor } = this.config.colors;

    // Draw flag pole
    this.ctx.beginPath();
    this.ctx.moveTo(this.holePosition.x, this.holePosition.y);
    this.ctx.lineTo(this.holePosition.x, 30);
    this.ctx.strokeStyle = stroke;
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // Draw flag
    this.ctx.fillStyle = flagColor;
    this.ctx.beginPath();
    this.ctx.moveTo(this.holePosition.x, 30);
    this.ctx.lineTo(this.holePosition.x + 20, 35);
    this.ctx.lineTo(this.holePosition.x, 40);
    this.ctx.closePath();
    this.ctx.fill();
  }

  private drawBall(): void {
    const { ball: ballColor } = this.config.colors;
    const { ball } = this.config.dimensions;

    // Calculate ball position based on current distance
    const totalDistance = this.config.dimensions.lane.width;
    let currentDistance = this.stats.currentDistance;

    // Use animated distance if ball is moving
    if (this.state === "shooting" && this.ballAnimationStart > 0) {
      const elapsed = performance.now() - this.ballAnimationStart;
      const progress = Math.min(elapsed / this.config.animation.duration, 1);
      const easedProgress = this.config.animation.easing(progress);

      currentDistance =
        this.ballStartDistance +
        (this.ballTargetDistance - this.ballStartDistance) * easedProgress;
    }

    const ballX =
      this.config.dimensions.lane.x +
      (currentDistance / this.stats.targetDistance) * totalDistance;

    this.ctx.beginPath();
    this.ctx.arc(ballX, this.ballPosition.y, ball.radius, 0, 2 * Math.PI);
    this.ctx.fillStyle = ballColor;
    this.ctx.fill();
    this.ctx.strokeStyle = "#ccc";
    this.ctx.lineWidth = 1;
    this.ctx.stroke();
  }

  private drawPowerMeter(): void {
    const { powerMeter } = this.config.dimensions;
    const { powerMeter: colors } = this.config.colors;

    // Draw power meter background
    this.ctx.fillStyle = colors.background;
    this.ctx.fillRect(
      powerMeter.x,
      powerMeter.y,
      powerMeter.width,
      powerMeter.height
    );

    // Draw border
    this.ctx.strokeStyle = colors.border;
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(
      powerMeter.x,
      powerMeter.y,
      powerMeter.width,
      powerMeter.height
    );

    // Draw power fill based on current tick position
    const fillWidth =
      (this.currentPower / this.config.powerMeter.maxPower) * powerMeter.width;
    this.ctx.fillStyle = colors.fill;
    this.ctx.fillRect(powerMeter.x, powerMeter.y, fillWidth, powerMeter.height);

    // Draw moving tick
    const tickX = powerMeter.x + this.powerMeterTick;
    this.ctx.strokeStyle = colors.tick;
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(tickX, powerMeter.y);
    this.ctx.lineTo(tickX, powerMeter.y + powerMeter.height);
    this.ctx.stroke();

    // Draw power value text
    this.ctx.fillStyle = colors.border;
    this.ctx.font = "14px 'General Sans', sans-serif";
    this.ctx.textAlign = "center";
    this.ctx.fillText(
      `Power: ${this.currentPower}`,
      powerMeter.x + powerMeter.width / 2,
      powerMeter.y - 8
    );
  }

  private updatePowerMeter(): void {
    const { powerMeter } = this.config.dimensions;
    const { tickSpeed } = this.config.powerMeter;

    // Calculate smooth tick speed based on target FPS
    const targetFrameTime = 1000 / CONFIG.GAME.ANIMATION.POWER_METER_FPS;
    const actualTickSpeed = tickSpeed * (16.67 / targetFrameTime); // Normalize to 60fps baseline

    // Update tick position with smooth movement
    this.powerMeterTick += actualTickSpeed * this.tickDirection;

    // Bounce off edges with smooth transitions
    if (this.powerMeterTick <= 0) {
      this.powerMeterTick = 0;
      this.tickDirection = 1;
    } else if (this.powerMeterTick >= powerMeter.width) {
      this.powerMeterTick = powerMeter.width;
      this.tickDirection = -1;
    }

    // Calculate current power based on tick position with smoothing
    const powerRatio = this.powerMeterTick / powerMeter.width;
    const targetPower =
      this.config.powerMeter.minPower +
      (this.config.powerMeter.maxPower - this.config.powerMeter.minPower) *
        powerRatio;

    // Apply smoothing to power value for smoother display
    this.currentPower = Math.round(targetPower);
  }

  private startPowerMeterAnimation(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    let lastTime = performance.now();
    const targetFrameTime = 1000 / CONFIG.GAME.ANIMATION.POWER_METER_FPS;

    const animate = (currentTime: number): void => {
      if (this.state === "aiming") {
        // Throttle to target FPS for smooth animation
        if (currentTime - lastTime >= targetFrameTime) {
          this.updatePowerMeter();
          this.drawGame();
          lastTime = currentTime;
        }
        this.animationId = requestAnimationFrame(animate);
      }
    };

    this.animationId = requestAnimationFrame(animate);
  }

  private stopPowerMeterAnimation(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  private setupEventListeners(): void {
    // Putt button will be handled externally
    // Keyboard support for spacebar
    document.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.code === "Space" && this.state === "aiming") {
        e.preventDefault();
        this.putt();
      }
    });
  }

  public emailSubmitted(email: string): void {
    this.state = "ready";
    this.events.onEmailSubmitted?.(email);
    this.drawGame();
  }

  public startAiming(): void {
    if (this.state !== "ready") return;

    this.state = "aiming";
    this.startPowerMeterAnimation();
  }

  public putt(): void {
    if (this.state !== "aiming") return;

    this.state = "shooting";
    this.stopPowerMeterAnimation();

    const shotDistance = this.currentPower;
    this.stats.shotsTaken++;

    // Set up ball animation properties
    this.ballStartDistance = this.stats.currentDistance;
    this.ballTargetDistance = this.stats.currentDistance + shotDistance;
    this.ballAnimationStart = performance.now();

    // Update stats immediately for game logic
    this.stats.currentDistance += shotDistance;

    this.events.onShoot?.(shotDistance, this.stats.currentDistance);

    // Start smooth ball animation
    this.animateBallMovement(() => {
      this.ballAnimationStart = 0; // Reset animation
      this.checkGameEnd();
    });
  }

  private animateBallMovement(onComplete: () => void): void {
    if (this.ballAnimationId) {
      cancelAnimationFrame(this.ballAnimationId);
    }

    const animate = (currentTime: number): void => {
      const elapsed = currentTime - this.ballAnimationStart;
      const progress = Math.min(elapsed / this.config.animation.duration, 1);

      // Always redraw to show smooth ball movement
      this.drawGame();

      if (progress < 1) {
        this.ballAnimationId = requestAnimationFrame(animate);
      } else {
        // Animation complete
        this.ballAnimationId = null;
        this.state = "ready"; // Temporary state before checking game end
        this.drawGame(); // Final draw with ball at target position
        onComplete();
      }
    };

    this.ballAnimationId = requestAnimationFrame(animate);
  }

  private checkGameEnd(): void {
    const { currentDistance, targetDistance } = this.stats;

    if (currentDistance === targetDistance) {
      // Win!
      this.state = "won";
      const prize =
        this.config.prizes.shotsToPrize[this.stats.shotsTaken] ||
        this.config.prizes.shotsToPrize[5]; // Default to bogey
      this.events.onWin?.(this.stats.shotsTaken, prize);
    } else if (currentDistance > targetDistance) {
      // Overshoot - lose!
      this.state = "lost";
      this.events.onLose?.();
    } else {
      // Undershoot - continue playing
      this.state = "ready";
    }

    this.drawGame();
  }

  public resetGame(): void {
    this.stopPowerMeterAnimation();

    // Stop ball animation if running
    if (this.ballAnimationId) {
      cancelAnimationFrame(this.ballAnimationId);
      this.ballAnimationId = null;
    }

    this.stats = {
      shotsTaken: 0,
      currentDistance: 0,
      targetDistance: CONFIG.GAME.TARGET_DISTANCE,
    };
    this.state = "ready";
    this.powerMeterTick = 0;
    this.tickDirection = 1;
    this.currentPower = 1;

    // Reset ball animation properties
    this.ballAnimationStart = 0;
    this.ballStartDistance = 0;
    this.ballTargetDistance = 0;

    this.drawGame();
    this.events.onReset?.();
  }

  public getState(): GameState {
    return this.state;
  }

  public getStats(): GameStats {
    return { ...this.stats };
  }

  public getShotName(): string {
    return (
      CONFIG.GOLF_TERMS[this.stats.shotsTaken] ||
      `${this.stats.shotsTaken} shots`
    );
  }

  public destroy(): void {
    this.stopPowerMeterAnimation();

    // Clean up ball animation
    if (this.ballAnimationId) {
      cancelAnimationFrame(this.ballAnimationId);
      this.ballAnimationId = null;
    }
  }
}
