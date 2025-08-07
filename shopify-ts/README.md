# Mini Golf Game - TypeScript/Vite Version

A modern, interactive mini golf game built with TypeScript and Vite, designed for Shopify stores to engage customers and offer discounts.

## 🚀 Features

- **TypeScript**: Full type safety and modern ES6+ features
- **Vite**: Lightning-fast development and optimized builds
- **Interactive Gameplay**: Click or press SPACE to shoot the ball
- **Responsive Design**: Works perfectly on mobile and desktop
- **Game State Management**: Visual feedback for all game states
- **Shopify Ready**: Easy deployment to Shopify stores
- **Modern Architecture**: Clean, maintainable code structure

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+
- npm or yarn

### Getting Started

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Start Development Server**

   ```bash
   npm run dev
   ```

   Opens at `http://localhost:5173` with hot-reload

3. **Type Check**
   ```bash
   npm run type-check
   ```

## 📁 Project Structure

```
shopify-ts/
├── src/
│   ├── types.ts           # TypeScript interfaces and types
│   ├── MiniGolfGame.ts    # Main game class with full typing
│   ├── main.ts            # Application entry point
│   ├── style.css          # Game styles
│   └── build.ts           # Shopify build script
├── index.html             # HTML template
├── package.json           # Dependencies and scripts
└── tsconfig.json          # TypeScript configuration
```

## 🏗️ Building for Shopify

### Development Build

```bash
npm run build
```

Creates optimized files in `dist/` directory

### Shopify Production Build

```bash
npm run build:shopify
```

Generates two files:

- `game-inline.html` - Standalone HTML file
- `game-shopify.liquid` - Shopify Liquid template

## 🛍️ Shopify Integration

### Option 1: Inline HTML (Recommended)

1. Run `npm run build:shopify`
2. Copy contents of `game-inline.html`
3. Paste into any Shopify template

### Option 2: Liquid Template

1. Run `npm run build:shopify`
2. Copy contents of `game-shopify.liquid`
3. Create new section in your Shopify theme
4. Include with `{% section 'mini-golf-game' %}`

## 🎮 Game Features

### Core Mechanics

- **Ball Physics**: Realistic animation with easing
- **Win Detection**: Automatic detection when ball reaches hole
- **State Management**: Idle → Animating → Won → Reset cycle
- **Keyboard Support**: SPACE key to shoot
- **Reset Functionality**: Play again button after winning

### Visual Enhancements

- **Hover Effects**: Interactive canvas with scale effects
- **State Indicators**: Visual feedback for game progress
- **Celebration Animation**: Winner animation on success
- **Responsive Layout**: Adapts to all screen sizes

## 🎨 Customization

### Game Configuration

Edit `src/main.ts` to customize game behavior:

```typescript
const gameConfig = {
  colors: {
    /* custom colors */
  },
  dimensions: {
    /* custom sizes */
  },
  animation: {
    /* timing and easing */
  },
};
```

### Styling

Modify `src/style.css` for visual customization:

- Colors and themes
- Layout and spacing
- Responsive breakpoints
- Animation effects

### Shopify Integration

Enhance `src/main.ts` event handlers:

```typescript
const gameEvents = {
  onWin: () => {
    // Apply discount code
    // Redirect to cart
    // Track conversion
    // Show modal
  },
};
```

## 🔧 TypeScript Benefits

- **Type Safety**: Catch errors at compile time
- **IntelliSense**: Better IDE support and autocomplete
- **Refactoring**: Safe code changes with confidence
- **Documentation**: Self-documenting code with types
- **Modern Features**: Latest JavaScript features with compatibility

## 📱 Mobile Optimization

- **Touch Support**: Optimized for touch interactions
- **Responsive Canvas**: Scales properly on all devices
- **Performance**: Optimized animations for mobile
- **Accessibility**: Keyboard navigation support

## 🚀 Performance Features

- **Vite Optimization**: Fast builds and small bundles
- **Tree Shaking**: Only include used code
- **Modern Output**: ES6+ for modern browsers
- **Efficient Animations**: RequestAnimationFrame for smooth performance

## 🛠️ Development Tips

1. **Hot Reload**: Changes reflect instantly during development
2. **Type Checking**: Run `npm run type-check` before commits
3. **Build Testing**: Test `npm run build:shopify` before deployment
4. **Asset URLs**: Update Putty image URL for your Shopify CDN
5. **Console Logs**: Development console shows helpful game info

## 📈 Shopify Enhancements

The TypeScript version includes hooks for:

- **Discount Code Application**: Automatic discount code handling
- **Analytics Tracking**: Game interaction events
- **Cart Integration**: Direct add-to-cart functionality
- **Customer Data**: Integration with Shopify customer API
- **A/B Testing**: Easy variation testing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with proper TypeScript types
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is designed for Shopify store integration. Customize freely for your store needs.
