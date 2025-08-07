# Configuration Guide

## 🛠️ Configuration System

All game settings are centralized in `src/config.ts` for easy customization and maintenance.

## 🐛 Debug Mode

### Development Settings

```typescript
DEBUG: true,                    // Enable debug logging and features
SKIP_EMAIL_SUBMISSION: true,    // Skip actual Klaviyo submission in debug mode
```

### Production Settings

```typescript
DEBUG: false,                   // Disable debug features
SKIP_EMAIL_SUBMISSION: false,   // Enable Klaviyo email submission
```

## 📧 Email Integration

### Klaviyo Configuration

```typescript
KLAVIYO_URL: "https://manage.kmail-lists.com/subscriptions/subscribe?a=Sg8ErC&g=VR7JgL";
```

**Debug Behavior:**

- When `DEBUG: true` and `SKIP_EMAIL_SUBMISSION: true`: Email form works but doesn't submit to Klaviyo
- When `DEBUG: false` or `SKIP_EMAIL_SUBMISSION: false`: Full Klaviyo integration

## 🎮 Game Mechanics

### Core Settings

```typescript
GAME: {
  TARGET_DISTANCE: 10,           // Units needed to win
  POWER_METER: {
    MIN_POWER: 1,                // Minimum shot power
    MAX_POWER: 10,               // Maximum shot power
    TICK_SPEED: 2,               // Power meter speed (pixels/frame)
    METER_WIDTH: 300,            // Power meter width
    METER_HEIGHT: 20,            // Power meter height
  },
      ANIMATION: {
      BALL_DURATION: 1200,         // Ball movement animation duration (ms)
      BALL_EASING: (t) => 1 - Math.pow(1 - t, 3), // Ball animation easing function
      POWER_METER_FPS: 60,         // Target FPS for power meter animation
      POWER_METER_SMOOTHING: 0.1,  // Smoothing factor for power meter tick
    }
}
```

### Visual Layout

```typescript
CANVAS: {
  WIDTH: 700,                    // Game canvas width
  HEIGHT: 160,                   // Game canvas height
}

POSITIONS: {
  LANE: { x: 70, y: 45, width: 560, height: 30 },
  HOLE: { x: 620, y: 60, radius: 6 },
  BALL: { x: 100, y: 60, radius: 6 },
  POWER_METER: { x: 200, y: 130 },
  PUTTY_CHARACTER: { left: 15, top: 10, height: 90 },
}
```

## 🎨 Colors & Styling

```typescript
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
}
```

## 🏆 Prize System

### Default Prizes

```typescript
PRIZES: {
  1: { name: "Hole in One!", code: "HOLEINONE", description: "Free Round" },
  2: { name: "Eagle!", code: "EAGLE2023", description: "Free Appetizer" },
  3: { name: "Birdie!", code: "BIRDIE10", description: "10% Off Your Order" },
  4: { name: "Par", code: "PAR5OFF", description: "5% Off Your Order" },
  5: { name: "Bogey", code: "BOGEY2", description: "$2 Off Your Order" },
}
```

### Adding Custom Prizes

```typescript
// Add new prize tiers
6: { name: "Double Bogey", code: "DOUBLE5", description: "$1 Off Your Order" },
7: { name: "Triple Bogey", code: "TRIPLE2", description: "Free Shipping" },
```

## 🖼️ Assets

```typescript
ASSETS: {
  PUTTY_IMAGE_URL: "https://cdn.shopify.com/s/files/1/1234/5678/files/putty-transparent.png",
}
```

## 📝 UI Text

### Customizable Text Elements

```typescript
TEXT: {
  TITLE: "Play Mini Golf with Putty & Win Prizes!",
  SUBTITLE: "Enter your email, aim carefully, and win amazing rewards!",
  EMAIL_PLACEHOLDER: "you@domain.com",
  EMAIL_BUTTON: "Let's Putt!",
  INSTRUCTIONS: "Aim for exactly 10 units total distance to win! Don't overshoot or you'll have to start over.",

  GAME_STATES: {
    EMAIL_REQUIRED: "Enter your email to start playing!",
    READY: "Ready to play! Click 'Start Aiming' to begin.",
    AIMING: "Watch the power meter and click PUTT when ready!",
    SHOOTING: (power, distance) => `Shot ${power} units! Ball at distance ${distance}`,
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
}
```

## ⚙️ Common Customizations

### 1. Change Difficulty

```typescript
// Make it easier
TARGET_DISTANCE: 8,
POWER_METER: { TICK_SPEED: 1 }

// Make it harder
TARGET_DISTANCE: 15,
POWER_METER: { TICK_SPEED: 4 }
```

### 2. Update Branding

```typescript
TEXT: {
  TITLE: "Your Brand Mini Golf Challenge!",
  SUBTITLE: "Play our game and win exclusive rewards!",
}

ASSETS: {
  PUTTY_IMAGE_URL: "https://your-cdn.com/your-character.png",
}
```

### 3. Modify Prize Structure

```typescript
PRIZES: {
  1: { name: "Perfect Shot!", code: "PERFECT25", description: "25% Off Everything" },
  2: { name: "Great Shot!", code: "GREAT15", description: "15% Off Your Order" },
  3: { name: "Good Shot!", code: "GOOD10", description: "10% Off Your Order" },
  // Remove higher shot counts for more exclusive prizes
}
```

### 4. Change Email Provider

```typescript
// For different email service
KLAVIYO_URL: "https://your-email-service.com/subscribe?list=your-list-id",

// For testing/development
DEBUG: true,
SKIP_EMAIL_SUBMISSION: true, // Test without real submissions
```

### 5. Adjust Visual Style

```typescript
COLORS: {
  BACKGROUND: "#your-brand-color",
  LANE: "#custom-green",
  FLAG: "#your-accent-color",
  POWER_METER: {
    FILL: "#your-progress-color",
    TICK: "#your-highlight-color",
  },
}

POSITIONS: {
  PUTTY_CHARACTER: { left: 20, top: 5, height: 100 }, // Adjust character position
}
```

## 🚀 Deployment Modes

### Development

- Set `DEBUG: true` for console logging and debug features
- Set `SKIP_EMAIL_SUBMISSION: true` to test without Klaviyo
- Use `npm run dev` for live development

### Staging

- Set `DEBUG: true` but `SKIP_EMAIL_SUBMISSION: false`
- Test full email integration with real Klaviyo
- Use `npm run build:shopify` to generate files

### Production

- Set `DEBUG: false` and `SKIP_EMAIL_SUBMISSION: false`
- Build with `npm run build:shopify`
- Deploy generated `game-shopify.liquid` to Shopify

## 🔧 Advanced Configuration

### Custom Animation Settings

```typescript
ANIMATION: {
  // Ball animation settings
  BALL_DURATION: 800,              // Faster ball movement
  BALL_EASING: (t) => t * t * (3 - 2 * t), // Smooth step easing

  // Power meter animation settings
  POWER_METER_FPS: 120,            // Higher FPS for ultra-smooth meter
  POWER_METER_SMOOTHING: 0.05,     // More responsive power display
}

// Alternative easing functions:
// BALL_EASING: (t) => 1 - Math.cos(t * Math.PI / 2), // Sine ease-out
// BALL_EASING: (t) => t < 0.5 ? 2*t*t : -1+(4-2*t)*t, // Quad ease-in-out
```

### Dynamic Prize Calculation

```typescript
// In config.ts, you can create computed prizes
const basePrizeValue = 20;
PRIZES: {
  1: { name: "Hole in One!", code: "HOLE" + basePrizeValue*2, description: `${basePrizeValue*2}% Off` },
  2: { name: "Eagle!", code: "EAGLE" + basePrizeValue, description: `${basePrizeValue}% Off` },
  // etc.
}
```

This configuration system makes the game highly customizable while maintaining type safety and easy maintenance.
