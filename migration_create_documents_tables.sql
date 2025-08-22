-- Migration: Create Documents Tables
-- Date: 2025-01-21
-- Description: Creates sector_documents and subsector_documents tables following the exact pattern of news tables

-- Create sector_documents table
CREATE TABLE IF NOT EXISTS public.sector_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sector_id UUID NOT NULL REFERENCES public.sectors(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_type VARCHAR(50),
  file_size INTEGER,
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create subsector_documents table
CREATE TABLE IF NOT EXISTS public.subsector_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subsector_id UUID NOT NULL REFERENCES public.subsectors(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_type VARCHAR(50),
  file_size INTEGER,
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_sector_documents_sector_id ON public.sector_documents(sector_id);
CREATE INDEX idx_sector_documents_is_published ON public.sector_documents(is_published);
CREATE INDEX idx_sector_documents_is_featured ON public.sector_documents(is_featured);
CREATE INDEX idx_sector_documents_created_at ON public.sector_documents(created_at DESC);

CREATE INDEX idx_subsector_documents_subsector_id ON public.subsector_documents(subsector_id);
CREATE INDEX idx_subsector_documents_is_published ON public.subsector_documents(is_published);
CREATE INDEX idx_subsector_documents_is_featured ON public.subsector_documents(is_featured);
CREATE INDEX idx_subsector_documents_created_at ON public.subsector_documents(created_at DESC);

-- Enable RLS
ALTER TABLE public.sector_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subsector_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sector_documents
-- Select policy: Everyone can view published documents
CREATE POLICY "Published sector documents are viewable by everyone" 
  ON public.sector_documents FOR SELECT
  USING (is_published = true);

-- Select policy: Admins and sector admins can view all documents
CREATE POLICY "Admins can view all sector documents" 
  ON public.sector_documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.role = 'sector_admin')
    )
  );

-- Select policy: Authors can view their own unpublished documents
CREATE POLICY "Authors can view their own sector documents" 
  ON public.sector_documents FOR SELECT
  USING (created_by = auth.uid());

-- Insert policy: Only admins and sector admins can create
CREATE POLICY "Admins can create sector documents" 
  ON public.sector_documents FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.role = 'sector_admin')
    )
  );

-- Update policy: Only admins and sector admins can update
CREATE POLICY "Admins can update sector documents" 
  ON public.sector_documents FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.role = 'sector_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.role = 'sector_admin')
    )
  );

-- Update policy: Authors can update their own unpublished documents
CREATE POLICY "Authors can update their own unpublished sector documents" 
  ON public.sector_documents FOR UPDATE
  USING (created_by = auth.uid() AND is_published = false)
  WITH CHECK (created_by = auth.uid() AND is_published = false);

-- Delete policy: Only admins can delete
CREATE POLICY "Only admins can delete sector documents" 
  ON public.sector_documents FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for subsector_documents
-- Select policy: Everyone can view published documents
CREATE POLICY "Published subsector documents are viewable by everyone" 
  ON public.subsector_documents FOR SELECT
  USING (is_published = true);

-- Select policy: Admins and subsector admins can view all documents
CREATE POLICY "Admins can view all subsector documents" 
  ON public.subsector_documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.role = 'subsector_admin')
    )
  );

-- Select policy: Authors can view their own unpublished documents
CREATE POLICY "Authors can view their own subsector documents" 
  ON public.subsector_documents FOR SELECT
  USING (created_by = auth.uid());

-- Insert policy: Only admins and subsector admins can create
CREATE POLICY "Admins can create subsector documents" 
  ON public.subsector_documents FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.role = 'subsector_admin')
    )
  );

-- Update policy: Only admins and subsector admins can update
CREATE POLICY "Admins can update subsector documents" 
  ON public.subsector_documents FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.role = 'subsector_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.role = 'subsector_admin')
    )
  );

-- Update policy: Authors can update their own unpublished documents
CREATE POLICY "Authors can update their own unpublished subsector documents" 
  ON public.subsector_documents FOR UPDATE
  USING (created_by = auth.uid() AND is_published = false)
  WITH CHECK (created_by = auth.uid() AND is_published = false);

-- Delete policy: Only admins can delete
CREATE POLICY "Only admins can delete subsector documents" 
  ON public.subsector_documents FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_sector_documents_updated_at
  BEFORE UPDATE ON public.sector_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subsector_documents_updated_at
  BEFORE UPDATE ON public.subsector_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();