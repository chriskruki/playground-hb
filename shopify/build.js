const fs = require("fs");
const path = require("path");

/**
 * Build script to create inline HTML for Shopify Liquid templates
 * This combines CSS and JS files into a single HTML file
 */

function buildInlineHTML() {
  const shopifyDir = __dirname;

  // Read the source files
  const htmlContent = fs.readFileSync(
    path.join(shopifyDir, "game.html"),
    "utf8"
  );
  const cssContent = fs.readFileSync(path.join(shopifyDir, "game.css"), "utf8");
  const jsContent = fs.readFileSync(path.join(shopifyDir, "game.js"), "utf8");

  // Create inline version
  let inlineHTML = htmlContent;

  // Replace CSS link with inline styles
  const cssLinkRegex = /<link rel="stylesheet" href="game\.css">/;
  const inlineCSS = `<style>\n${cssContent}\n</style>`;
  inlineHTML = inlineHTML.replace(cssLinkRegex, inlineCSS);

  // Replace JS script src with inline script
  const jsScriptRegex = /<script src="game\.js"><\/script>/;
  const inlineJS = `<script>\n${jsContent}\n</script>`;
  inlineHTML = inlineHTML.replace(jsScriptRegex, inlineJS);

  // Write the inline version
  fs.writeFileSync(path.join(shopifyDir, "game-inline.html"), inlineHTML);

  // Create Shopify Liquid template version
  const liquidTemplate = createLiquidTemplate(inlineHTML);
  fs.writeFileSync(
    path.join(shopifyDir, "game-shopify.liquid"),
    liquidTemplate
  );

  console.log("✅ Build complete!");
  console.log("📁 Files created:");
  console.log("   - game-inline.html (standalone HTML file)");
  console.log("   - game-shopify.liquid (Shopify Liquid template)");
}

function createLiquidTemplate(htmlContent) {
  // Extract just the game container content (without html, head, body tags)
  const gameContainerMatch = htmlContent.match(
    /<div class="game-container">[\s\S]*?<\/div>/
  );
  const gameContainer = gameContainerMatch
    ? gameContainerMatch[0]
    : htmlContent;

  // Extract styles and scripts
  const stylesMatch = htmlContent.match(/<style>([\s\S]*?)<\/style>/);
  const scriptsMatch = htmlContent.match(/<script>([\s\S]*?)<\/script>/);

  const styles = stylesMatch ? stylesMatch[1] : "";
  const scripts = scriptsMatch ? scriptsMatch[1] : "";

  return `{%- comment -%}
Mini Golf Game - Shopify Liquid Template
Usage: Include this in your product page or anywhere in your theme
{%- endcomment -%}

<style>
${styles}
</style>

${gameContainer}

<script>
${scripts}
</script>`;
}

// Run the build
buildInlineHTML();
