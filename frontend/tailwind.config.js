// Tailwind theme configuration — generated from DESIGN.md
// This must load BEFORE the Tailwind CDN script processes the page,
// which is why it's included right after the Tailwind <script> tag in index.html.
tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "outline-variant": "#bbcabf",
        "secondary-container": "#dae2fd",
        "primary-fixed": "#6ffbbe",
        "surface-variant": "#d3e4fe",
        "on-tertiary-fixed": "#001a42",
        "surface-container-low": "#eff4ff",
        "tertiary-fixed": "#d8e2ff",
        "primary-fixed-dim": "#4edea3",
        "on-primary": "#ffffff",
        "secondary-fixed": "#dae2fd",
        "on-secondary-fixed-variant": "#3f465c",
        "on-background": "#0b1c30",
        "tertiary-container": "#71a1ff",
        "surface": "#f8f9ff",
        "primary-container": "#10b981",
        "primary": "#006c49",
        "surface-container": "#e5eeff",
        "on-error-container": "#93000a",
        "on-tertiary-container": "#00367a",
        "tertiary": "#005ac2",
        "on-tertiary-fixed-variant": "#004395",
        "surface-tint": "#006c49",
        "on-primary-fixed": "#002113",
        "error-container": "#ffdad6",
        "secondary-fixed-dim": "#bec6e0",
        "surface-container-high": "#dce9ff",
        "on-surface-variant": "#3c4a42",
        "inverse-on-surface": "#eaf1ff",
        "outline": "#6c7a71",
        "on-surface": "#0b1c30",
        "error": "#ba1a1a",
        "inverse-primary": "#4edea3",
        "on-primary-container": "#00422b",
        "on-primary-fixed-variant": "#005236",
        "surface-dim": "#cbdbf5",
        "surface-container-lowest": "#ffffff",
        "on-secondary": "#ffffff",
        "tertiary-fixed-dim": "#adc6ff",
        "secondary": "#565e74",
        "on-secondary-container": "#5c647a",
        "on-tertiary": "#ffffff",
        "on-error": "#ffffff",
        "surface-container-highest": "#d3e4fe",
        "background": "#f8f9ff",
        "inverse-surface": "#213145",
        "surface-bright": "#f8f9ff",
        "on-secondary-fixed": "#131b2e"
      },
      borderRadius: {
        DEFAULT: "0.125rem",
        lg: "0.25rem",
        xl: "0.5rem",
        full: "0.75rem"
      },
      spacing: {
        "container-max-width": "1280px",
        "stack-md": "24px",
        "stack-sm": "12px",
        "margin-mobile": "16px",
        base: "8px",
        "stack-lg": "48px",
        gutter: "24px",
        "margin-desktop": "40px"
      },
      fontFamily: {
        "label-sm": ["Hanken Grotesk"],
        "headline-lg-mobile": ["\"Source Serif 4\""],
        "body-md": ["Hanken Grotesk"],
        "body-lg": ["Hanken Grotesk"],
        "headline-md": ["\"Source Serif 4\""],
        "headline-lg": ["\"Source Serif 4\""],
        "display-lg": ["\"Source Serif 4\""],
        "title-lg": ["\"Source Serif 4\""]
      },
      fontSize: {
        "label-sm": ["12px", { lineHeight: "16px", letterSpacing: "0.05em", fontWeight: "600" }],
        "headline-lg-mobile": ["32px", { lineHeight: "40px", letterSpacing: "-0.01em", fontWeight: "700" }],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }],
        "headline-md": ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "headline-lg": ["40px", { lineHeight: "48px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "display-lg": ["48px", { lineHeight: "56px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "title-lg": ["20px", { lineHeight: "28px", fontWeight: "600" }]
      }
    }
  }
};
