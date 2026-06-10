-- ============================================
-- Add columns to sermons
-- ============================================

-- Adicionar coluna preacher (texto livre para nome do pregador)
ALTER TABLE sermons ADD COLUMN IF NOT EXISTS preacher TEXT;

-- Adicionar coluna last_opened_at (timestamp da última abertura)
ALTER TABLE sermons ADD COLUMN IF NOT EXISTS last_opened_at TIMESTAMPTZ;

-- Índice para consultas de dashboard
CREATE INDEX IF NOT EXISTS idx_sermons_user_created ON sermons (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sermons_user_updated ON sermons (user_id, updated_at DESC);
