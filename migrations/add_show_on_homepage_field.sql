-- Migração: Separar lógicas de destaque (setor) e homepage
-- Data: 2025-01-28
-- Descrição: Adiciona campo show_on_homepage para separar destaque no setor de publicação na homepage

-- Adicionar campo show_on_homepage às tabelas de notícias setoriais
ALTER TABLE sector_news ADD COLUMN IF NOT EXISTS show_on_homepage boolean DEFAULT false;
ALTER TABLE subsector_news ADD COLUMN IF NOT EXISTS show_on_homepage boolean DEFAULT false;

-- Comentários para documentar os campos
COMMENT ON COLUMN sector_news.is_featured IS 'Destaque visual APENAS dentro do setor específico';
COMMENT ON COLUMN sector_news.show_on_homepage IS 'Publicação na homepage geral do portal';

COMMENT ON COLUMN subsector_news.is_featured IS 'Destaque visual APENAS dentro do subsetor específico';  
COMMENT ON COLUMN subsector_news.show_on_homepage IS 'Publicação na homepage geral do portal';

-- Migração de dados existentes
-- IMPORTANTE: Analisar manualmente quais notícias com is_featured=true eram realmente para homepage
-- Por agora, manter show_on_homepage=false para todas até análise manual

-- Indexes para otimização de queries
CREATE INDEX IF NOT EXISTS idx_sector_news_show_on_homepage ON sector_news(show_on_homepage) WHERE show_on_homepage = true;
CREATE INDEX IF NOT EXISTS idx_subsector_news_show_on_homepage ON subsector_news(show_on_homepage) WHERE show_on_homepage = true;

-- Index composto para queries de homepage
CREATE INDEX IF NOT EXISTS idx_sector_news_homepage_published ON sector_news(show_on_homepage, is_published) WHERE show_on_homepage = true AND is_published = true;
CREATE INDEX IF NOT EXISTS idx_subsector_news_homepage_published ON subsector_news(show_on_homepage, is_published) WHERE show_on_homepage = true AND is_published = true;