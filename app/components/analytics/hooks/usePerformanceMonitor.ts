'use client';

import { useEffect, useRef, useCallback } from 'react';

import { logger } from '../../../../lib/production-logger';
interface PerformanceMetrics {
  renderTime: number;
  componentMounts: number;
  reRenders: number;
  lastRenderTime: number;
}

interface UsePerformanceMonitorOptions {
  enabled?: boolean;
  logThreshold?: number; // ms
  trackRenderTime?: boolean;
  trackReRenders?: boolean;
}

export function usePerformanceMonitor(
  componentName: string,
  options: UsePerformanceMonitorOptions = {}
) {
  const {
    enabled = process.env.NODE_ENV === 'development',
    logThreshold = 16, // 16ms = 60fps
    trackRenderTime = true,
    trackReRenders = true
  } = options;

  const metricsRef = useRef<PerformanceMetrics>({
    renderTime: 0,
    componentMounts: 0,
    reRenders: 0,
    lastRenderTime: 0
  });

  const renderStartRef = useRef<number>(0);
  const renderCountRef = useRef<number>(0);

  // Start render timing
  const startRenderTimer = useCallback(() => {
    if (!enabled || !trackRenderTime) return;
    renderStartRef.current = performance.now();
  }, [enabled, trackRenderTime]);

  // End render timing and log if necessary
  const endRenderTimer = useCallback(() => {
    if (!enabled || !trackRenderTime || renderStartRef.current === 0) return;

    const renderTime = performance.now() - renderStartRef.current;
    const metrics = metricsRef.current;
    
    metrics.renderTime += renderTime;
    metrics.lastRenderTime = renderTime;
    metrics.reRenders = renderCountRef.current;

    // Log slow renders
    if (renderTime > logThreshold) {
      console.warn(
        `Slow render detected in ${componentName}:`,
        `${renderTime.toFixed(2)}ms`,
        `(${renderCountRef.current} renders)`
      );
    }

    renderStartRef.current = 0;
  }, [enabled, trackRenderTime, logThreshold, componentName]);

  // Track component lifecycle
  useEffect(() => {
    if (!enabled) return;

    const metrics = metricsRef.current;
    
    // First mount
    if (renderCountRef.current === 0) {
      metrics.componentMounts++;
    }
    
    renderCountRef.current++;
    
    // Start render timer
    startRenderTimer();

    // Cleanup function runs after render
    return () => {
      endRenderTimer();
    };
  });

  // Performance measurement utilities
  const measurePerformance = useCallback(<T>(
    operation: () => T,
    operationName: string
  ): T => {
    if (!enabled) return operation();

    const start = performance.now();
    const result = operation();
    const duration = performance.now() - start;

    if (duration > logThreshold) {
      console.warn(
        `Slow operation in ${componentName}.${operationName}:`,
        `${duration.toFixed(2)}ms`
      );
    }

    return result;
  }, [enabled, logThreshold, componentName]);

  const measureAsync = useCallback(async <T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> => {
    if (!enabled) return operation();

    const start = performance.now();
    const result = await operation();
    const duration = performance.now() - start;

    if (duration > logThreshold) {
      console.warn(
        `Slow async operation in ${componentName}.${operationName}:`,
        `${duration.toFixed(2)}ms`
      );
    }

    return result;
  }, [enabled, logThreshold, componentName]);

  // Get current metrics
  const getMetrics = useCallback((): PerformanceMetrics => {
    return { ...metricsRef.current };
  }, []);

  // Reset metrics
  const resetMetrics = useCallback(() => {
    metricsRef.current = {
      renderTime: 0,
      componentMounts: 0,
      reRenders: 0,
      lastRenderTime: 0
    };
    renderCountRef.current = 0;
  }, []);

  return {
    startRenderTimer,
    endRenderTimer,
    measurePerformance,
    measureAsync,
    getMetrics,
    resetMetrics
  };
}

// Hook for bundle size monitoring
export function useBundleMonitor(componentName: string) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Estimate component bundle impact
      const estimate = document.querySelectorAll(`[data-component="${componentName}"]`).length;
      
      if (estimate > 10) {
        console.info(
          `Bundle impact warning for ${componentName}:`,
          `${estimate} instances detected`
        );
      }
    }
  }, [componentName]);
}

// Hook for memory leak detection
export function useMemoryLeakDetection(componentName: string) {
  const instanceCountRef = useRef(0);

  useEffect(() => {
    instanceCountRef.current++;
    
    if (process.env.NODE_ENV === 'development') {
      // Warn about potential memory leaks
      if (instanceCountRef.current > 50) {
        logger.warn(
          `Potential memory leak in ${componentName}:`,
          `${instanceCountRef.current} instances created`
        );
      }
    }

    return () => {
      const currentInstanceCount = instanceCountRef.current;
      instanceCountRef.current = currentInstanceCount - 1;
    };
  }, [componentName]);
}

export default usePerformanceMonitor;