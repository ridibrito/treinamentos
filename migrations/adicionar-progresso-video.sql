-- Campos de tempo assistido para vídeo
ALTER TABLE progresso_treinamento
ADD COLUMN IF NOT EXISTS video_segundos NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS video_duracao_segundos NUMERIC(10,2) DEFAULT 0;


