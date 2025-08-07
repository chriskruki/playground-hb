# Mini Golf Game Logic Documentation

## 🎮 Game Flow

### 1. **Email Gate**

- User must enter valid email address to unlock the game
- Form submits to Klaviyo: `https://manage.kmail-lists.com/subscriptions/subscribe?a=Sg8ErC&g=VR7JgL`
- Game becomes playable after email submission

### 2. **Game Mechanics**

#### **Distance System**

- **Target Distance**: 10 units (configurable via `config.powerMeter.range`)
- **Ball Starting Position**: 0 units
- **Win Condition**: Ball reaches exactly 10 units
- **Lose Condition**: Ball exceeds 10 units (overshoot)

#### **Power Meter**

- **Range**: 1-10 units (configurable via `config.powerMeter.minPower` and `maxPower`)
- **Tick Speed**: 2 pixels per frame (configurable via `config.powerMeter.tickSpeed`)
- **Movement**: Linear bouncing between min/max values
- **Selection**: Player clicks "PUTT" to capture current power value

#### **Shot Accumulation**

- Each shot adds to the total distance traveled
- Example sequence:
  - Shot 1: Power 3 → Ball at distance 3
  - Shot 2: Power 4 → Ball at distance 7
  - Shot 3: Power 3 → Ball at distance 10 → **WIN!**

### 3. **Prize System**

#### **Configurable Prizes by Shot Count**

```typescript
shotsToPrize: {
  1: { name: "Hole in One!", code: "HOLEINONE", description: "Free Round" },
  2: { name: "Eagle!", code: "EAGLE2023", description: "Free Appetizer" },
  3: { name: "Birdie!", code: "BIRDIE10", description: "10% Off Your Order" },
  4: { name: "Par", code: "PAR5OFF", description: "5% Off Your Order" },
  5: { name: "Bogey", code: "BOGEY2", description: "$2 Off Your Order" }
}
```

#### **Prize Display**

- Shows golf terminology (Hole in One, Eagle, Birdie, etc.)
- Displays discount code prominently
- "Claim Prize" button for redemption

### 4. **Game States**

```typescript
type GameState =
  | "email_required"
  | "ready"
  | "aiming"
  | "shooting"
  | "won"
  | "lost";
```

- **email_required**: Initial state, email form visible
- **ready**: Email submitted, ready to start aiming
- **aiming**: Power meter active, player can putt
- **shooting**: Ball animation in progress
- **won**: Player reached exactly 10 units
- **lost**: Player exceeded 10 units

## ⚙️ Configuration Options

### **Game Constants** (in `MiniGolfGame.ts`)

```typescript
// Power meter configuration
powerMeter: {
  minPower: 1,      // Minimum shot distance
  maxPower: 10,     // Maximum shot distance
  tickSpeed: 2,     // Pixels per frame for tick movement
  range: 10,        // Target distance to win
}

// Prize configuration
prizes: {
  shotsToPrize: {
    // Add/modify prize tiers
    1: { name: "Custom Prize", code: "CUSTOM", description: "Custom Reward" }
  }
}
```

### **Visual Configuration**

```typescript
// Colors
colors: {
  powerMeter: {
    background: "#f0f0f0",  // Meter background
    border: "#333",         // Meter border
    tick: "#EC3C28",        // Moving tick color
    fill: "#4CAF50",        // Power fill color
  }
}

// Dimensions
dimensions: {
  powerMeter: {
    width: 300,    // Meter width in pixels
    height: 20,    // Meter height in pixels
    x: 200,        // X position on canvas
    y: 130         // Y position on canvas
  }
}
```

## 🎯 Key Features

### **Email Integration**

- ✅ Klaviyo form integration with actual submission
- ✅ Client-side email validation
- ✅ Game unlock after submission

### **Power Meter System**

- ✅ Smooth linear tick movement
- ✅ Configurable speed and range
- ✅ Visual power indicator
- ✅ Precise timing-based selection

### **Distance Accumulation**

- ✅ Shot distances accumulate toward target
- ✅ Real-time distance tracking
- ✅ Undershoot = continue playing
- ✅ Overshoot = lose and restart

### **Prize Management**

- ✅ Golf terminology (Hole in One, Eagle, Birdie, Par, Bogey)
- ✅ Configurable discount codes
- ✅ Prize claiming interface
- ✅ Multiple prize tiers

### **Game Flow**

- ✅ Email gate prevents play without signup
- ✅ Clear visual state indicators
- ✅ Shot counter with golf terms
- ✅ Win/lose conditions with appropriate UI
- ✅ Reset and play again functionality

## 🔧 Customization Guide

### **Changing Prize Codes**

Edit the `prizes.shotsToPrize` object in the game configuration:

```typescript
const customPrizes = {
  1: { name: "Ace!", code: "NEWCODE1", description: "Free Shipping" },
  2: { name: "Great Shot!", code: "NEWCODE2", description: "15% Off" },
};
```

### **Adjusting Difficulty**

Modify power meter settings:

```typescript
powerMeter: {
  tickSpeed: 3,      // Faster = harder
  range: 15,         // Higher = more shots needed
  maxPower: 8,       // Lower max = more precision required
}
```

### **Updating Email Integration**

Change the Klaviyo form action URL in `main.ts`:

```typescript
action =
  "https://manage.kmail-lists.com/subscriptions/subscribe?a=YOUR_ID&g=YOUR_GROUP";
```

## 📊 Game Analytics

The game logs key events for tracking:

- Email submissions
- Shot attempts with power values
- Win/lose outcomes
- Prize claims

These can be enhanced with your analytics platform for conversion tracking.
