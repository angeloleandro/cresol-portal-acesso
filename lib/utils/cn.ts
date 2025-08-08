/**
 * Utility for combining CSS classes
 * Based on clsx with conditional class application
 */

import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs)
}