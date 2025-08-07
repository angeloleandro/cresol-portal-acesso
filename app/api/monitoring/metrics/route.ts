import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * API ENDPOINT - Metrics Collection
 * Recebe e armazena métricas de telemetria do sistema
 */

interface MetricsBatch {
  metrics: Array<{
    type?: string;
    timestamp: number;
    [key: string]: any;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: MetricsBatch = await request.json();
    
    if (!body.metrics || !Array.isArray(body.metrics)) {
      return NextResponse.json({ error: 'Invalid metrics format' }, { status: 400 });
    }

    // Process each metric type differently
    const processedMetrics = await Promise.allSettled(
      body.metrics.map(async (metric) => {
        const baseMetric = {
          ...metric,
          user_id: user.id,
          created_at: new Date(metric.timestamp).toISOString(),
        };

        // Store in appropriate table based on metric type
        if (metric.type === 'business_kpi') {
          return supabase
            .from('business_metrics')
            .insert({
              metric_name: metric.metric,
              metric_value: metric.value,
              context: metric.context || {},
              ...baseMetric,
            });
        } else if (metric.uploadStartTime !== undefined) {
          // Video upload metric
          return supabase
            .from('video_upload_metrics')
            .insert({
              upload_duration: metric.uploadEndTime - metric.uploadStartTime,
              file_size: metric.fileSize,
              upload_speed: metric.uploadSpeed,
              resume_count: metric.resumeCount,
              success: metric.success,
              error_type: metric.errorType,
              error_message: metric.errorMessage,
              video_format: metric.videoFormat,
              video_duration: metric.videoDuration,
              compression_ratio: metric.compressionRatio,
              category: metric.category,
              device_type: metric.deviceType,
              browser_type: metric.browserType,
              ...baseMetric,
            });
        } else if (metric.endpoint !== undefined) {
          // System performance metric
          return supabase
            .from('system_performance_metrics')
            .insert({
              endpoint: metric.endpoint,
              response_time: metric.responseTime,
              status_code: metric.statusCode,
              storage_used: metric.storageUsed,
              bandwidth_used: metric.bandwidthUsed,
              active_uploads: metric.activeUploads,
              queue_length: metric.queueLength,
              feature: metric.feature,
              operation: metric.operation,
              ...baseMetric,
            });
        } else if (metric.taskType !== undefined) {
          // User experience metric
          return supabase
            .from('user_experience_metrics')
            .insert({
              task_type: metric.taskType,
              completion_time: metric.completionTime,
              successful: metric.successful,
              error_count: metric.errorCount,
              help_accessed: metric.helpAccessed,
              satisfaction_score: metric.satisfactionScore,
              recommendation_score: metric.recommendationScore,
              feedback: metric.feedback,
              session_id: metric.sessionId,
              user_agent: metric.userAgent,
              viewport: metric.viewport,
              ...baseMetric,
            });
        } else {
          // Generic metric
          return supabase
            .from('generic_metrics')
            .insert({
              metric_data: metric,
              ...baseMetric,
            });
        }
      })
    );

    // Count successes and failures
    const results = processedMetrics.map((result, index) => ({
      index,
      status: result.status,
      error: result.status === 'rejected' ? result.reason : null,
    }));

    const successCount = results.filter(r => r.status === 'fulfilled').length;
    const failureCount = results.filter(r => r.status === 'rejected').length;

    return NextResponse.json({
      success: true,
      processed: successCount,
      failed: failureCount,
      total: body.metrics.length,
      errors: results.filter(r => r.status === 'rejected').map(r => r.error),
    });

  } catch (error) {
    console.error('Error processing metrics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Health check endpoint for monitoring system itself
export async function GET() {
  try {
    const supabase = createClient();
    
    // Simple connectivity test
    const { data, error } = await supabase
      .from('system_performance_metrics')
      .select('id')
      .limit(1);

    if (error) throw error;

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
    });

  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}