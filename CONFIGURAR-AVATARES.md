# 📸 Configurar Upload de Avatares

## 🪣 Criar Bucket no Supabase

### Passo 1: Acessar Storage

1. Vá no **Supabase Dashboard**
2. Selecione seu projeto
3. Clique em **Storage** (menu lateral)

### Passo 2: Criar o Bucket

1. Clique em **"New bucket"**
2. Preencha:
   - **Name:** `avatares`
   - **Public bucket:** ✅ **Marque esta opção** (muito importante!)
3. Clique em **"Create bucket"**

### Passo 3: Configurar Policies (Opcional mas Recomendado)

Para maior segurança, configure políticas de acesso:

#### Policy 1: Permitir Upload (Authenticated Users)

```sql
-- Nome: "Users can upload their own avatar"
-- Allowed operation: INSERT
-- Policy definition:
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatares' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

#### Policy 2: Permitir Update (Authenticated Users)

```sql
-- Nome: "Users can update their own avatar"
-- Allowed operation: UPDATE
-- Policy definition:
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatares' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

#### Policy 3: Permitir Delete (Authenticated Users)

```sql
-- Nome: "Users can delete their own avatar"
-- Allowed operation: DELETE
-- Policy definition:
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatares' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

#### Policy 4: Permitir Visualização Pública

```sql
-- Nome: "Public can view avatars"
-- Allowed operation: SELECT
-- Policy definition:
CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatares');
```

---

## ✅ Verificar Configuração

### Testar se está funcionando:

1. Acesse http://localhost:3000/perfil
2. Clique em **"Alterar Foto"**
3. Selecione uma imagem
4. Aguarde o upload
5. ✅ Veja sua foto aparecer!

---

## 📁 Estrutura do Bucket

Os arquivos serão salvos como:

```
avatares/
  ├── {user-id}-{timestamp}.jpg
  ├── {user-id}-{timestamp}.png
  └── ...
```

**Exemplo:**
```
f91252d9-d810-4ecc-b1ea-5b5d7e26a008-1704067200000.jpg
```

---

## 🔒 Segurança

### Validações Implementadas:

✅ **Tipo de arquivo:** Apenas imagens (jpg, png, gif, etc.)  
✅ **Tamanho máximo:** 2MB  
✅ **Autenticação:** Só usuários logados podem fazer upload  
✅ **Público:** Qualquer pessoa pode VER as imagens (necessário para exibir avatares)

---

## 🎨 Features da Página de Perfil

### Funcionalidades Implementadas:

1. **Upload de Avatar**
   - ✅ Arraste e solte ou clique para selecionar
   - ✅ Preview em tempo real
   - ✅ Loading indicator
   - ✅ Mensagens de sucesso/erro

2. **Edição de Perfil**
   - ✅ Alterar nome
   - ✅ Visualizar e-mail (somente leitura)
   - ✅ Ver perfil de acesso com badge colorido
   - ✅ Data de cadastro

3. **Validações**
   - ✅ Imagens até 2MB
   - ✅ Apenas formatos de imagem
   - ✅ Feedback visual em tempo real

4. **UX**
   - ✅ Loading states
   - ✅ Mensagens de feedback
   - ✅ Botões desabilitados durante ações
   - ✅ Auto-refresh após upload

---

## 🐛 Troubleshooting

### Erro: "Error uploading file"

**Solução:** Verifique se:
1. O bucket `avatares` foi criado
2. O bucket está marcado como **público**
3. As variáveis de ambiente estão corretas

### Erro: "Policy violation"

**Solução:** 
1. Configure as policies de acesso (veja Passo 3)
2. OU: Desabilite RLS no bucket (não recomendado para produção)

### Imagem não aparece

**Solução:**
1. Verifique se o bucket é **público**
2. Limpe o cache do navegador
3. Verifique a URL pública no console do Supabase

---

## 📝 Código Relevante

### Upload de Avatar:
`src/app/perfil/PerfilContent.tsx` - Função `handleAvatarUpload`

### Exibição do Avatar:
- `src/components/layout/Topbar.tsx` - Dropdown
- `src/components/layout/Header.tsx` - Header (se usado)

---

## 🚀 Próximas Melhorias (Opcionais)

- [ ] Crop de imagem antes do upload
- [ ] Remoção de avatar
- [ ] Múltiplos formatos/tamanhos (thumbnail, full)
- [ ] Compressão automática de imagem
- [ ] Drag & Drop zone
- [ ] Galeria de avatares pré-definidos

---

**Bucket configurado!** 🎉 Agora seus usuários podem personalizar seus perfis com fotos!

*Desenvolvido para DF Corretora*

