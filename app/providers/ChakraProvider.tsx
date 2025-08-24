'use client';

import { ChakraProvider } from "@chakra-ui/react";

import { cresolSystem } from "@/app/styles/chakra-theme";

/**
 * ChakraUIProvider function
 * @todo Add proper documentation
 */
export function ChakraUIProvider({ children }: { children: React.ReactNode }) {
  return (
    <ChakraProvider value={cresolSystem}>
      {children}
    </ChakraProvider>
  );
}