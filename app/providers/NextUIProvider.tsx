'use client';

import { NextUIProvider } from '@nextui-org/react';

/**
 * NextUIProviderWrapper function
 * @todo Add proper documentation
 */
export function NextUIProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <NextUIProvider>{children}</NextUIProvider>;
}