# ⚡ Configure Agora - 2 Minutos

## 🔴 Vendo Erros? (Loop ou "Supabase não configurado")

Isso acontece porque o Supabase ainda não foi configurado. **É normal!** Siga estes passos:

### 1️⃣ Criar arquivo `.env.local`

Na **raiz do projeto** (pasta `dfcorretora`), crie um arquivo chamado `.env.local`

Copie e cole este conteúdo:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxxxx
```

### 2️⃣ Obter as Credenciais do Supabase

**Opção A: Criar projeto novo (5 minutos)**

1. Acesse https://supabase.com
2. Faça login ou crie conta (gratuito)
3. Clique em **"New Project"**
4. Preencha:
   - Nome: `DF Treinamentos`
   - Database Password: escolha uma senha forte
   - Region: South America (São Paulo)
5. Aguarde ~2 minutos

**Copiar credenciais:**
- Vá em **Settings** > **API**
- Copie:
  - **Project URL** → cole em `NEXT_PUBLIC_SUPABASE_URL`
  - **anon public** → cole em `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - **service_role** → cole em `SUPABASE_SERVICE_ROLE_KEY`

### 3️⃣ Salvar e Reiniciar

1. Salve o arquivo `.env.local`
2. No terminal, pare o servidor (Ctrl+C)
3. Inicie novamente: `npm run dev`
4. Acesse: http://localhost:3000

---

## 📚 Próximos Passos

Depois de configurar o `.env.local`:

1. **Configurar o banco de dados**
   - Siga o guia: `INICIO-RAPIDO.md`
   - Execute o script SQL: `supabase-schema.sql`

2. **Criar usuário admin**
   - Acesse: http://localhost:3000/cadastro
   - Crie sua conta
   - Vá no Supabase e mude o `role` para `admin`

3. **Popular com dados de exemplo** (opcional)
   - Execute o script: `dados-exemplo.sql`

---

## 🆘 Ainda com Problemas?

### Erro de variáveis de ambiente?

1. Certifique-se que o arquivo se chama `.env.local` (com o ponto no início)
2. Verifique que está na pasta raiz do projeto
3. Reinicie o servidor após criar/editar

### Erro de conexão com Supabase?

1. Verifique se copiou as credenciais corretas
2. Certifique-se que o projeto Supabase está ativo
3. Aguarde alguns minutos se acabou de criar

---

**Precisa de ajuda?** Consulte o `README.md` completo ou `INICIO-RAPIDO.md`

