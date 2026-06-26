-- Adicionar coluna font na tabela sermons
ALTER TABLE sermons ADD COLUMN IF NOT EXISTS font TEXT;
