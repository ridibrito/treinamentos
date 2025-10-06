-- =========================================
-- DADOS DE EXEMPLO PARA DF TREINAMENTOS
-- =========================================
-- Execute este script DEPOIS de criar o schema principal

-- =========================================
-- 1. TREINAMENTO DE EXEMPLO
-- =========================================

-- Inserir treinamento
INSERT INTO treinamentos (id, titulo, descricao, categoria, duracao, imagem, ativo, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 
 'Introdução à Corretagem de Seguros', 
 'Aprenda os fundamentos da corretagem de seguros, desde conceitos básicos até práticas avançadas do mercado.',
 'Técnico',
 '6 horas',
 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800',
 true,
 NOW());

-- =========================================
-- 2. MÓDULOS DO TREINAMENTO
-- =========================================

INSERT INTO modulos (id, treinamento_id, titulo, descricao, conteudo, ordem, duracao) VALUES
-- Módulo 1
('550e8400-e29b-41d4-a716-446655440011',
 '550e8400-e29b-41d4-a716-446655440001',
 'O que é Corretagem de Seguros',
 'Entenda o papel do corretor de seguros no mercado',
 '<p>Neste módulo você aprenderá sobre a história e evolução da corretagem de seguros no Brasil.</p>',
 1,
 '1 hora'),

-- Módulo 2
('550e8400-e29b-41d4-a716-446655440012',
 '550e8400-e29b-41d4-a716-446655440001',
 'Legislação e Regulamentação',
 'Conheça as principais leis e regulamentos',
 '<p>Estudo das leis que regem a atividade de corretagem.</p>',
 2,
 '2 horas'),

-- Módulo 3
('550e8400-e29b-41d4-a716-446655440013',
 '550e8400-e29b-41d4-a716-446655440001',
 'Atendimento ao Cliente',
 'Boas práticas no relacionamento com clientes',
 '<p>Técnicas para oferecer um atendimento de excelência.</p>',
 3,
 '1.5 horas');

-- =========================================
-- 3. SLIDES DOS MÓDULOS
-- =========================================

-- Slides do Módulo 1
INSERT INTO slides (modulo_id, titulo, conteudo, ordem) VALUES
('550e8400-e29b-41d4-a716-446655440011',
 'Bem-vindo ao Treinamento',
 '<p>Este é o seu primeiro passo para se tornar um corretor de seguros de excelência!</p><ul><li>História da corretagem</li><li>Papel do corretor</li><li>Mercado atual</li></ul>',
 1),

('550e8400-e29b-41d4-a716-446655440011',
 'História da Corretagem no Brasil',
 '<p>A corretagem de seguros no Brasil teve início no século XIX com a chegada das primeiras seguradoras estrangeiras.</p><p><strong>Principais marcos:</strong></p><ul><li>1808 - Primeira seguradora no Brasil</li><li>1966 - Criação da SUSEP</li><li>2000s - Digitalização do setor</li></ul>',
 2),

('550e8400-e29b-41d4-a716-446655440011',
 'O Papel do Corretor',
 '<p>O corretor de seguros é um profissional regulamentado que atua como intermediário entre seguradoras e clientes.</p><p><strong>Responsabilidades:</strong></p><ul><li>Orientar o cliente sobre coberturas</li><li>Negociar condições</li><li>Auxiliar em sinistros</li><li>Manter-se atualizado</li></ul>',
 3);

-- Slides do Módulo 2
INSERT INTO slides (modulo_id, titulo, conteudo, ordem) VALUES
('550e8400-e29b-41d4-a716-446655440012',
 'Legislação Brasileira de Seguros',
 '<p>A atividade de corretagem é regulamentada pela SUSEP e pelo Código Civil Brasileiro.</p><p><strong>Principais normas:</strong></p><ul><li>Decreto-Lei 73/1966</li><li>Lei Complementar 126/2007</li><li>Resoluções CNSP</li></ul>',
 1),

('550e8400-e29b-41d4-a716-446655440012',
 'SUSEP - Superintendência de Seguros Privados',
 '<p>A SUSEP é o órgão responsável pela fiscalização do mercado de seguros no Brasil.</p><p><strong>Funções:</strong></p><ul><li>Fiscalizar seguradoras e corretores</li><li>Proteger consumidores</li><li>Regular o mercado</li></ul>',
 2);

-- Slides do Módulo 3
INSERT INTO slides (modulo_id, titulo, conteudo, ordem) VALUES
('550e8400-e29b-41d4-a716-446655440013',
 'Excelência no Atendimento',
 '<p>O atendimento é o diferencial competitivo do corretor de seguros.</p><p><strong>Pilares do bom atendimento:</strong></p><ul><li>Escuta ativa</li><li>Empatia</li><li>Conhecimento técnico</li><li>Agilidade</li><li>Pós-venda</li></ul>',
 1),

('550e8400-e29b-41d4-a716-446655440013',
 'Técnicas de Comunicação',
 '<p>A comunicação eficaz é essencial para transmitir confiança e profissionalismo.</p><p><strong>Dicas:</strong></p><ul><li>Use linguagem clara e objetiva</li><li>Evite jargões técnicos em excesso</li><li>Demonstre interesse genuíno</li><li>Faça perguntas abertas</li></ul>',
 2);

-- =========================================
-- 4. TESTE DO MÓDULO 1
-- =========================================

INSERT INTO testes (id, modulo_id, titulo, descricao, tempo_limite, nota_minima) VALUES
('550e8400-e29b-41d4-a716-446655440021',
 '550e8400-e29b-41d4-a716-446655440011',
 'Avaliação - O que é Corretagem',
 'Teste seus conhecimentos sobre os fundamentos da corretagem',
 15,
 70.00);

-- Questões do teste
INSERT INTO questoes (teste_id, enunciado, tipo, alternativas, resposta_correta, ordem, pontos) VALUES
-- Questão 1 - Múltipla escolha
('550e8400-e29b-41d4-a716-446655440021',
 'Qual órgão regula a atividade de corretagem de seguros no Brasil?',
 'multipla',
 '[
   {"id": "a", "texto": "CVM - Comissão de Valores Mobiliários"},
   {"id": "b", "texto": "SUSEP - Superintendência de Seguros Privados"},
   {"id": "c", "texto": "Banco Central"},
   {"id": "d", "texto": "CADE - Conselho Administrativo de Defesa Econômica"}
 ]'::jsonb,
 'b',
 1,
 1.00),

-- Questão 2 - Múltipla escolha
('550e8400-e29b-41d4-a716-446655440021',
 'Em que ano foi criada a SUSEP?',
 'multipla',
 '[
   {"id": "a", "texto": "1956"},
   {"id": "b", "texto": "1966"},
   {"id": "c", "texto": "1976"},
   {"id": "d", "texto": "1986"}
 ]'::jsonb,
 'b',
 2,
 1.00),

-- Questão 3 - Verdadeiro ou Falso
('550e8400-e29b-41d4-a716-446655440021',
 'O corretor de seguros é um profissional regulamentado e deve possuir registro na SUSEP.',
 'vf',
 NULL,
 'true',
 3,
 1.00),

-- Questão 4 - Verdadeiro ou Falso
('550e8400-e29b-41d4-a716-446655440021',
 'O corretor de seguros trabalha exclusivamente para uma única seguradora.',
 'vf',
 NULL,
 'false',
 4,
 1.00),

-- Questão 5 - Múltipla escolha
('550e8400-e29b-41d4-a716-446655440021',
 'Qual das seguintes NÃO é uma responsabilidade do corretor de seguros?',
 'multipla',
 '[
   {"id": "a", "texto": "Orientar o cliente sobre coberturas adequadas"},
   {"id": "b", "texto": "Negociar condições com a seguradora"},
   {"id": "c", "texto": "Determinar o valor final da apólice sem consultar a seguradora"},
   {"id": "d", "texto": "Auxiliar em processos de sinistro"}
 ]'::jsonb,
 'c',
 5,
 1.00);

-- =========================================
-- 5. APOSTILA DO TREINAMENTO
-- =========================================

INSERT INTO apostilas (treinamento_id, versao, capa, apresentacao, glossario, checklist, faq, paginas_anotacoes, watermark, ativo) VALUES
('550e8400-e29b-41d4-a716-446655440001',
 1,
 '{
   "titulo": "Introdução à Corretagem de Seguros",
   "subtitulo": "Material de Apoio ao Treinamento",
   "turma": "Turma 2025",
   "data": "Janeiro de 2025",
   "instrutor": "DF Corretora"
 }'::jsonb,
 '<p>Este material foi desenvolvido para apoiar sua jornada de aprendizado sobre corretagem de seguros.</p><p>A DF Corretora está comprometida em oferecer treinamentos de qualidade para formar profissionais de excelência.</p><p><strong>Nosso plano é cuidar bem.</strong></p>',
 '[
   {"termo": "SUSEP", "definicao": "Superintendência de Seguros Privados - órgão regulador do setor de seguros no Brasil"},
   {"termo": "Apólice", "definicao": "Documento que formaliza o contrato de seguro"},
   {"termo": "Sinistro", "definicao": "Evento previsto em contrato que gera o direito à indenização"},
   {"termo": "Prêmio", "definicao": "Valor pago pelo segurado à seguradora para ter direito à cobertura"},
   {"termo": "Franquia", "definicao": "Valor que fica sob responsabilidade do segurado em caso de sinistro"}
 ]'::jsonb,
 '[
   {"item": "Compreender o papel do corretor de seguros", "obrigatorio": true},
   {"item": "Conhecer a legislação básica do setor", "obrigatorio": true},
   {"item": "Dominar técnicas de atendimento ao cliente", "obrigatorio": true},
   {"item": "Estudar materiais complementares", "obrigatorio": false},
   {"item": "Realizar todos os testes de conhecimento", "obrigatorio": true}
 ]'::jsonb,
 '[
   {"pergunta": "Preciso de registro na SUSEP para atuar como corretor?", "resposta": "Sim, é obrigatório ter o registro ativo na SUSEP para exercer a profissão de corretor de seguros."},
   {"pergunta": "Posso trabalhar com várias seguradoras?", "resposta": "Sim, o corretor é um profissional autônomo e pode representar diversas seguradoras."},
   {"pergunta": "Como faço para me manter atualizado?", "resposta": "Participe de treinamentos regulares, acompanhe as mudanças na legislação e estude o mercado constantemente."}
 ]'::jsonb,
 3,
 'Material interno DF Corretora',
 true);

-- =========================================
-- INSTRUÇÕES DE USO
-- =========================================

-- Após executar este script:
-- 1. Crie um usuário no Supabase Auth
-- 2. Defina o role como 'admin' na tabela profiles
-- 3. Faça login na aplicação
-- 4. Acesse o treinamento criado
-- 5. Complete os módulos e faça o teste

-- Para adicionar mais treinamentos:
-- 1. Insira dados em 'treinamentos'
-- 2. Crie 'modulos' para o treinamento
-- 3. Adicione 'slides' aos módulos
-- 4. (Opcional) Crie 'testes' e 'questoes'
-- 5. (Opcional) Configure 'apostilas'

-- Pronto! Seu sistema está populado com dados de exemplo.

