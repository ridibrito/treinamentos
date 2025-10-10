-- Adiciona campo manual_url aos treinamentos para publicar manual de vendas
ALTER TABLE treinamentos
ADD COLUMN IF NOT EXISTS manual_url TEXT;


