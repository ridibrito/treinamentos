-- Tabela de configuração simples (chave/valor)
CREATE TABLE IF NOT EXISTS config (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Trigger de updated_at
CREATE OR REPLACE FUNCTION update_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_config_updated_at ON config;
CREATE TRIGGER trg_update_config_updated_at
BEFORE UPDATE ON config
FOR EACH ROW EXECUTE FUNCTION update_config_updated_at();

-- RLS
ALTER TABLE config ENABLE ROW LEVEL SECURITY;

-- Qualquer usuário pode ler configurações públicas (ex: manual)
CREATE POLICY IF NOT EXISTS "public select config"
  ON config FOR SELECT
  USING (TRUE);

-- Apenas admin pode inserir/atualizar
CREATE POLICY IF NOT EXISTS "admin upsert config"
  ON config FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );


