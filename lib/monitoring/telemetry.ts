/**
 * TELEMETRY SYSTEM - Success Metrics & Monitoring
 * Coleta dados de performance, uso e business metrics
 */

export interface VideoUploadMetrics {
  // Performance Metrics
  uploadStartTime: number;
  uploadEndTime: number;
  fileSize: number;
  uploadSpeed: number;
  resumeCount: number;
  
  // Success Metrics
  success: boolean;
  errorType?: 'network' | 'server' | 'client' | 'validation';
  errorMessage?: string;
  
  // User Context
  userId: string;
  userRole: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browserType: string;
  
  // Content Metrics
  videoFormat: string;
  videoDuration?: number;
  compressionRatio?: number;
  category: string;
}

export interface SystemPerformanceMetrics {
  // API Performance
  endpoint: string;
  responseTime: number;
  statusCode: number;
  timestamp: number;
  
  // Resource Usage
  storageUsed: number;
  bandwidthUsed: number;
  activeUploads: number;
  queueLength: number;
  
  // Business Context
  feature: string;
  operation: string;
}

export interface UserExperienceMetrics {
  // Usability
  taskType: string;
  completionTime: number;
  successful: boolean;
  errorCount: number;
  helpAccessed: boolean;
  
  // Satisfaction (coletado via surveys)
  satisfactionScore?: number; // 1-10
  recommendationScore?: number; // NPS style
  feedback?: string;
  
  // Context
  sessionId: string;
  timestamp: number;
}

export class TelemetryCollector {
  private static instance: TelemetryCollector;
  private metrics: Array<VideoUploadMetrics | SystemPerformanceMetrics | UserExperienceMetrics> = [];
  private batchSize = 50;
  private flushInterval = 30000; // 30 seconds
  
  private constructor() {
    this.startPeriodicFlush();
  }
  
  public static getInstance(): TelemetryCollector {
    if (!TelemetryCollector.instance) {
      TelemetryCollector.instance = new TelemetryCollector();
    }
    return TelemetryCollector.instance;
  }
  
  // Video Upload Metrics
  public trackVideoUpload(metrics: VideoUploadMetrics): void {
    const enrichedMetrics = {
      ...metrics,
      timestamp: Date.now(),
      sessionId: this.getSessionId(),
    };
    
    this.metrics.push(enrichedMetrics);
    this.maybeFlush();
  }
  
  // System Performance Metrics
  public trackPerformance(metrics: SystemPerformanceMetrics): void {
    const enrichedMetrics = {
      ...metrics,
      timestamp: Date.now(),
    };
    
    this.metrics.push(enrichedMetrics);
    this.maybeFlush();
  }
  
  // User Experience Metrics
  public trackUserExperience(metrics: UserExperienceMetrics): void {
    const enrichedMetrics = {
      ...metrics,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
    };
    
    this.metrics.push(enrichedMetrics);
    this.maybeFlush();
  }
  
  // Business KPIs Tracking
  public trackBusinessMetric(metric: string, value: number, context: Record<string, any> = {}): void {
    const businessMetric = {
      type: 'business_kpi',
      metric,
      value,
      context,
      timestamp: Date.now(),
    };
    
    this.metrics.push(businessMetric);
    this.maybeFlush();
  }
  
  private maybeFlush(): void {
    if (this.metrics.length >= this.batchSize) {
      this.flush();
    }
  }
  
  private startPeriodicFlush(): void {
    setInterval(() => {
      if (this.metrics.length > 0) {
        this.flush();
      }
    }, this.flushInterval);
  }
  
  private async flush(): void {
    if (this.metrics.length === 0) return;
    
    const batch = [...this.metrics];
    this.metrics = [];
    
    try {
      await fetch('/api/monitoring/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metrics: batch }),
      });
    } catch (error) {
      console.error('Failed to send metrics:', error);
      // Re-add to queue for retry
      this.metrics.unshift(...batch.slice(0, 10)); // Keep only 10 for retry
    }
  }
  
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('telemetry_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('telemetry_session_id', sessionId);
    }
    return sessionId;
  }
}

// Convenience functions for common tracking scenarios
export const telemetry = TelemetryCollector.getInstance();

export const trackVideoUploadStart = (fileSize: number, format: string) => {
  return {
    startTime: Date.now(),
    trackSuccess: (compressionRatio?: number) => {
      telemetry.trackVideoUpload({
        uploadStartTime: Date.now(),
        uploadEndTime: Date.now(),
        fileSize,
        uploadSpeed: fileSize / ((Date.now() - Date.now()) / 1000),
        resumeCount: 0,
        success: true,
        userId: 'current_user', // Will be replaced with actual user context
        userRole: 'admin',
        deviceType: 'desktop',
        browserType: navigator.userAgent,
        videoFormat: format,
        compressionRatio,
        category: 'direct_upload',
      });
    },
    trackFailure: (errorType: string, errorMessage: string) => {
      telemetry.trackVideoUpload({
        uploadStartTime: Date.now(),
        uploadEndTime: Date.now(),
        fileSize,
        uploadSpeed: 0,
        resumeCount: 0,
        success: false,
        errorType: errorType as any,
        errorMessage,
        userId: 'current_user',
        userRole: 'admin',
        deviceType: 'desktop',
        browserType: navigator.userAgent,
        videoFormat: format,
        category: 'direct_upload',
      });
    }
  };
};

export const trackAPICall = (endpoint: string, startTime: number) => {
  return {
    recordResponse: (statusCode: number) => {
      telemetry.trackPerformance({
        endpoint,
        responseTime: Date.now() - startTime,
        statusCode,
        timestamp: Date.now(),
        storageUsed: 0, // Will be enriched server-side
        bandwidthUsed: 0, // Will be enriched server-side
        activeUploads: 0, // Will be enriched server-side
        queueLength: 0, // Will be enriched server-side
        feature: 'video_management',
        operation: endpoint.split('/').pop() || 'unknown',
      });
    }
  };
};

export const trackUserTask = (taskType: string) => {
  const startTime = Date.now();
  return {
    complete: (successful: boolean, errorCount: number = 0) => {
      telemetry.trackUserExperience({
        taskType,
        completionTime: Date.now() - startTime,
        successful,
        errorCount,
        helpAccessed: false, // Can be enhanced to track help usage
        sessionId: telemetry['getSessionId'](),
        timestamp: Date.now(),
      });
    }
  };
};