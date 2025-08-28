import { createSystem, defaultConfig } from "@chakra-ui/react";

import { CRESOL_COLORS, CRESOL_SHADOWS, CRESOL_RADIUS } from "@/lib/design-tokens/design-tokens";


// Mapear design tokens Cresol para paleta Chakra UI v3 (com estrutura { value: string })
const cresolColors = {
  orange: {
    50: { value: CRESOL_COLORS.primary[50] },
    100: { value: CRESOL_COLORS.primary[100] },
    200: { value: CRESOL_COLORS.primary[200] },
    300: { value: CRESOL_COLORS.primary[300] },
    400: { value: CRESOL_COLORS.primary[400] },
    500: { value: CRESOL_COLORS.primary[500] }, // Primary Cresol Orange
    600: { value: CRESOL_COLORS.primary[600] },
    700: { value: CRESOL_COLORS.primary[700] },
    800: { value: CRESOL_COLORS.primary[800] },
    900: { value: CRESOL_COLORS.primary[900] },
    950: { value: "#431407" }, // Complementar
  },
  gray: {
    50: { value: CRESOL_COLORS.gray[50] },
    100: { value: CRESOL_COLORS.gray[100] },
    200: { value: CRESOL_COLORS.gray[200] },
    300: { value: CRESOL_COLORS.gray[300] },
    400: { value: CRESOL_COLORS.gray[400] },
    500: { value: CRESOL_COLORS.gray[500] }, // Cresol Gray
    600: { value: CRESOL_COLORS.gray[600] }, 
    700: { value: CRESOL_COLORS.gray[700] },
    800: { value: CRESOL_COLORS.gray[800] },
    900: { value: CRESOL_COLORS.gray[900] },
    950: { value: "#030712" }, // Complementar
  },
  green: {
    50: { value: CRESOL_COLORS.secondary[50] },
    100: { value: CRESOL_COLORS.secondary[100] }, 
    200: { value: CRESOL_COLORS.secondary[200] },
    300: { value: CRESOL_COLORS.secondary[300] },
    400: { value: CRESOL_COLORS.secondary[400] },
    500: { value: CRESOL_COLORS.secondary[500] },
    600: { value: CRESOL_COLORS.secondary[600] }, // Secondary Cresol Green
    700: { value: CRESOL_COLORS.secondary[700] }, // Secondary Dark
    800: { value: CRESOL_COLORS.secondary[800] },
    900: { value: CRESOL_COLORS.secondary[900] },
    950: { value: "#052e16" }, // Complementar
  },
  // Design tokens semânticos para hover states
  cresol: {
    cardHover: { value: "#A3A3A3" }, // Card hover unificado - cinza ainda mais claro
  }
};

// Customizar o sistema de design Chakra
export const cresolSystem = createSystem(defaultConfig, {
  theme: {
    tokens: {
      colors: cresolColors,
      fonts: {
        heading: { value: "'Inter', 'ui-sans-serif', 'system-ui', sans-serif" },
        body: { value: "'Inter', 'ui-sans-serif', 'system-ui', sans-serif" },
      },
      fontSizes: {
        xs: { value: "0.75rem" },
        sm: { value: "0.875rem" }, 
        md: { value: "1rem" },
        lg: { value: "1.125rem" },
        xl: { value: "1.25rem" },
      },
      radii: {
        none: { value: CRESOL_RADIUS.none },
        xs: { value: CRESOL_RADIUS.xs },
        sm: { value: CRESOL_RADIUS.sm },
        md: { value: CRESOL_RADIUS.md }, // Padrão Cresol 6px
        lg: { value: CRESOL_RADIUS.lg },
        xl: { value: CRESOL_RADIUS.xl },
        '2xl': { value: CRESOL_RADIUS['2xl'] },
        full: { value: CRESOL_RADIUS.full },
      },
      spacing: {
        1: { value: "0.25rem" },
        2: { value: "0.5rem" },
        3: { value: "0.75rem" },
        4: { value: "1rem" },
        5: { value: "1.25rem" },
        6: { value: "1.5rem" },
        8: { value: "2rem" },
        10: { value: "2.5rem" },
        12: { value: "3rem" },
      },
      shadows: {
        none: { value: CRESOL_SHADOWS.none },
        sm: { value: CRESOL_SHADOWS.sm },
        md: { value: CRESOL_SHADOWS.md },
        lg: { value: CRESOL_SHADOWS.lg },
        xl: { value: CRESOL_SHADOWS.xl },
        '2xl': { value: CRESOL_SHADOWS['2xl'] },
        inner: { value: CRESOL_SHADOWS.inner },
      }
    },
    semanticTokens: {
      colors: {
        // Primary colors (Cresol Orange)
        "colorPalette.50": { value: "{colors.orange.50}" },
        "colorPalette.100": { value: "{colors.orange.100}" },
        "colorPalette.200": { value: "{colors.orange.200}" },
        "colorPalette.300": { value: "{colors.orange.300}" },
        "colorPalette.400": { value: "{colors.orange.400}" },
        "colorPalette.500": { value: "{colors.orange.500}" },
        "colorPalette.600": { value: "{colors.orange.600}" },
        "colorPalette.700": { value: "{colors.orange.700}" },
        "colorPalette.800": { value: "{colors.orange.800}" },
        "colorPalette.900": { value: "{colors.orange.900}" },
        "colorPalette.950": { value: "{colors.orange.950}" },

        // Focus and interactive states
        "colorPalette.focusRing": { value: "{colors.orange.500}/20" },
        "colorPalette.muted": { value: "{colors.gray.500}" },
        "colorPalette.subtle": { value: "{colors.gray.100}" },
        
        // Border colors
        "border.default": { value: "{colors.gray.300}" },
        "border.muted": { value: "{colors.gray.200}" },
        "border.emphasized": { value: "{colors.orange.500}" },
        "border.error": { value: "#ef4444" },
        
        // Background colors
        "bg.default": { value: "white" },
        "bg.muted": { value: "{colors.gray.50}" },
        "bg.subtle": { value: "{colors.gray.100}" },
        "bg.emphasized": { value: "{colors.orange.50}" },
        "bg.error": { value: "#fef2f2" },
        
        // Text colors
        "fg.default": { value: "black" },
        "fg.muted": { value: "{colors.gray.500}" },
        "fg.subtle": { value: "{colors.gray.600}" },
        "fg.emphasized": { value: "{colors.orange.600}" },
        "fg.error": { value: "#dc2626" },
        
        // Interactive states
        "bg.hover": { value: "{colors.orange.50}" },
        "bg.pressed": { value: "{colors.orange.100}" },
        "fg.hover": { value: "{colors.orange.700}" },
        "fg.pressed": { value: "{colors.orange.800}" },
      }
    },
    // Layer Styles para componentes padronizados
    layerStyles: {
      // Sistema unificado de cards Cresol
      "cresol.card": {
        value: {
          bg: "white",
          border: "1px solid",
          borderColor: "{colors.gray.300}",
          borderRadius: "md",
          padding: "4",
          shadow: "sm",
          transition: "all 0.2s",
        }
      },
      "cresol.cardHover": {
        value: {
          bg: "white",
          border: "1px solid",
          borderColor: "{colors.gray.300}",
          borderRadius: "md",
          padding: "4",
          shadow: "sm",
          transition: "all 0.2s",
          _hover: {
            borderColor: "{colors.cresol.cardHover}",
            shadow: "md",
            transform: "translateY(-1px)"
          }
        }
      },
      "cresol.cardClickable": {
        value: {
          bg: "white",
          border: "1px solid",
          borderColor: "{colors.gray.300}",
          borderRadius: "md",
          padding: "4",
          shadow: "sm",
          transition: "all 0.2s",
          cursor: "pointer",
          _hover: {
            borderColor: "{colors.cresol.cardHover}",
            shadow: "md",
            transform: "translateY(-1px)"
          }
        }
      }
    }
  },
});

export default cresolSystem;