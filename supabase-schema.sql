-- =========================================
-- DF TREINAMENTOS - SCHEMA DO BANCO DE DADOS
-- =========================================

-- Tabela de perfis de usuários
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('admin', 'palestrante', 'aluno')) DEFAULT 'aluno',
  nome TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Treinamentos
CREATE TABLE treinamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT,
  duracao TEXT,
  imagem TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Módulos de cada treinamento
CREATE TABLE modulos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  treinamento_id UUID REFERENCES treinamentos(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  conteudo TEXT,
  ordem INT NOT NULL,
  duracao TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Slides de cada módulo
CREATE TABLE slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  modulo_id UUID REFERENCES modulos(id) ON DELETE CASCADE,
  titulo TEXT,
  conteudo TEXT,
  imagem TEXT,
  video_url TEXT,
  ordem INT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Testes
CREATE TABLE testes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  modulo_id UUID REFERENCES modulos(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  tempo_limite INT, -- minutos
  nota_minima NUMERIC(5,2) DEFAULT 70.00,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Questões
CREATE TABLE questoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teste_id UUID REFERENCES testes(id) ON DELETE CASCADE,
  enunciado TEXT NOT NULL,
  tipo TEXT CHECK (tipo IN ('multipla', 'vf', 'dissertativa')) NOT NULL,
  alternativas JSONB, -- Para múltipla escolha: [{"id": "a", "texto": "..."}, ...]
  resposta_correta TEXT, -- ID da alternativa correta ou "true"/"false"
  ordem INT NOT NULL,
  pontos NUMERIC(5,2) DEFAULT 1.00,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Respostas dos alunos
CREATE TABLE respostas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  questao_id UUID REFERENCES questoes(id) ON DELETE CASCADE,
  resposta TEXT,
  correta BOOLEAN,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Resultados agregados
CREATE TABLE resultados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  teste_id UUID REFERENCES testes(id) ON DELETE CASCADE,
  pontuacao NUMERIC(5,2) NOT NULL,
  total_questoes INT NOT NULL,
  acertos INT NOT NULL,
  aprovado BOOLEAN NOT NULL,
  tempo_gasto INT, -- minutos
  data TIMESTAMP DEFAULT NOW()
);

-- Progresso do usuário em treinamentos
CREATE TABLE progresso_treinamento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  treinamento_id UUID REFERENCES treinamentos(id) ON DELETE CASCADE,
  modulo_id UUID REFERENCES modulos(id) ON DELETE CASCADE,
  concluido BOOLEAN DEFAULT FALSE,
  data_inicio TIMESTAMP DEFAULT NOW(),
  data_conclusao TIMESTAMP,
  UNIQUE(user_id, modulo_id)
);

-- Apostilas (configuração por treinamento)
CREATE TABLE apostilas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  treinamento_id UUID NOT NULL REFERENCES treinamentos(id) ON DELETE CASCADE,
  versao INT NOT NULL DEFAULT 1,
  capa JSONB, -- {titulo, subtitulo, turma, data, instrutor, imagem_capa_url}
  apresentacao TEXT,
  glossario JSONB, -- [{termo, definicao}]
  checklist JSONB, -- [{item, obrigatorio:boolean}]
  faq JSONB, -- [{pergunta, resposta}]
  paginas_anotacoes INT DEFAULT 2,
  watermark TEXT DEFAULT 'Material interno DF Corretora',
  ativo BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(treinamento_id, versao)
);

-- PDFs gerados (versionamento)
CREATE TABLE apostilas_arquivos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  apostila_id UUID NOT NULL REFERENCES apostilas(id) ON DELETE CASCADE,
  versao INT NOT NULL,
  arquivo_url TEXT NOT NULL,
  tamanho_bytes BIGINT,
  hash TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(apostila_id, versao)
);

-- =========================================
-- INDEXES PARA PERFORMANCE
-- =========================================

CREATE INDEX idx_modulos_treinamento ON modulos(treinamento_id);
CREATE INDEX idx_slides_modulo ON slides(modulo_id);
CREATE INDEX idx_testes_modulo ON testes(modulo_id);
CREATE INDEX idx_questoes_teste ON questoes(teste_id);
CREATE INDEX idx_respostas_user ON respostas(user_id);
CREATE INDEX idx_respostas_questao ON respostas(questao_id);
CREATE INDEX idx_resultados_user ON resultados(user_id);
CREATE INDEX idx_resultados_teste ON resultados(teste_id);
CREATE INDEX idx_progresso_user ON progresso_treinamento(user_id);
CREATE INDEX idx_progresso_treinamento ON progresso_treinamento(treinamento_id);
CREATE INDEX idx_apostilas_treinamento ON apostilas(treinamento_id);

-- =========================================
-- ROW LEVEL SECURITY (RLS)
-- =========================================

-- Habilita RLS em todas as tabelas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE treinamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE modulos ENABLE ROW LEVEL SECURITY;
ALTER TABLE slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE testes ENABLE ROW LEVEL SECURITY;
ALTER TABLE questoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE respostas ENABLE ROW LEVEL SECURITY;
ALTER TABLE resultados ENABLE ROW LEVEL SECURITY;
ALTER TABLE progresso_treinamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE apostilas ENABLE ROW LEVEL SECURITY;
ALTER TABLE apostilas_arquivos ENABLE ROW LEVEL SECURITY;

-- PROFILES: Todos podem ver, mas só o próprio usuário pode atualizar
CREATE POLICY "Qualquer um pode ver profiles públicos"
  ON profiles FOR SELECT
  USING (TRUE);

CREATE POLICY "Usuários podem atualizar seu próprio profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- TREINAMENTOS: Todos podem visualizar ativos, admins podem gerenciar
CREATE POLICY "Qualquer um pode ver treinamentos ativos"
  ON treinamentos FOR SELECT
  USING (ativo = TRUE);

CREATE POLICY "Admins podem inserir treinamentos"
  ON treinamentos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins podem atualizar treinamentos"
  ON treinamentos FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins podem deletar treinamentos"
  ON treinamentos FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- MÓDULOS: Todos podem ver de treinamentos ativos
CREATE POLICY "Qualquer um pode ver módulos de treinamentos ativos"
  ON modulos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM treinamentos
      WHERE treinamentos.id = modulos.treinamento_id AND treinamentos.ativo = TRUE
    )
  );

CREATE POLICY "Admins podem gerenciar módulos"
  ON modulos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- SLIDES: Todos podem ver de módulos ativos
CREATE POLICY "Qualquer um pode ver slides"
  ON slides FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM modulos
      JOIN treinamentos ON treinamentos.id = modulos.treinamento_id
      WHERE modulos.id = slides.modulo_id AND treinamentos.ativo = TRUE
    )
  );

CREATE POLICY "Admins podem gerenciar slides"
  ON slides FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- TESTES: Todos podem ver
CREATE POLICY "Qualquer um pode ver testes"
  ON testes FOR SELECT
  USING (TRUE);

CREATE POLICY "Admins podem gerenciar testes"
  ON testes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- QUESTÕES: Todos podem ver
CREATE POLICY "Qualquer um pode ver questões"
  ON questoes FOR SELECT
  USING (TRUE);

CREATE POLICY "Admins podem gerenciar questões"
  ON questoes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- RESPOSTAS: Usuário vê apenas suas respostas
CREATE POLICY "Usuário vê apenas suas respostas"
  ON respostas FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuário pode inserir suas respostas"
  ON respostas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins podem ver todas as respostas"
  ON respostas FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- RESULTADOS: Usuário vê apenas seus resultados
CREATE POLICY "Usuário vê apenas seus resultados"
  ON resultados FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuário pode inserir seus resultados"
  ON resultados FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins podem ver todos os resultados"
  ON resultados FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- PROGRESSO: Usuário vê apenas seu progresso
CREATE POLICY "Usuário vê apenas seu progresso"
  ON progresso_treinamento FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuário pode gerenciar seu progresso"
  ON progresso_treinamento FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins podem ver todo o progresso"
  ON progresso_treinamento FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- APOSTILAS: Todos podem ver apostilas ativas
CREATE POLICY "Todos podem ver apostilas ativas"
  ON apostilas FOR SELECT
  USING (ativo = TRUE);

CREATE POLICY "Admins podem gerenciar apostilas"
  ON apostilas FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- APOSTILAS ARQUIVOS: Todos podem baixar PDFs
CREATE POLICY "Todos podem baixar PDFs"
  ON apostilas_arquivos FOR SELECT
  USING (TRUE);

CREATE POLICY "Admins podem gerenciar arquivos"
  ON apostilas_arquivos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- =========================================
-- FUNCTIONS E TRIGGERS
-- =========================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_treinamentos_updated_at BEFORE UPDATE ON treinamentos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_modulos_updated_at BEFORE UPDATE ON modulos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_apostilas_updated_at BEFORE UPDATE ON apostilas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para criar perfil automaticamente após signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'aluno')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil após signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================
-- STORAGE BUCKETS
-- =========================================

-- IMPORTANTE: Criar estes buckets via interface do Supabase:
-- 
-- 1. avatares (PÚBLICO) ⭐ OBRIGATÓRIO para upload de fotos
--    - Storage > New bucket > Nome: "avatares"
--    - ✅ Marcar como "Public bucket"
--    - Usado para: Fotos de perfil dos usuários
-- 
-- 2. treinamentos-imagens (PÚBLICO)
--    - Usado para: Imagens dos treinamentos e slides
-- 
-- 3. apostilas (PRIVADO)
--    - Usado para: PDFs gerados de apostilas
-- 
-- 4. apostilas-assets (PRIVADO)
--    - Usado para: Imagens e recursos das apostilas

-- Nota: Buckets públicos permitem acesso direto às URLs
-- Buckets privados requerem signed URLs

-- =========================================
-- DADOS DE EXEMPLO (OPCIONAL)
-- =========================================

-- Inserir categorias de exemplo
-- INSERT INTO treinamentos (titulo, descricao, categoria, duracao, ativo) VALUES
-- ('Introdução ao Corretagem', 'Fundamentos da corretagem de seguros', 'Técnico', '4 horas', TRUE),
-- ('Atendimento ao Cliente', 'Boas práticas no atendimento', 'Comercial', '2 horas', TRUE),
-- ('Saúde Suplementar Básico', 'Conceitos de planos de saúde', 'Saúde Suplementar', '6 horas', TRUE);

