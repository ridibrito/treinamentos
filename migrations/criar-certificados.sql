-- Tabela de Certificados
CREATE TABLE IF NOT EXISTS certificados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  treinamento_id UUID REFERENCES treinamentos(id) ON DELETE CASCADE,
  codigo_validacao VARCHAR(20) UNIQUE NOT NULL,
  nota_final NUMERIC(5,2) NOT NULL,
  data_conclusao TIMESTAMP NOT NULL,
  data_emissao TIMESTAMP DEFAULT NOW(),
  pdf_url TEXT,
  UNIQUE(user_id, treinamento_id)
);

-- Índices
CREATE INDEX idx_certificados_user ON certificados(user_id);
CREATE INDEX idx_certificados_treinamento ON certificados(treinamento_id);
CREATE INDEX idx_certificados_codigo ON certificados(codigo_validacao);

-- RLS
ALTER TABLE certificados ENABLE ROW LEVEL SECURITY;

-- Usuário pode ver apenas seus certificados
CREATE POLICY "Usuários veem seus próprios certificados"
  ON certificados FOR SELECT
  USING (auth.uid() = user_id);

-- Admin pode ver todos
CREATE POLICY "Admin vê todos os certificados"
  ON certificados FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Comentários
COMMENT ON TABLE certificados IS 'Certificados emitidos para alunos que concluíram treinamentos';
COMMENT ON COLUMN certificados.codigo_validacao IS 'Código único para validação do certificado (ex: DFCERT-2025-A1B2C3)';

