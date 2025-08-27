#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Configuration for HTML to Liquid conversion
const CONVERSION_MAP = {
  // Text content replacements
  GAME_TITLE: '{{ section.settings.game_title | default: "Mini Golf with Putty" }}',
  GAME_SUBTITLE: '{{ section.settings.game_subtitle | default: "Enter your email and win prizes!" }}',
  EMAIL_PLACEHOLDER: '{{ section.settings.email_placeholder | default: "you@domain.com" }}',
  SUBMIT_BUTTON_TEXT: '{{ section.settings.submit_button_text | default: "Let\'s Putt!" }}',
  AIM_BANNER_TEXT:
    '{{ section.settings.aim_banner_text | default: "Watch the power meter and click PUTT when ready!" }}',

  // Prize data
  PRIZE_1_NAME: '{{ section.settings.prize_1_name | default: "Hole in One!" }}',
  PRIZE_1_CODE: '{{ section.settings.prize_1_code | default: "HOLEINONE" }}',
  PRIZE_1_DESC: '{{ section.settings.prize_1_desc | default: "Free Round" }}',

  PRIZE_2_NAME: '{{ section.settings.prize_2_name | default: "Eagle!" }}',
  PRIZE_2_CODE: '{{ section.settings.prize_2_code | default: "EAGLE2023" }}',
  PRIZE_2_DESC: '{{ section.settings.prize_2_desc | default: "Free Appetizer" }}',

  PRIZE_3_NAME: '{{ section.settings.prize_3_name | default: "Birdie!" }}',
  PRIZE_3_CODE: '{{ section.settings.prize_3_code | default: "BIRDIE10" }}',
  PRIZE_3_DESC: '{{ section.settings.prize_3_desc | default: "10% Off Your Order" }}',

  PRIZE_4_NAME: '{{ section.settings.prize_4_name | default: "Par" }}',
  PRIZE_4_CODE: '{{ section.settings.prize_4_code | default: "PAR5OFF" }}',
  PRIZE_4_DESC: '{{ section.settings.prize_4_desc | default: "5% Off Your Order" }}',

  PRIZE_5_NAME: '{{ section.settings.prize_5_name | default: "Bogey" }}',
  PRIZE_5_CODE: '{{ section.settings.prize_5_code | default: "BOGEY2" }}',
  PRIZE_5_DESC: '{{ section.settings.prize_5_desc | default: "$2 Off Your Order" }}',

  // Image URLs
  PUTTY_IMAGE_URL: "{{ section.settings.putty_image | image_url }}",
};

// File paths
const HTML_FILE = path.join(__dirname, "golf-game.html");
const LIQUID_OUTPUT = path.join(__dirname, "golf-game.liquid");

function convertHtmlToLiquid() {
  try {
    // Read the HTML file
    console.log("Reading HTML file...");
    const htmlContent = fs.readFileSync(HTML_FILE, "utf8");

    // Start building the Liquid template
    let liquidContent = "";

    // Add Liquid header comment
    liquidContent += `{% comment %}
  Mini Golf Game Section for Shopify
  Auto-generated from golf-game.html
  Customizable prizes and marketing URL
{% endcomment %}

`;

    // Extract and convert CSS
    console.log("Processing CSS...");
    const cssMatch = htmlContent.match(/<style>([\s\S]*?)<\/style>/);
    if (cssMatch) {
      let css = cssMatch[1];
      // Simply wrap all CSS in a .mini-golf-container scope to prevent theme conflicts
      // This is more reliable than trying to parse individual selectors

      liquidContent += `<style>
/* Theme integration styles */
.mini-golf-section {
  display: grid;
  grid-template-columns: subgrid;
  grid-column: 1 / -1;
}

.mini-golf-container {
  grid-column: 2;
  max-width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

/* Full width adjustments */
.section--full-width .mini-golf-container {
  grid-column: 1 / -1;
  padding: 0 var(--padding-lg, 20px);
}

/* Mobile responsiveness */
@media screen and (width < 750px) {
  .mini-golf-container {
    grid-column: 1 / -1;
    padding: 0 var(--padding-md, 16px);
  }
}

/* Game-specific styles wrapped to prevent theme conflicts */
.mini-golf-container {
${css}
}
</style>

`;
    }

    // Extract and convert HTML body content
    console.log("Processing HTML...");
    const bodyMatch = htmlContent.match(/<body>([\s\S]*?)<\/body>/);
    if (bodyMatch) {
      let bodyContent = bodyMatch[1];

      // Remove the inline <script>...</script> from body HTML; JS will be inlined separately later
      bodyContent = bodyContent.replace(/<script>[\s\S]*?<\/script>/, "");

      // Remove the outer container div and replace with mini-golf-container
      bodyContent = bodyContent.replace(/<div class="container">/, '<div class="mini-golf-container">');

      // Add section ID suffixes to all IDs to prevent conflicts
      bodyContent = bodyContent.replace(/id="([^"]+)"/g, 'id="$1-{{ section.id }}"');
      bodyContent = bodyContent.replace(/getElementById\("([^"]+)"\)/g, 'getElementById("$1-{{ section.id }}")');

      // Replace static text with Liquid variables
      Object.entries(CONVERSION_MAP).forEach(([htmlText, liquidText]) => {
        const regex = new RegExp(`\\b${htmlText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "g");
        bodyContent = bodyContent.replace(regex, liquidText);
      });

      // Handle the Klaviyo form - ensure it uses the correct structure and replace placeholders
      bodyContent = bodyContent.replace(
        /<!-- Klaviyo Signup Form for Playground -->\s*<form[^>]*>[\s\S]*?<\/form>/,
        `<!-- Email Signup Form for Mini Golf -->
        <form
          id="email-form-{{ section.id }}"
          style="margin-top: 30px; display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;"
          onsubmit="GolfGameHandleFormSubmit(event)"
        >
          <input
            type="email"
            name="email"
            id="email-{{ section.id }}"
            required
            placeholder="{{ section.settings.email_placeholder | default: 'you@domain.com' }}"
            style="
              padding: 12px 16px;
              font-size: 16px;
              border: 1px solid #ccc;
              border-radius: 6px;
              min-width: 280px;
              font-family: 'General Sans', sans-serif;
            "
          />
          <button
            type="submit"
            style="
              background-color: #923C07;
              color: white;
              padding: 12px 20px;
              font-size: 16px;
              border: none;
              border-radius: 6px;
              cursor: pointer;
              font-family: 'General Sans', sans-serif;
            "
          >
            {{ section.settings.submit_button_text | default: "Let's Putt!" }}
          </button>
        </form>`,
      );

      // Wrap the game content in theme section structure
      const wrappedContent = `{% liquid
  case section.settings.content_width
    when 'content-center-aligned'
      assign content_width = 'page-width'
    when 'content-full-width'
      assign content_width = 'full-width'
  endcase
%}

<div class="section-background color-{{ section.settings.color_scheme }}"></div>
<div
  class="mini-golf-section section section--{{ content_width }} spacing-style color-{{ section.settings.color_scheme }} relative"
  style="{% render 'spacing-style', settings: section.settings %}"
>
${bodyContent}
</div>`;

      liquidContent += wrappedContent;
    }

    // Process and inline the JavaScript
    console.log("Processing and inlining JavaScript...");

    // Find and extract the JavaScript from the HTML
    const scriptMatch = htmlContent.match(/<script>([\s\S]*?)<\/script>/);
    if (scriptMatch) {
      let jsContent = scriptMatch[1];

      // Replace const declarations with Liquid values using | json so no extra escaping is needed
      const constReplacements = [
        {
          key: "GAME_TITLE",
          value: '{{ section.settings.game_title | default: "Mini Golf with Putty" | json }}',
        },
        {
          key: "GAME_SUBTITLE",
          value: '{{ section.settings.game_subtitle | default: "Enter your email and win prizes!" | json }}',
        },
        {
          key: "EMAIL_PLACEHOLDER",
          value: '{{ section.settings.email_placeholder | default: "you@domain.com" | json }}',
        },
        {
          key: "SUBMIT_BUTTON_TEXT",
          value: '{{ section.settings.submit_button_text | default: "Let\'s Putt!" | json }}',
        },
        {
          key: "AIM_BANNER_TEXT",
          value:
            '{{ section.settings.aim_banner_text | default: "Watch the power meter and click PUTT when ready!" | json }}',
        },
        {
          key: "MARKETING_URL",
          value: "{{ section.settings.marketing_url | json }}",
        },
        {
          key: "PUTTY_IMAGE_URL",
          value: "{{ section.settings.putty_image | image_url | json }}",
        },
        {
          key: "PRIZE_1_NAME",
          value: '{{ section.settings.prize_1_name | default: "Hole in One!" | json }}',
        },
        {
          key: "PRIZE_1_CODE",
          value: '{{ section.settings.prize_1_code | default: "HOLEINONE" | json }}',
        },
        {
          key: "PRIZE_1_DESC",
          value: '{{ section.settings.prize_1_desc | default: "Free Round" | json }}',
        },
        {
          key: "PRIZE_2_NAME",
          value: '{{ section.settings.prize_2_name | default: "Eagle!" | json }}',
        },
        {
          key: "PRIZE_2_CODE",
          value: '{{ section.settings.prize_2_code | default: "EAGLE2023" | json }}',
        },
        {
          key: "PRIZE_2_DESC",
          value: '{{ section.settings.prize_2_desc | default: "Free Appetizer" | json }}',
        },
        {
          key: "PRIZE_3_NAME",
          value: '{{ section.settings.prize_3_name | default: "Birdie!" | json }}',
        },
        {
          key: "PRIZE_3_CODE",
          value: '{{ section.settings.prize_3_code | default: "BIRDIE10" | json }}',
        },
        {
          key: "PRIZE_3_DESC",
          value: '{{ section.settings.prize_3_desc | default: "10% Off Your Order" | json }}',
        },
        {
          key: "PRIZE_4_NAME",
          value: '{{ section.settings.prize_4_name | default: "Par" | json }}',
        },
        {
          key: "PRIZE_4_CODE",
          value: '{{ section.settings.prize_4_code | default: "PAR5OFF" | json }}',
        },
        {
          key: "PRIZE_4_DESC",
          value: '{{ section.settings.prize_4_desc | default: "5% Off Your Order" | json }}',
        },
        {
          key: "PRIZE_5_NAME",
          value: '{{ section.settings.prize_5_name | default: "Bogey" | json }}',
        },
        {
          key: "PRIZE_5_CODE",
          value: '{{ section.settings.prize_5_code | default: "BOGEY2" | json }}',
        },
        {
          key: "PRIZE_5_DESC",
          value: '{{ section.settings.prize_5_desc | default: "$2 Off Your Order" | json }}',
        },
      ];

      constReplacements.forEach(({ key, value }) => {
        // Replace only the const declaration's assigned value (single or double quoted)
        const regex = new RegExp(`const\\s+${key}\\s*=\\s*['\"]([\\s\\S]*?)['\"];`);
        jsContent = jsContent.replace(regex, `const ${key} = ${value};`);
      });

      // Replace prize placeholders with Liquid template variables
      jsContent = jsContent.replace(
        /{ name: "PRIZE_1_NAME", code: "PRIZE_1_CODE", desc: "PRIZE_1_DESC" }/g,
        `{ name: "{{ section.settings.prize_1_name | default: 'Hole in One!' }}", code: "{{ section.settings.prize_1_code | default: 'HOLEINONE' }}", desc: "{{ section.settings.prize_1_desc | default: 'Free Round' }}" }`,
      );
      jsContent = jsContent.replace(
        /{ name: "PRIZE_2_NAME", code: "PRIZE_2_CODE", desc: "PRIZE_2_DESC" }/g,
        `{ name: "{{ section.settings.prize_2_name | default: 'Eagle!' }}", code: "{{ section.settings.prize_2_code | default: 'EAGLE2023' }}", desc: "{{ section.settings.prize_2_desc | default: 'Free Appetizer' }}" }`,
      );
      jsContent = jsContent.replace(
        /{ name: "PRIZE_3_NAME", code: "PRIZE_3_CODE", desc: "PRIZE_3_DESC" }/g,
        `{ name: "{{ section.settings.prize_3_name | default: 'Birdie!' }}", code: "{{ section.settings.prize_3_code | default: 'BIRDIE10' }}", desc: "{{ section.settings.prize_3_desc | default: '10% Off Your Order' }}" }`,
      );
      jsContent = jsContent.replace(
        /{ name: "PRIZE_4_NAME", code: "PRIZE_4_CODE", desc: "PRIZE_4_DESC" }/g,
        `{ name: "{{ section.settings.prize_4_name | default: 'Par' }}", code: "{{ section.settings.prize_4_code | default: 'PAR5OFF' }}", desc: "{{ section.settings.prize_4_desc | default: '5% Off Your Order' }}" }`,
      );
      jsContent = jsContent.replace(
        /{ name: "PRIZE_5_NAME", code: "PRIZE_5_CODE", desc: "PRIZE_5_DESC" }/g,
        `{ name: "{{ section.settings.prize_5_name | default: 'Bogey' }}", code: "{{ section.settings.prize_5_code | default: 'BOGEY2' }}", desc: "{{ section.settings.prize_5_desc | default: '$2 Off Your Order' }}" }`,
      );

      // Add section ID namespacing for Shopify
      const sectionId = "{{ section.id }}";

      // Namespace all DOM element IDs
      jsContent = jsContent.replace(/getElementById\("([^"]+)"\)/g, `getElementById("$1-${sectionId}")`);

      liquidContent += `

<script>
  (function() {
    const sectionId = "${sectionId}";
    
${jsContent}
  })();
</script>
`;
    }

    // Add the Liquid schema
    console.log("Adding Liquid schema...");
    liquidContent += `
{% schema %}
{
  "name": "Mini Golf Game",
  "tag": "section",
  "class": "mini-golf-section",
  "settings": [
    {
      "type": "header",
      "content": "Game Content"
    },
    {
      "type": "text",
      "id": "aim_banner_text",
      "label": "Aim Banner Text",
      "default": "Watch the power meter and click PUTT when ready!"
    },
    {
      "type": "text",
      "id": "game_title",
      "label": "Game Title",
      "default": "Mini Golf with Putty"
    },
    {
      "type": "text",
      "id": "game_subtitle",
      "label": "Game Subtitle",
      "default": "Enter your email and win prizes!"
    },
    {
      "type": "text",
      "id": "email_placeholder",
      "label": "Email Placeholder",
      "default": "you@domain.com"
    },
    {
      "type": "text",
      "id": "submit_button_text",
      "label": "Submit Button Text",
      "default": "Let's Putt!"
    },
    {
      "type": "header",
      "content": "Marketing Integration"
    },
    {
      "type": "text",
      "id": "marketing_url",
      "label": "Marketing URL",
      "info": "URL to submit email addresses to (e.g., Klaviyo, Mailchimp, etc.)"
    },
    {
      "type": "header",
      "content": "Layout & Design"
    },
    {
      "type": "select",
      "id": "content_width",
      "label": "Section Width",
      "options": [
        {
          "value": "content-center-aligned",
          "label": "Page Width"
        },
        {
          "value": "content-full-width",
          "label": "Full Width"
        }
      ],
      "default": "content-center-aligned"
    },
    {
      "type": "color_scheme",
      "id": "color_scheme",
      "label": "Color Scheme",
      "default": "scheme-1"
    },
    {
      "type": "range",
      "id": "padding-block-start",
      "label": "Top Padding",
      "min": 0,
      "max": 100,
      "step": 4,
      "unit": "px",
      "default": 36
    },
    {
      "type": "range",
      "id": "padding-block-end",
      "label": "Bottom Padding",
      "min": 0,
      "max": 100,
      "step": 4,
      "unit": "px",
      "default": 36
    },
    {
      "type": "header",
      "content": "Game Assets"
    },
    {
      "type": "image_picker",
      "id": "putty_image",
      "label": "Putty Character Image",
      "info": "Upload a custom image for the Putty character (recommended: square image, 60-90px)"
    },
    {
      "type": "header",
      "content": "Prize 1 (1 Shot - Hole in One)"
    },
    {
      "type": "text",
      "id": "prize_1_name",
      "label": "Prize 1 Name",
      "default": "Hole in One!"
    },
    {
      "type": "text",
      "id": "prize_1_code",
      "label": "Prize 1 Code",
      "default": "HOLEINONE"
    },
    {
      "type": "text",
      "id": "prize_1_desc",
      "label": "Prize 1 Description",
      "default": "Free Round"
    },
    {
      "type": "header",
      "content": "Prize 2 (2 Shots - Eagle)"
    },
    {
      "type": "text",
      "id": "prize_2_name",
      "label": "Prize 2 Name",
      "default": "Eagle!"
    },
    {
      "type": "text",
      "id": "prize_2_code",
      "label": "Prize 2 Code",
      "default": "EAGLE2023"
    },
    {
      "type": "text",
      "id": "prize_2_desc",
      "label": "Prize 2 Description",
      "default": "Free Appetizer"
    },
    {
      "type": "header",
      "content": "Prize 3 (3 Shots - Birdie)"
    },
    {
      "type": "text",
      "id": "prize_3_name",
      "label": "Prize 3 Name",
      "default": "Birdie!"
    },
    {
      "type": "text",
      "id": "prize_3_code",
      "label": "Prize 3 Code",
      "default": "BIRDIE10"
    },
    {
      "type": "text",
      "id": "prize_3_desc",
      "label": "Prize 3 Description",
      "default": "10% Off Your Order"
    },
    {
      "type": "header",
      "content": "Prize 4 (4 Shots - Par)"
    },
    {
      "type": "text",
      "id": "prize_4_name",
      "label": "Prize 4 Name",
      "default": "Par"
    },
    {
      "type": "text",
      "id": "prize_4_code",
      "label": "Prize 4 Code",
      "default": "PAR5OFF"
    },
    {
      "type": "text",
      "id": "prize_4_desc",
      "label": "Prize 4 Description",
      "default": "5% Off Your Order"
    },
    {
      "type": "header",
      "content": "Prize 5 (5+ Shots - Bogey)"
    },
    {
      "type": "text",
      "id": "prize_5_name",
      "label": "Prize 5 Name",
      "default": "Bogey"
    },
    {
      "type": "text",
      "id": "prize_5_code",
      "label": "Prize 5 Code",
      "default": "BOGEY2"
    },
    {
      "type": "text",
      "id": "prize_5_desc",
      "label": "Prize 5 Description",
      "default": "$2 Off Your Order"
    }
  ],
  "presets": [
    {
      "name": "Mini Golf Game"
    }
  ]
}
{% endschema %}`;

    // Write the Liquid file
    console.log("Writing Liquid file...");
    fs.writeFileSync(LIQUID_OUTPUT, liquidContent, "utf8");

    console.log("✅ Successfully converted HTML to Liquid!");
    console.log(`📄 Input: ${HTML_FILE}`);
    console.log(`📄 Output: ${LIQUID_OUTPUT}`);
  } catch (error) {
    console.error("❌ Error converting HTML to Liquid:", error.message);
    process.exit(1);
  }
}

// Run the conversion if this script is executed directly
if (require.main === module) {
  convertHtmlToLiquid();
}

module.exports = { convertHtmlToLiquid };
