// Game Configuration
export const CONFIG = {
  // Debug settings
  DEBUG: true, // Set to false in production

  // Email/Marketing settings
  KLAVIYO_URL:
    "https://manage.kmail-lists.com/subscriptions/subscribe?a=Sg8ErC&g=VR7JgL",
  SKIP_EMAIL_SUBMISSION: true, // When DEBUG is true, this allows skipping actual email submission

  // Game mechanics
  GAME: {
    TARGET_DISTANCE: 10,
    POWER_METER: {
      MIN_POWER: 1,
      MAX_POWER: 10,
      TICK_SPEED: 10, // pixels per frame
      METER_WIDTH: 300,
      METER_HEIGHT: 20,
    },
    ANIMATION: {
      BALL_DURATION: 1200, // milliseconds for ball movement
      BALL_EASING: (t: number) => 1 - Math.pow(1 - t, 3), // easeOut cubic
      POWER_METER_FPS: 60, // Target FPS for power meter animation
      POWER_METER_SMOOTHING: 0.1, // Smoothing factor for power meter tick
    },
  },

  // Canvas dimensions
  CANVAS: {
    WIDTH: 700,
    HEIGHT: 160,
  },

  // Game element positions
  POSITIONS: {
    LANE: { x: 70, y: 45, width: 560, height: 30 },
    HOLE: { x: 620, y: 60, radius: 6 },
    BALL: { x: 100, y: 60, radius: 6 },
    POWER_METER: { x: 200, y: 130 },
    PUTTY_CHARACTER: { left: 15, top: 10, height: 90 },
  },

  // Colors
  COLORS: {
    BACKGROUND: "#fff1d4",
    LANE: "#02210A",
    HOLE: "#000",
    FLAG: "#EC3C28",
    BALL: "#fff",
    STROKE: "#000",
    POWER_METER: {
      BACKGROUND: "#f0f0f0",
      BORDER: "#333",
      TICK: "#EC3C28",
      FILL: "#4CAF50",
    },
  },

  // Prize system
  PRIZES: {
    1: {
      name: "Hole in One!",
      code: "HOLEINONE",
      description: "Free Round",
    },
    2: {
      name: "Eagle!",
      code: "EAGLE2023",
      description: "Free Appetizer",
    },
    3: {
      name: "Birdie!",
      code: "BIRDIE10",
      description: "10% Off Your Order",
    },
    4: {
      name: "Par",
      code: "PAR5OFF",
      description: "5% Off Your Order",
    },
    5: {
      name: "Bogey",
      code: "BOGEY2",
      description: "$2 Off Your Order",
    },
  },

  // Assets
  ASSETS: {
    PUTTY_IMAGE_URL: "/putty.png",
    // "https://cdn.shopify.com/s/files/1/1234/5678/files/putty-transparent.png",
  },

  // UI Text
  TEXT: {
    TITLE: "Play Mini Golf with Putty & Win Prizes!",
    SUBTITLE: "Enter your email, aim carefully, and win amazing rewards!",
    EMAIL_PLACEHOLDER: "you@domain.com",
    EMAIL_BUTTON: "Let's Putt!",
    INSTRUCTIONS:
      "Aim for exactly 10 units total distance to win! Don't overshoot or you'll have to start over.",
    GAME_STATES: {
      EMAIL_REQUIRED: "Enter your email to start playing!",
      READY: "Ready to play! Click 'Start Aiming' to begin.",
      AIMING: "Watch the power meter and click PUTT when ready!",
      SHOOTING: (power: number, distance: number) =>
        `Shot ${power} units! Ball at distance ${distance}`,
    },
    BUTTONS: {
      AIM: "🎯 Start Aiming",
      PUTT: "🏌️ PUTT!",
      CLAIM_PRIZE: "🎉 Claim Prize",
      PLAY_AGAIN: "Play Again",
      TRY_AGAIN: "🔄 Try Again",
    },
    LOSE: {
      TITLE: "Oops! You overshot the hole!",
      DESCRIPTION: "Don't worry, you can try again!",
    },
  },

  // Golf terminology mapping
  GOLF_TERMS: {
    1: "Hole in One",
    2: "Eagle",
    3: "Birdie",
    4: "Par",
    5: "Bogey",
    6: "Double Bogey",
    7: "Triple Bogey",
  } as Record<number, string>,
} as const;

// Type helpers for better TypeScript support
export type PrizeKey = keyof typeof CONFIG.PRIZES;
export type Prize = (typeof CONFIG.PRIZES)[PrizeKey];
