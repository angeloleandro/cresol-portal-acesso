/**
 * Utility for combining CSS classes
 * Based on clsx with tailwind-merge for optimal Tailwind CSS class merging
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}