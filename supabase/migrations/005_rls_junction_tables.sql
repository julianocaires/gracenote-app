-- Migration 005: RLS policies for junction tables sermon_categories and sermon_tags
-- These tables link sermons to categories and tags
-- Note: FOR ALL USING does NOT cover INSERT — we need explicit WITH CHECK

-- sermon_categories
ALTER TABLE sermon_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver categorias dos seus sermões" ON sermon_categories
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM sermons WHERE id = sermon_id AND user_id = auth.uid())
  );

CREATE POLICY "Usuários podem inserir categorias nos seus sermões" ON sermon_categories
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM sermons WHERE id = sermon_id AND user_id = auth.uid())
  );

CREATE POLICY "Usuários podem atualizar categorias dos seus sermões" ON sermon_categories
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM sermons WHERE id = sermon_id AND user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM sermons WHERE id = sermon_id AND user_id = auth.uid())
  );

CREATE POLICY "Usuários podem excluir categorias dos seus sermões" ON sermon_categories
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM sermons WHERE id = sermon_id AND user_id = auth.uid())
  );

-- sermon_tags
ALTER TABLE sermon_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver tags dos seus sermões" ON sermon_tags
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM sermons WHERE id = sermon_id AND user_id = auth.uid())
  );

CREATE POLICY "Usuários podem inserir tags nos seus sermões" ON sermon_tags
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM sermons WHERE id = sermon_id AND user_id = auth.uid())
  );

CREATE POLICY "Usuários podem atualizar tags dos seus sermões" ON sermon_tags
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM sermons WHERE id = sermon_id AND user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM sermons WHERE id = sermon_id AND user_id = auth.uid())
  );

CREATE POLICY "Usuários podem excluir tags dos seus sermões" ON sermon_tags
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM sermons WHERE id = sermon_id AND user_id = auth.uid())
  );
