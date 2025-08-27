# HTML to Liquid Conversion Tool

This tool automatically converts the `shopify-min/mini-golf-minimal.html` file into a Shopify Liquid section with customizable settings.

## Usage

### Option 1: Using npm script

```bash
npm run convert:liquid
```

### Option 2: Direct execution

```bash
cd shopify-min && node html-to-liquid.js
```

## What it does

The script performs the following conversions:

1. **CSS Scoping**: Wraps all CSS rules with `.mini-golf-container` to prevent theme conflicts
2. **ID Namespacing**: Adds `{{ section.id }}` suffix to all HTML IDs to allow multiple instances
3. **Text Replacement**: Converts hardcoded text to Liquid variables with fallbacks
4. **Form Integration**: Ensures Klaviyo form integration is properly formatted
5. **JavaScript Integration**: Sets up external JavaScript file loading and initialization
6. **Schema Generation**: Creates complete Shopify section schema with all settings

## Files Generated

- `shopify-min/mini-golf-game.liquid` - The complete Shopify section file

## Files Required for Shopify

After running the conversion, upload this file to your Shopify theme:

1. `shopify-min/mini-golf-game.liquid` → `sections/mini-golf-game.liquid`

Then configure the putty character image through the section settings in the Shopify theme editor.

**Note**: The form now prevents default submission and stays on the page while submitting the email to Klaviyo in the background.

## Customizable Settings

The generated Liquid section includes these customizable settings:

### Game Content

- Game Title
- Game Subtitle
- Email Placeholder
- Submit Button Text

### Marketing Integration

- Marketing URL (for email submission)

### Game Assets

- Putty Character Image (uploadable)

### Prizes (1-5)

Each prize includes:

- Name
- Code
- Description

## Placeholder Values in HTML

Use these placeholder values in the HTML file for automatic Liquid conversion:

### Text Content

- `GAME_TITLE` - Main heading text
- `GAME_SUBTITLE` - Subtitle/description text
- `EMAIL_PLACEHOLDER` - Email input placeholder
- `SUBMIT_BUTTON_TEXT` - Form submit button text

### Prize Data

- `PRIZE_1_NAME`, `PRIZE_1_CODE`, `PRIZE_1_DESC` - Prize 1 details
- `PRIZE_2_NAME`, `PRIZE_2_CODE`, `PRIZE_2_DESC` - Prize 2 details
- `PRIZE_3_NAME`, `PRIZE_3_CODE`, `PRIZE_3_DESC` - Prize 3 details
- `PRIZE_4_NAME`, `PRIZE_4_CODE`, `PRIZE_4_DESC` - Prize 4 details
- `PRIZE_5_NAME`, `PRIZE_5_CODE`, `PRIZE_5_DESC` - Prize 5 details

## Development Workflow

1. Make changes to `shopify-min/mini-golf-minimal.html` using placeholder values
2. Run `npm run convert:liquid` to generate the Liquid section
3. Upload the generated files to Shopify
4. Test in the theme customizer

## Supported Conversions

The script automatically handles:

- **Placeholder Values** → Liquid variables with defaults:
  - `GAME_TITLE` → `{{ section.settings.game_title | default: "Mini Golf with Putty" }}`
  - `GAME_SUBTITLE` → `{{ section.settings.game_subtitle | default: "Enter your email and win prizes!" }}`
  - `EMAIL_PLACEHOLDER` → `{{ section.settings.email_placeholder | default: "you@domain.com" }}`
  - `SUBMIT_BUTTON_TEXT` → `{{ section.settings.submit_button_text | default: "Let's Putt!" }}`
  - `PRIZE_X_NAME/CODE/DESC` → Corresponding section settings
- **Static asset references** → Shopify asset URLs
- **HTML IDs** → Section-scoped IDs (e.g., `id="canvas"` → `id="canvas-{{ section.id }}"`)
- **JavaScript functions** → Section-scoped functions (e.g., `putt()` → `putt{{ section.id }}()`)
- **CSS** → Scoped with `.mini-golf-container` prefix

## Notes

- The original HTML file serves as the source of truth
- Always run the conversion after making HTML changes
- The generated Liquid file should not be edited manually
- JavaScript is externalized for better performance and maintainability
