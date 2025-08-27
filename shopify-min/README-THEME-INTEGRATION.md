# Shopify Theme Integration

## Overview

The mini-golf game section has been updated to integrate seamlessly with your Shopify theme's design system and layout structure.

## Theme Integration Features

### 🎨 **Design System Integration**

- **Section Background**: Uses theme's color scheme system
- **Grid Layout**: Integrates with theme's CSS Grid and subgrid structure
- **Responsive Design**: Follows theme's breakpoint system (750px mobile/desktop)
- **Spacing**: Uses theme's spacing variables and padding controls

### 📱 **Layout Options**

- **Page Width**: Centers content within theme's page width constraints
- **Full Width**: Expands to use full viewport width
- **Mobile Responsive**: Automatically adjusts for mobile devices
- **Theme Variables**: Leverages existing CSS custom properties

### 🎯 **Section Structure**

```liquid
{% liquid
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
  <div class="mini-golf-container">
    <!-- Game content here -->
  </div>
</div>
```

## Customizable Settings

### Layout & Design

- **Section Width**: Choose between Page Width or Full Width
- **Color Scheme**: Select from theme's color schemes
- **Top Padding**: Adjust spacing above the section (0-100px)
- **Bottom Padding**: Adjust spacing below the section (0-100px)

### CSS Integration

The section includes responsive CSS that:

- Uses CSS Grid with `subgrid` for seamless theme integration
- Automatically adjusts column positioning based on width setting
- Respects theme's padding variables (`--padding-lg`, `--padding-md`)
- Prevents CSS conflicts by scoping game styles within `.mini-golf-container`

### Mobile Responsiveness

```css
/* Desktop (750px+) */
.mini-golf-container {
  grid-column: 2; /* Uses theme's central column */
}

/* Mobile (<750px) */
@media screen and (width < 750px) {
  .mini-golf-container {
    grid-column: 1 / -1; /* Full width on mobile */
    padding: 0 var(--padding-md, 16px);
  }
}
```

## Installation

1. Upload `mini-golf-game.liquid` to your theme's `sections/` directory
2. Add the section to any page through the theme editor
3. Configure layout, colors, and game settings through the section settings
4. Upload a putty character image through the section settings

## Theme Compatibility

This section is designed to work with modern Shopify themes that use:

- CSS Grid layout system
- Color scheme functionality
- Spacing/padding controls
- Asset management via theme editor

The integration ensures the game appears native to your theme while maintaining its interactive functionality.
