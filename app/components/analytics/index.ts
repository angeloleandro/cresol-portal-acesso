// Export all analytics components for centralized imports
export { default as NumberTicker } from './NumberTicker';
export { default as MetricCardEnterprise } from './MetricCardEnterprise';
export { default as ChartComponentAdvanced } from './ChartComponentAdvanced';  
export { default as ProgressRingPro } from './ProgressRingPro';
export { default as ShimmerButton } from './ShimmerButton';

// Enhanced Pro Components (Enterprise Level)
export { default as MetricCardEnterprisePro } from './MetricCardEnterprisePro';
export { default as ChartContainerPro } from './ChartContainerPro';
export { default as NavigationControlsPro } from './NavigationControlsPro';
export { default as DashboardGridAdvanced } from './DashboardGridAdvanced';
export { default as AnalyticsShowcase } from './AnalyticsShowcase';

// WCAG 2.1 AA Accessible Components with HeadlessUI
export { default as AccessibleMetricCard } from './AccessibleMetricCard';
export { default as AccessibleNavigation } from './AccessibleNavigation';
export { default as AccessibleChartContainer } from './AccessibleChartContainer';
export { default as AccessibleModal } from './AccessibleModals';
export { default as AccessibilityShowcase } from './AccessibilityShowcase';

// Accessibility Hooks
export { useAccessibleFocus, useScreenReaderAnnouncement, useReducedMotion } from './hooks/useAccessibleFocus';

// Legacy exports for backward compatibility
export { default as AnimatedChart } from './AnimatedChart';
export { default as GridLayoutResponsivo } from './GridLayoutResponsivo';
export { default as ShimmerLoading } from './ShimmerLoading';
export { PageTitle, SectionTitle, MetricValue } from './TypographyEnterprise';

// Error Handling & Performance
export { AnalyticsErrorBoundary } from './ErrorBoundary';
export { withErrorBoundary } from './withErrorBoundary';

// Performance & Memory Management Hooks  
export { useMemoryManagement, useResourceCleanup } from './hooks/useMemoryManagement';
export { usePerformanceMonitor, useBundleMonitor, useMemoryLeakDetection } from './hooks/usePerformanceMonitor';