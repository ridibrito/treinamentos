# 🚀 Início Rápido - DF Treinamentos

## Passos para começar em 10 minutos

### 1️⃣ Instalar Dependências

```bash
npm install
```

### 2️⃣ Criar Projeto no Supabase

1. Acesse https://supabase.com e crie conta (gratuito)
2. Clique em **"New Project"**
3. Preencha:
   - Nome: `DF Treinamentos`
   - Database Password: (escolha uma senha forte)
   - Region: South America (São Paulo)
4. Aguarde a criação (~2 minutos)

### 3️⃣ Configurar o Banco de Dados

1. No projeto Supabase, clique em **SQL Editor** (barra lateral)
2. Clique em **"New query"**
3. Copie TODO o conteúdo do arquivo `supabase-schema.sql`
4. Cole no editor e clique em **"Run"**
5. ✅ Aguarde a confirmação de sucesso

### 4️⃣ Criar os Storage Buckets

1. Clique em **Storage** na barra lateral
2. Clique em **"New bucket"**
3. Crie 4 buckets:

| Nome | Público? | Obrigatório? |
|------|----------|--------------|
| `avatares` | ✅ Sim | ⭐ SIM (para fotos de perfil) |
| `treinamentos-imagens` | ✅ Sim | Recomendado |
| `apostilas` | ❌ Não | Recomendado |
| `apostilas-assets` | ❌ Não | Recomendado |

**⚠️ Importante:** Ao criar o bucket `avatares`, marque a opção **"Public bucket"**!

### 5️⃣ Copiar as Credenciais

1. Clique em **Settings** > **API**
2. Copie:
   - **Project URL**
   - **anon public** (chave pública)
   - **service_role** (chave privada)

### 6️⃣ Configurar Variáveis de Ambiente

1. Crie um arquivo `.env.local` na raiz do projeto
2. Cole:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
```

3. Substitua pelos valores copiados do Supabase

### 7️⃣ Popular com Dados de Exemplo (Opcional)

1. No Supabase, vá em **SQL Editor** novamente
2. Copie o conteúdo de `dados-exemplo.sql`
3. Cole e execute com **"Run"**
4. ✅ Isso criará um treinamento completo de demonstração

### 8️⃣ Criar seu Usuário Admin

**Opção A: Via Interface (Mais Fácil)**

1. Com o servidor rodando, acesse: http://localhost:3000/cadastro
2. Preencha seus dados:
   - Nome completo
   - E-mail
   - Senha (mínimo 6 caracteres)
   - Confirmar senha
3. Clique em "Criar Conta"
4. Aguarde a confirmação

5. Transforme em admin:
   - No Supabase → **Table Editor** > **profiles**
   - Encontre seu usuário
   - Edite o campo `role` para `admin`
   - Salve

**Opção B: Direto no Supabase**

1. No Supabase, clique em **Authentication** > **Users**
2. Clique em **"Add user"** > **"Create new user"**
3. Preencha:
   - Email: `seu@email.com`
   - Password: `SuaSenha123!`
   - ✅ Marque **"Auto Confirm User"**
4. Clique em **"Create user"**

5. Agora transforme em admin:
   - Vá em **Table Editor** > **profiles**
   - Encontre seu usuário
   - Clique para editar
   - Mude `role` para `admin`
   - Mude `nome` para seu nome
   - Salve

### 9️⃣ Iniciar o Projeto

```bash
npm run dev
```

### 🔟 Fazer Login

1. Abra http://localhost:3000
2. Faça login com:
   - Email: `seu@email.com`
   - Senha: `SuaSenha123!`

## 🎉 Pronto!

Você agora tem acesso a:
- ✅ Dashboard com treinamento de exemplo
- ✅ Sistema completo de módulos e slides
- ✅ Testes de conhecimento
- ✅ Geração de apostilas
- ✅ Painel administrativo

## 📚 Próximos Passos

### Como Admin

1. Acesse **"Gerenciar Treinamentos"** no menu
2. Clique em **"Novo Treinamento"**
3. Preencha os dados e salve

### Adicionar Módulos e Slides

Por enquanto, adicione via Supabase:

1. Vá em **Table Editor** > **modulos**
2. Clique **"Insert row"**
3. Preencha:
   - `treinamento_id`: ID do seu treinamento
   - `titulo`: Nome do módulo
   - `ordem`: 1, 2, 3...
   - Outros campos

4. Depois adicione slides na tabela **slides**

### Criar Testes

1. Vá em **Table Editor** > **testes**
2. Insira vinculando ao `modulo_id`
3. Adicione questões na tabela **questoes**

## 💡 Dicas

- Use UUIDs válidos ao inserir dados manualmente
- Sempre defina a `ordem` correta (1, 2, 3...)
- Mantenha `ativo = true` para visibilidade
- Para imagens, use URLs do Unsplash como exemplo:
  - `https://images.unsplash.com/photo-[id]?w=800`

## 🆘 Problemas Comuns

### "Não autorizado" ao fazer login
- Certifique-se que marcou **"Auto Confirm User"**
- Verifique se o email está correto

### Treinamento não aparece
- Confirme que `ativo = true` no banco
- Verifique se o RLS está configurado corretamente

### Erro ao carregar páginas
- Verifique se as variáveis de ambiente estão corretas
- Confirme que executou o `supabase-schema.sql`

## 📞 Ajuda

Consulte o `README.md` completo para documentação detalhada.

---

**Desenvolvido para DF Corretora** 🚀

