# 🔧 Troubleshooting - Gemini API

## Problema: Modelos 404 Not Found

### ❌ Erro que você estava recebendo:
```
models/gemini-pro is not found for API version v1beta
models/gemini-1.5-flash is not found for API version v1beta
```

### ✅ Solução Implementada

O código agora **tenta automaticamente 4 modelos diferentes** em ordem de preferência:

1. `gemini-1.5-flash-latest` (mais recente, rápido)
2. `gemini-1.5-flash` (alternativa)
3. `gemini-1.5-pro-latest` (mais poderoso)
4. `gemini-pro` (legado, para API keys antigas)

**Como funciona:**
- Tenta o primeiro modelo
- Se falhar (404), tenta o próximo automaticamente
- Continua até encontrar um que funcione
- Se todos falharem, retorna erro detalhado

### 📝 Logs no Console

Ao clicar em "Formatar com IA", você verá no terminal:

**Sucesso:**
```
✅ Conteúdo gerado com sucesso usando: gemini-1.5-flash-latest
```

**Fallback para outro modelo:**
```
❌ Erro com modelo gemini-1.5-flash-latest: 404 Not Found
Tentando modelo alternativo: gemini-1.5-flash
✅ Conteúdo gerado com sucesso usando: gemini-1.5-flash
```

**Todos falharam:**
```
❌ Erro com modelo gemini-1.5-flash-latest: ...
❌ Erro com modelo gemini-1.5-flash: ...
❌ Erro com modelo gemini-1.5-pro-latest: ...
❌ Erro com modelo gemini-pro: ...
Todos os modelos falharam. Verifique sua API key do Gemini.
```

---

## Verificar qual modelo está funcionando

### **1. Teste no Terminal do Servidor**

Ao clicar em "Formatar com IA", olhe o terminal onde o `npm run dev` está rodando.

Você verá algo como:
```bash
✅ Conteúdo gerado com sucesso usando: gemini-1.5-flash-latest
```

Isso mostra **qual modelo funcionou**!

### **2. Teste Simples**

Cole este texto no editor de apostila:
```
Teste de Formatação

Este é um teste simples para verificar se a API do Gemini está funcionando.

Principais pontos:
- Verificar conexão
- Confirmar modelo
- Testar formatação

Importante: Se você está vendo isto formatado, está funcionando!
```

Clique em "Formatar com IA" e:
- ✅ Se aparecer HTML formatado = **FUNCIONOU!**
- ❌ Se der erro = veja logs abaixo

---

## Possíveis Problemas e Soluções

### 🔴 **Problema 1: Todos os modelos retornam 404**

**Causa:** API Key não tem acesso aos modelos

**Solução:**
1. Gerar nova API Key: https://makersuite.google.com/app/apikey
2. Copiar a nova key
3. Atualizar `.env.local`:
   ```env
   GEMINI_API_KEY=sua_nova_key_aqui
   ```
4. Reiniciar o servidor:
   ```bash
   # Ctrl+C para parar
   npm run dev
   ```

### 🔴 **Problema 2: API Key inválida**

**Erro:**
```
API key not valid
```

**Solução:**
- Gerar nova key
- Verificar se copiou corretamente (sem espaços no início/fim)
- Verificar se o `.env.local` está na raiz do projeto

### 🔴 **Problema 3: Quota exceeded**

**Erro:**
```
Quota exceeded
```

**Solução:**
- O plano gratuito tem limite de requisições
- Aguardar reset (diário/mensal)
- Ou upgrade para plano pago

### 🔴 **Problema 4: Região não suportada**

**Erro:**
```
The API is not available in your region
```

**Solução:**
- Gemini não está disponível em alguns países
- Usar VPN temporariamente
- Ou usar serviço alternativo

---

## Verificar se sua API Key está válida

### **Teste rápido via curl:**

**Windows (PowerShell):**
```powershell
$apiKey = "SUA_API_KEY_AQUI"
$body = @{
  contents = @(
    @{
      parts = @(
        @{ text = "Hello" }
      )
    }
  )
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=$apiKey" -Method POST -Body $body -ContentType "application/json"
```

**Mac/Linux:**
```bash
API_KEY="SUA_API_KEY_AQUI"
curl -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=$API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
```

**Resultado esperado:**
```json
{
  "candidates": [{
    "content": {
      "parts": [{"text": "Hello! ..."}]
    }
  }]
}
```

Se você ver isso = **API Key válida!** ✅

---

## Modelos Gemini Disponíveis (2025)

| Modelo | Velocidade | Qualidade | Uso Recomendado |
|--------|-----------|-----------|-----------------|
| `gemini-1.5-flash-latest` | ⚡⚡⚡ Muito rápido | ⭐⭐⭐ Boa | Apostilas, textos curtos |
| `gemini-1.5-flash` | ⚡⚡⚡ Muito rápido | ⭐⭐⭐ Boa | Alternativa estável |
| `gemini-1.5-pro-latest` | ⚡⚡ Médio | ⭐⭐⭐⭐⭐ Excelente | Textos complexos |
| `gemini-pro` | ⚡⚡ Médio | ⭐⭐⭐ Boa | API keys antigas |

**Recomendação:** Deixe o código tentar automaticamente (já configurado!)

---

## FAQ

### **P: Preciso mudar algo no código?**
**R:** Não! O código já tenta todos os modelos automaticamente.

### **P: Como sei qual modelo está sendo usado?**
**R:** Olhe o terminal do servidor ao formatar. Aparecerá: `✅ Conteúdo gerado com sucesso usando: [nome-do-modelo]`

### **P: Posso forçar um modelo específico?**
**R:** Sim! Edite `src/app/api/gemini/formatar-apostila/route.ts`:
```typescript
// Linha ~24-29
const modelosParaTestar = [
  'gemini-1.5-pro-latest', // 👈 Coloque seu preferido primeiro
  'gemini-1.5-flash-latest',
  'gemini-1.5-flash',
  'gemini-pro'
]
```

### **P: Quanto custa?**
**R:** 
- Plano **gratuito**: 60 requisições/minuto, suficiente para testes
- Plano **pago**: $0.35 por 1M tokens (muito barato)
- Para apostilas: ~500 tokens por formatação = ~$0.0002 por apostila

### **P: Minha API Key funciona em outras ferramentas mas não aqui**
**R:** 
1. Verificar se o `.env.local` está correto
2. Reiniciar o servidor Next.js
3. Limpar cache: `rm -rf .next` e rodar `npm run dev`

---

## Teste Final

### ✅ **Checklist de Funcionamento**

Execute estes passos:

1. [ ] API Key configurada em `.env.local`
2. [ ] Servidor reiniciado (`npm run dev`)
3. [ ] Acessou `/admin/treinamentos`
4. [ ] Clicou no ícone 📄 de um treinamento
5. [ ] Colou texto de exemplo
6. [ ] Clicou em "✨ Formatar com IA"
7. [ ] Aguardou ~5-10 segundos
8. [ ] Viu HTML formatado no preview

**Se todos os ✅ estão marcados = SISTEMA FUNCIONANDO! 🎉**

---

## Suporte

### 📚 Documentação Oficial:
- Gemini API: https://ai.google.dev/docs
- API Keys: https://makersuite.google.com/app/apikey
- Modelos: https://ai.google.dev/models/gemini

### 🐛 Reportar Problema:
Se nenhuma solução funcionou:
1. Copie os logs do terminal
2. Copie os erros do console do navegador (F12)
3. Inclua sua versão da API key (apenas primeiros 10 caracteres)
4. Descreva o que você tentou

---

**Sistema agora com fallback automático de modelos!** 🚀

*O código tenta 4 modelos diferentes até encontrar um que funcione.*

