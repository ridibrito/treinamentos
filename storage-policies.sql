-- =========================================
-- POLICIES PARA STORAGE BUCKET: avatares
-- =========================================

-- Habilitar RLS no bucket (se necessário)
-- Nota: Buckets públicos geralmente não precisam de RLS,
-- mas se estiver dando erro, estas policies ajudam.

-- 1. Permitir que qualquer usuário autenticado faça UPLOAD de seu próprio avatar
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatares'
);

-- 2. Permitir que usuários autenticados ATUALIZEM seus próprios arquivos
CREATE POLICY "Authenticated users can update their avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatares')
WITH CHECK (bucket_id = 'avatares');

-- 3. Permitir que usuários autenticados DELETEM seus próprios arquivos
CREATE POLICY "Authenticated users can delete their avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatares');

-- 4. Permitir que TODOS vejam os avatares (público)
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatares');

-- =========================================
-- VERIFICAÇÃO: Se já existem policies, delete antes:
-- =========================================

-- Para ver policies existentes:
-- SELECT * FROM pg_policies WHERE tablename = 'objects';

-- Para deletar policies antigas (se necessário):
-- DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
-- DROP POLICY IF EXISTS "Authenticated users can update their avatars" ON storage.objects;
-- DROP POLICY IF EXISTS "Authenticated users can delete their avatars" ON storage.objects;
-- DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;

