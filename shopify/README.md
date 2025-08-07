# Mini Golf Game for Shopify

A interactive mini golf game designed for Shopify stores to engage customers and offer discounts.

## Development Setup

### File Structure

```
shopify/
├── game.html      # Development HTML file
├── game.css       # Stylesheet (for development)
├── game.js        # Game logic (for development)
├── server.js      # Development server
├── build.js       # Build script for production
└── README.md      # This file
```

### Development Commands

1. **Start Development Server**

   ```bash
   npm run game:dev
   ```

   Opens the game at `http://localhost:3000` with hot-reload capabilities.

2. **Build for Production**
   ```bash
   npm run game:build
   ```
   Generates production-ready files:
   - `game-inline.html` - Standalone HTML file with inline CSS/JS
   - `game-shopify.liquid` - Shopify Liquid template ready to paste

## Usage in Shopify

### Option 1: Inline HTML (Recommended)

1. Run `npm run game:build`
2. Copy the contents of `game-inline.html`
3. Paste into any Shopify template or section

### Option 2: Liquid Template

1. Run `npm run game:build`
2. Copy the contents of `game-shopify.liquid`
3. Create a new section in your Shopify theme
4. Paste the liquid code and include the section where needed

## Game Features

- **Interactive Canvas Game**: Click to shoot the golf ball
- **Animated Ball Movement**: Smooth animation with easing
- **Win Detection**: Triggers when ball reaches the hole
- **Responsive Design**: Works on mobile and desktop
- **Shopify Integration Ready**: Designed for easy integration with discount codes

## Customization

### Styling

Edit `game.css` to customize:

- Colors and theme
- Layout and spacing
- Responsive breakpoints

### Game Logic

Edit `game.js` to customize:

- Animation speed and easing
- Win conditions
- Reward triggers
- Game mechanics

### Shopify Integration

The game can be enhanced to:

- Apply discount codes automatically
- Track game completions
- Integrate with Shopify's cart system
- Send analytics events

## Development Tips

1. **Live Development**: Use `npm run game:dev` for real-time changes
2. **Production Build**: Always run `npm run game:build` before deploying
3. **Asset URLs**: Update the Putty image URL in `game.html` to match your Shopify CDN
4. **Testing**: Test the inline HTML in Shopify's theme customizer before going live
