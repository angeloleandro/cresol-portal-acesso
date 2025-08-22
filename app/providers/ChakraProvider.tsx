'use client';

import { ChakraProvider } from "@chakra-ui/react";
import { cresolSystem } from "@/app/styles/chakra-theme";

/**
 * ChakraUIProvider - Provider customizado para Chakra UI v3
 * 
 * Utiliza o sistema de design Cresol com tema completo:
 * - Cores da marca Cresol (laranja #F58220, cinzas, verde)
 * - Tamanhos padronizados (xs, sm, md, lg)
 * - Variantes (outline, subtle)
 * - Estados (hover, focus, invalid, disabled)
 * - Design tokens centralizados
 * - Recipes customizados para Select
 */
export function ChakraUIProvider({ children }: { children: React.ReactNode }) {
  return (
    <ChakraProvider value={cresolSystem}>
      {children}
    </ChakraProvider>
  );
}