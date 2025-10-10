-- Adiciona progresso percentual por módulo (0..100)
ALTER TABLE progresso_treinamento
ADD COLUMN IF NOT EXISTS progresso_percentual NUMERIC(5,2) DEFAULT 0;

-- Índice opcional para consultas por progresso
CREATE INDEX IF NOT EXISTS idx_progresso_percentual
ON progresso_treinamento (user_id, modulo_id, progresso_percentual);


