'use client';

import { ChakraProvider, createSystem, defaultConfig } from "@chakra-ui/react";
import { CRESOL_COLORS } from "@/lib/design-tokens";

// Create a custom theme that aligns with Cresol colors using centralized design tokens
const system = createSystem(defaultConfig, {
  theme: {
    tokens: {
      colors: {
        cresolOrange: { value: CRESOL_COLORS.primary.DEFAULT },
        cresolGray: { value: CRESOL_COLORS.gray.DEFAULT },
        cresolSecondary: { value: CRESOL_COLORS.secondary.DEFAULT },
        cresolSuccess: { value: CRESOL_COLORS.success.DEFAULT },
        cresolWarning: { value: CRESOL_COLORS.warning.DEFAULT },
        cresolError: { value: CRESOL_COLORS.error.DEFAULT },
      }
    }
  }
});

export function ChakraUIProvider({ children }: { children: React.ReactNode }) {
  return (
    <ChakraProvider value={system}>
      {children}
    </ChakraProvider>
  );
}