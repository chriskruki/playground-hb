import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { CONFIG } from "./config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, "..");

/**
 * Build script to create Shopify-ready inline HTML from the Vite build
 * This should be run after `npm run build`
 */

interface BuildConfig {
  outputDir: string;
  shopifyOutputFile: string;
  inlineOutputFile: string;
}

const config: BuildConfig = {
  outputDir: resolve(projectRoot, "dist"),
  shopifyOutputFile: resolve(projectRoot, "game-shopify.liquid"),
  inlineOutputFile: resolve(projectRoot, "game-inline.html"),
};

async function buildShopifyVersion(): Promise<void> {
  try {
    console.log("🏗️  Building Shopify version...");

    // Read the built HTML file
    const htmlPath = resolve(config.outputDir, "index.html");
    const htmlContent = readFileSync(htmlPath, "utf8");

    // Extract CSS and JS content from the built files
    const cssContent = extractInlineCSS(htmlContent);
    const jsContent = extractInlineJS(htmlContent);

    // Create inline HTML version
    const inlineHTML = createInlineHTML(htmlContent, cssContent, jsContent);
    writeFileSync(config.inlineOutputFile, inlineHTML);

    // Create Shopify Liquid template
    const liquidTemplate = createLiquidTemplate(inlineHTML);
    writeFileSync(config.shopifyOutputFile, liquidTemplate);

    console.log("✅ Shopify build complete!");
    console.log("📁 Files created:");
    console.log(`   - ${config.inlineOutputFile} (standalone HTML)`);
    console.log(`   - ${config.shopifyOutputFile} (Shopify Liquid template)`);
  } catch (error) {
    console.error("❌ Build failed:", error);
    process.exit(1);
  }
}

function extractInlineCSS(htmlContent: string): string {
  const cssMatch = htmlContent.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
  return cssMatch
    ? cssMatch.map((match) => match.replace(/<\/?style[^>]*>/gi, "")).join("\n")
    : "";
}

function extractInlineJS(htmlContent: string): string {
  const jsMatch = htmlContent.match(
    /<script[^>]*type="module"[^>]*>([\s\S]*?)<\/script>/gi
  );
  return jsMatch
    ? jsMatch.map((match) => match.replace(/<\/?script[^>]*>/gi, "")).join("\n")
    : "";
}

function createInlineHTML(
  htmlContent: string,
  cssContent: string,
  jsContent: string
): string {
  // Remove Vite-specific elements and create a clean HTML structure
  const gameContainerMatch = htmlContent.match(
    /<div class="game-container">[\s\S]*?<\/div>/
  );
  const gameContainer = gameContainerMatch
    ? gameContainerMatch[0]
    : '<div class="game-container">Game content not found</div>';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mini Golf Game</title>
  <style>
${cssContent}
  </style>
</head>
<body>
  <div id="app">
    ${gameContainer}
  </div>
  <script>
${jsContent}
  </script>
</body>
</html>`;
}

function createLiquidTemplate(htmlContent: string): string {
  // Extract just the game container and styles/scripts
  const gameContainerMatch = htmlContent.match(
    /<div class="game-container">[\s\S]*?<\/div>/
  );
  const gameContainer = gameContainerMatch
    ? gameContainerMatch[0]
    : htmlContent;

  const stylesMatch = htmlContent.match(/<style>([\s\S]*?)<\/style>/);
  const scriptsMatch = htmlContent.match(/<script>([\s\S]*?)<\/script>/);

  const styles = stylesMatch ? stylesMatch[1] : "";
  const scripts = scriptsMatch ? scriptsMatch[1] : "";

  return `{%- comment -%}
Mini Golf Game - Shopify Liquid Template (TypeScript Version)
Usage: Include this in your product page or anywhere in your theme

Features:
- TypeScript-compiled game logic with configuration system
- Debug mode support for development
- Configurable email integration (Klaviyo: ${CONFIG.KLAVIYO_URL})
- Modern ES6+ features with type safety
- Enhanced user experience with prize system
- Mobile responsive design

Installation:
1. Copy this entire template
2. Create a new section in your Shopify theme
3. Paste the code and save
4. Include the section where needed: {% section 'mini-golf-game' %}

Configuration:
- Set DEBUG to false for production
- Update KLAVIYO_URL for your mailing list
- Customize prizes, colors, and game mechanics in config
- Modify Putty image URL: ${CONFIG.ASSETS.PUTTY_IMAGE_URL}

Prize System:
${Object.entries(CONFIG.PRIZES)
  .map(
    ([shots, prize]) =>
      `- ${shots} shot${shots === "1" ? "" : "s"}: ${prize.name} (${
        prize.code
      }) - ${prize.description}`
  )
  .join("\n")}
{%- endcomment -%}

<style>
${styles}
</style>

<div id="mini-golf-app">
  ${gameContainer}
</div>

<script>
// Shopify-specific enhancements
(function() {
  // Production mode override for Shopify
  if (typeof window !== 'undefined' && window.CONFIG) {
    window.CONFIG.DEBUG = false;
    window.CONFIG.SKIP_EMAIL_SUBMISSION = false;
  }
  
  // Replace the app selector for Shopify context
  const gameContainer = document.querySelector('#mini-golf-app .game-container');
  if (gameContainer && !document.getElementById('golfPreview')) {
    console.log('Mini Golf Game loaded in Shopify context');
  }
  
  ${scripts}
})();
</script>`;
}

// Run the build if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  buildShopifyVersion();
}
