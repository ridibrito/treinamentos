-- =========================================
-- ADICIONAR TIPOS DE CONTEÚDO AOS TREINAMENTOS
-- =========================================

-- Adicionar coluna de tipo ao treinamento (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'treinamentos' AND column_name = 'tipo_conteudo'
  ) THEN
    ALTER TABLE treinamentos 
    ADD COLUMN tipo_conteudo TEXT CHECK (tipo_conteudo IN ('slides', 'video', 'texto', 'misto')) DEFAULT 'slides';
  END IF;
END $$;

-- Adicionar coluna de configuração de vídeo aos módulos
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'modulos' AND column_name = 'video_url'
  ) THEN
    ALTER TABLE modulos 
    ADD COLUMN video_url TEXT,
    ADD COLUMN video_duracao INT, -- em minutos
    ADD COLUMN video_plataforma TEXT; -- youtube, vimeo, custom
  END IF;
END $$;

-- Adicionar coluna de tipo aos slides
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'slides' AND column_name = 'tipo'
  ) THEN
    ALTER TABLE slides 
    ADD COLUMN tipo TEXT CHECK (tipo IN ('texto', 'imagem', 'video', 'markdown')) DEFAULT 'texto';
  END IF;
END $$;

-- Comentários explicativos
COMMENT ON COLUMN treinamentos.tipo_conteudo IS 'Tipo principal do treinamento: slides, video, texto ou misto';
COMMENT ON COLUMN modulos.video_url IS 'URL do vídeo principal do módulo (YouTube, Vimeo, etc)';
COMMENT ON COLUMN modulos.video_duracao IS 'Duração do vídeo em minutos';
COMMENT ON COLUMN modulos.video_plataforma IS 'Plataforma de vídeo: youtube, vimeo, custom';
COMMENT ON COLUMN slides.tipo IS 'Tipo de slide: texto, imagem, video, markdown';

-- =========================================
-- DADOS DE EXEMPLO (atualizar treinamento existente)
-- =========================================

-- Atualizar treinamento de exemplo para tipo 'slides'
UPDATE treinamentos 
SET tipo_conteudo = 'slides'
WHERE id = '550e8400-e29b-41d4-a716-446655440001';

