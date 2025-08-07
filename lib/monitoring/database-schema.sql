-- SUCCESS METRICS & MONITORING - Database Schema
-- Tables para armazenar todas as métricas de sucesso do projeto

-- Business Metrics Table
CREATE TABLE business_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  metric_name VARCHAR(100) NOT NULL,
  metric_value DECIMAL(10,2) NOT NULL,
  context JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes for performance
  INDEX idx_business_metrics_name_date (metric_name, created_at),
  INDEX idx_business_metrics_user (user_id),
  INDEX idx_business_metrics_context USING GIN (context)
);

-- Video Upload Metrics Table  
CREATE TABLE video_upload_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  
  -- Performance Metrics
  upload_duration INTEGER NOT NULL, -- milliseconds
  file_size BIGINT NOT NULL, -- bytes
  upload_speed DECIMAL(10,2), -- bytes/second
  resume_count INTEGER DEFAULT 0,
  
  -- Success Metrics
  success BOOLEAN NOT NULL,
  error_type VARCHAR(50),
  error_message TEXT,
  
  -- Content Metrics
  video_format VARCHAR(20),
  video_duration INTEGER, -- seconds
  compression_ratio DECIMAL(5,2),
  category VARCHAR(50),
  
  -- User Context
  device_type VARCHAR(20),
  browser_type VARCHAR(100),
  session_id VARCHAR(100),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_video_upload_success_date (success, created_at),
  INDEX idx_video_upload_user_date (user_id, created_at),
  INDEX idx_video_upload_performance (upload_duration, file_size),
  INDEX idx_video_upload_errors (error_type) WHERE error_type IS NOT NULL
);

-- System Performance Metrics Table
CREATE TABLE system_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  
  -- API Performance
  endpoint VARCHAR(200) NOT NULL,
  response_time INTEGER NOT NULL, -- milliseconds
  status_code INTEGER NOT NULL,
  
  -- Resource Usage
  storage_used BIGINT DEFAULT 0, -- bytes
  bandwidth_used BIGINT DEFAULT 0, -- bytes
  active_uploads INTEGER DEFAULT 0,
  queue_length INTEGER DEFAULT 0,
  
  -- Business Context
  feature VARCHAR(50),
  operation VARCHAR(50),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_system_perf_endpoint_date (endpoint, created_at),
  INDEX idx_system_perf_response_time (response_time),
  INDEX idx_system_perf_status_code (status_code),
  INDEX idx_system_perf_resources (storage_used, bandwidth_used)
);

-- User Experience Metrics Table
CREATE TABLE user_experience_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  
  -- Usability Metrics
  task_type VARCHAR(100) NOT NULL,
  completion_time INTEGER NOT NULL, -- milliseconds
  successful BOOLEAN NOT NULL,
  error_count INTEGER DEFAULT 0,
  help_accessed BOOLEAN DEFAULT FALSE,
  
  -- Satisfaction Metrics
  satisfaction_score INTEGER CHECK (satisfaction_score BETWEEN 1 AND 10),
  recommendation_score INTEGER CHECK (recommendation_score BETWEEN 0 AND 10),
  feedback TEXT,
  
  -- Context
  session_id VARCHAR(100),
  user_agent TEXT,
  viewport VARCHAR(20),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_user_exp_task_date (task_type, created_at),
  INDEX idx_user_exp_success_date (successful, created_at),
  INDEX idx_user_exp_satisfaction (satisfaction_score) WHERE satisfaction_score IS NOT NULL,
  INDEX idx_user_exp_session (session_id)
);

-- Generic Metrics Table (for flexible metric storage)
CREATE TABLE generic_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  metric_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_generic_metrics_user_date (user_id, created_at),
  INDEX idx_generic_metrics_data USING GIN (metric_data)
);

-- KPI Dashboard View (materialized for performance)
CREATE MATERIALIZED VIEW kpi_dashboard AS
WITH upload_stats AS (
  SELECT 
    COUNT(*) as total_uploads,
    COUNT(*) FILTER (WHERE success) as successful_uploads,
    AVG(upload_duration) as avg_upload_time,
    AVG(file_size) as avg_file_size,
    COUNT(DISTINCT user_id) as active_users,
    DATE_TRUNC('day', created_at) as date
  FROM video_upload_metrics
  WHERE created_at >= NOW() - INTERVAL '30 days'
  GROUP BY DATE_TRUNC('day', created_at)
),
performance_stats AS (
  SELECT 
    AVG(response_time) as avg_response_time,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY response_time) as p95_response_time,
    COUNT(*) FILTER (WHERE status_code >= 400) as error_count,
    COUNT(*) as total_requests,
    DATE_TRUNC('day', created_at) as date
  FROM system_performance_metrics
  WHERE created_at >= NOW() - INTERVAL '30 days'
  GROUP BY DATE_TRUNC('day', created_at)
),
user_satisfaction AS (
  SELECT 
    AVG(satisfaction_score) as avg_satisfaction,
    AVG(recommendation_score) as avg_nps,
    AVG(completion_time) as avg_task_time,
    COUNT(*) FILTER (WHERE successful) / COUNT(*)::float as success_rate,
    DATE_TRUNC('day', created_at) as date
  FROM user_experience_metrics
  WHERE created_at >= NOW() - INTERVAL '30 days'
    AND satisfaction_score IS NOT NULL
  GROUP BY DATE_TRUNC('day', created_at)
)
SELECT 
  COALESCE(u.date, p.date, s.date) as date,
  
  -- Upload Metrics
  COALESCE(u.total_uploads, 0) as total_uploads,
  COALESCE(u.successful_uploads, 0) as successful_uploads,
  CASE WHEN u.total_uploads > 0 THEN u.successful_uploads::float / u.total_uploads ELSE 0 END as upload_success_rate,
  u.avg_upload_time,
  u.avg_file_size,
  u.active_users,
  
  -- Performance Metrics
  p.avg_response_time,
  p.p95_response_time,
  CASE WHEN p.total_requests > 0 THEN p.error_count::float / p.total_requests ELSE 0 END as error_rate,
  
  -- User Experience Metrics
  s.avg_satisfaction,
  s.avg_nps,
  s.avg_task_time,
  s.success_rate as task_success_rate

FROM upload_stats u
FULL OUTER JOIN performance_stats p ON u.date = p.date
FULL OUTER JOIN user_satisfaction s ON COALESCE(u.date, p.date) = s.date
ORDER BY date DESC;

-- Create refresh function for materialized view
CREATE OR REPLACE FUNCTION refresh_kpi_dashboard()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW kpi_dashboard;
END;
$$ LANGUAGE plpgsql;

-- Set up automatic refresh (hourly)
SELECT cron.schedule('refresh-kpi-dashboard', '0 * * * *', 'SELECT refresh_kpi_dashboard();');

-- RLS Policies
ALTER TABLE business_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_upload_metrics ENABLE ROW LEVEL SECURITY;  
ALTER TABLE system_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_experience_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE generic_metrics ENABLE ROW LEVEL SECURITY;

-- Admin-only access policies
CREATE POLICY "Admins can view all business metrics" ON business_metrics
FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'admin'
));

CREATE POLICY "Users can insert their own metrics" ON business_metrics
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- Similar policies for other tables
CREATE POLICY "Admins can view all upload metrics" ON video_upload_metrics
FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'admin'
));

CREATE POLICY "Users can insert their own upload metrics" ON video_upload_metrics
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all performance metrics" ON system_performance_metrics
FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'admin'
));

CREATE POLICY "Users can insert their own performance metrics" ON system_performance_metrics
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all UX metrics" ON user_experience_metrics
FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'admin'
));

CREATE POLICY "Users can insert their own UX metrics" ON user_experience_metrics
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all generic metrics" ON generic_metrics
FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'admin'
));

CREATE POLICY "Users can insert their own generic metrics" ON generic_metrics
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());