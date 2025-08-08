'use client';

import { ChakraProvider, createSystem, defaultConfig } from "@chakra-ui/react";

// Create a custom theme that aligns with Cresol colors
const system = createSystem(defaultConfig, {
  theme: {
    tokens: {
      colors: {
        cresolOrange: { value: '#F58220' },
        cresolGray: { value: '#727176' },
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