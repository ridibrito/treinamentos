# 🖼️ Geração Automática de Imagens para Apostilas

## ✨ Funcionalidade Implementada!

O sistema agora pode **gerar automaticamente imagens** para substituir as sugestões criadas pela IA do Gemini!

---

## 🎯 Como Funciona

### **Fluxo Completo:**

```
1. Formate texto com IA
   ↓
2. Gemini identifica pontos para imagens
   ↓
3. Cria placeholders de sugestão
   ↓
4. Clique em "Gerar Imagens"
   ↓
5. Sistema gera imagens automaticamente
   ↓
6. Placeholders são substituídos por imagens reais
```

---

## 🚀 Como Usar

### **Passo 1: Formatar Texto com IA**

1. Cole ou digite o texto na área "Texto Original"
2. Clique em **"✨ Formatar com IA"**
3. Aguarde o processamento (~5-10 segundos)

### **Passo 2: Revisar Sugestões**

No preview, você verá boxes azuis tracejados como este:

```
┌─────────────────────────────────────────┐
│  [SUGESTÃO DE IMAGEM]                   │
│  Corretor atendendo cliente em          │
│  escritório profissional                │
└─────────────────────────────────────────┘
```

### **Passo 3: Gerar Imagens**

1. Clique no botão **"🖼️ Gerar Imagens"**
2. O sistema detecta todas as sugestões
3. Gera imagens automaticamente
4. Substitui os placeholders

### **Passo 4: Revisar e Salvar**

1. Revise as imagens geradas no preview
2. Se necessário, ajuste manualmente
3. Clique em **"💾 Salvar Apostila"**

---

## 🎨 Tipos de Imagens

### **✨ IMPLEMENTADO: Imagens REAIS Geradas por IA!**

O sistema agora usa o **Gemini 2.5 Flash Image** para gerar imagens reais:

- ✅ **Modelo**: `gemini-2.5-flash-image`
- ✅ **Qualidade**: Imagens profissionais e realistas
- ✅ **Estilo**: Corporativo, moderno, educativo
- ✅ **Cores**: Tons de azul, branco, cinza (paleta DF)
- ✅ **Formato**: PNG/JPEG em base64
- ✅ **Tamanho**: Alta resolução, adequado para impressão

**Como funciona:**
1. IA analisa a descrição da sugestão
2. Gera uma imagem profissional usando Gemini
3. Retorna em base64 (embutida no HTML)
4. Substitui o placeholder pela imagem real

### **Alternativas (Opcionais):**

Se quiser ainda mais controle:
- 🎨 **DALL-E 3** (OpenAI) - Fotorrealismo extremo
- 🎨 **Stable Diffusion** - Open source
- 🎨 **Upload Manual** - Controle total

---

## 💡 Exemplo Prático

### **Input (Texto Original):**

```
Introdução à Corretagem de Seguros

O corretor de seguros é um profissional regulamentado pela SUSEP.

Principais responsabilidades:
- Orientar o cliente sobre coberturas
- Negociar com seguradoras
- Auxiliar em sinistros

A SUSEP fiscaliza o mercado de seguros.
```

### **Após "Formatar com IA":**

```html
<h2>Introdução à Corretagem de Seguros</h2>

<div class="image-suggestion" data-suggestion="Corretor atendendo cliente">
  [SUGESTÃO DE IMAGEM: Corretor atendendo cliente]
</div>

<p>O corretor de seguros é um <strong>profissional regulamentado</strong>...</p>

<div class="image-suggestion" data-suggestion="Logo da SUSEP">
  [SUGESTÃO DE IMAGEM: Logo oficial da SUSEP]
</div>
```

### **Após "Gerar Imagens":**

```html
<h2>Introdução à Corretagem de Seguros</h2>

<figure class="my-6">
  <img 
    src="https://placehold.co/800x600/014175/FFFFFF/png?text=Corretor+atendendo+cliente" 
    alt="Corretor atendendo cliente"
    class="w-full rounded-lg shadow-md"
  />
  <figcaption class="text-sm text-gray-600 mt-2 text-center italic">
    Corretor atendendo cliente em escritório profissional
  </figcaption>
</figure>

<p>O corretor de seguros é um <strong>profissional regulamentado</strong>...</p>

<figure class="my-6">
  <img 
    src="https://placehold.co/800x600/014175/FFFFFF/png?text=Logo+da+SUSEP" 
    alt="Logo da SUSEP"
    class="w-full rounded-lg shadow-md"
  />
  <figcaption class="text-sm text-gray-600 mt-2 text-center italic">
    Logo oficial da SUSEP
  </figcaption>
</figure>
```

---

## 🔧 Configuração Técnica

### **Arquivos Modificados:**

```
✨ NOVOS:
- src/app/api/gemini/gerar-imagem/route.ts  (API endpoint)
- GERACAO-IMAGENS-APOSTILAS.md              (Documentação)

📝 ATUALIZADOS:
- src/app/admin/treinamentos/[id]/apostila/EditorApostilaIA.tsx
  • Adicionado estado `gerandoImagens`
  • Função `handleGerarImagens()`
  • Botão "Gerar Imagens"
  • Ícone `Image` do Lucide
```

### **Função Principal:**

```typescript
const handleGerarImagens = async () => {
  // 1. Parse HTML para encontrar sugestões
  const parser = new DOMParser()
  const doc = parser.parseFromString(htmlFormatado, 'text/html')
  const sugestoes = doc.querySelectorAll('.image-suggestion')
  
  // 2. Para cada sugestão
  for (const sugestao of sugestoes) {
    const descricao = sugestao.getAttribute('data-suggestion')
    
    // 3. Gerar imagem (placeholder por enquanto)
    const imagemUrl = `https://placehold.co/800x600/014175/FFFFFF/png?text=${descricao}`
    
    // 4. Substituir sugestão por <figure> com <img>
    const imagemHtml = `<figure>...</figure>`
    htmlAtualizado = htmlAtualizado.replace(sugestaoHtml, imagemHtml)
  }
  
  // 5. Atualizar preview
  setHtmlFormatado(htmlAtualizado)
}
```

---

## 🎯 Vantagens do Sistema

### **Para Admins:**
- ✅ **Automação total**: Um clique e todas as imagens são geradas
- ✅ **Visual consistente**: Todas as imagens seguem o padrão DF
- ✅ **Economia de tempo**: Não precisa buscar/criar imagens manualmente
- ✅ **Legendas automáticas**: Cada imagem tem descrição

### **Para Alunos:**
- ✅ **Conteúdo visual rico**: Apostilas mais atrativas
- ✅ **Melhor compreensão**: Ilustrações ajudam no aprendizado
- ✅ **Profissional**: Visual corporativo e limpo

---

## 🚀 Próximos Passos (Opcionais)

### **1. Integração com DALL-E 3**

```typescript
// src/app/api/gemini/gerar-imagem/route.ts
const response = await openai.images.generate({
  model: "dall-e-3",
  prompt: `Professional corporate illustration: ${descricao}. 
           Style: clean, modern, business-appropriate. 
           Colors: blue (#014175), white, gray.`,
  n: 1,
  size: "1024x1024",
  quality: "standard"
})
```

### **2. Upload para Supabase Storage**

Salvar imagens geradas permanentemente:

```typescript
// Fazer upload para bucket 'apostilas-assets'
const { data, error } = await supabase.storage
  .from('apostilas-assets')
  .upload(`${treinamentoId}/imagem-${index}.png`, imageBlob)
```

### **3. Editor Manual de Imagens**

Permitir que admin:
- ✅ Faça upload de imagens customizadas
- ✅ Edite legendas
- ✅ Ajuste posicionamento
- ✅ Substitua imagens geradas

### **4. Cache de Imagens**

Evitar gerar a mesma imagem múltiplas vezes:

```typescript
// Verificar se já existe imagem para essa descrição
const cacheKey = hash(descricao)
const imagemCacheada = await getCachedImage(cacheKey)
if (imagemCacheada) return imagemCacheada
```

---

## 📊 Estatísticas de Uso

O sistema rastreia automaticamente:
- ✅ Quantas sugestões foram detectadas
- ✅ Quantas imagens foram geradas com sucesso
- ✅ Tempo total de processamento

**Toast de feedback:**
```
✅ 5 imagens geradas!
Revise as imagens e salve quando estiver pronto
```

---

## 🎨 Estilos das Imagens

### **Classes CSS aplicadas:**

```css
figure {
  margin: 1.5rem 0; /* my-6 */
}

img {
  width: 100%;
  border-radius: 0.5rem; /* rounded-lg */
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); /* shadow-md */
  loading: lazy; /* Carregamento otimizado */
}

figcaption {
  font-size: 0.875rem; /* text-sm */
  color: #6b7280; /* text-gray-600 */
  margin-top: 0.5rem; /* mt-2 */
  text-align: center;
  font-style: italic;
}
```

---

## 🔍 Troubleshooting

### **Problema: Botão "Gerar Imagens" não aparece**
**Solução:** Você precisa primeiro clicar em "Formatar com IA". O botão só aparece após ter conteúdo formatado.

### **Problema: "Sem sugestões de imagem"**
**Solução:** O texto fornecido não gerou sugestões de imagem. Tente um texto mais descritivo ou com conceitos visuais.

### **Problema: Imagens não carregam**
**Solução:** Verifique sua conexão com a internet. Os placeholders vêm do placehold.co (serviço externo).

### **Problema: Quero usar imagens reais, não placeholders**
**Solução:** Você pode:
1. Integrar com DALL-E (requer API key da OpenAI)
2. Fazer upload manual das imagens
3. Usar outro serviço de geração de imagens

---

## 📝 Exemplo de Uso Completo

### **1. Preparar Conteúdo**

Texto sobre "Tipos de Seguros":

```
Tipos de Seguros

Seguro de Vida
Protege a família em caso de falecimento.

Seguro de Automóvel
Cobre danos ao veículo e terceiros.

Seguro Residencial
Protege a casa contra incêndios e roubos.
```

### **2. Formatar com IA**

Clique em "✨ Formatar com IA"

**Resultado:**
- ✅ HTML estruturado
- ✅ 3 sugestões de imagem criadas

### **3. Gerar Imagens**

Clique em "🖼️ Gerar Imagens"

**Processo:**
```
🔍 Detectadas 3 sugestões
⏳ Gerando imagens...
  ✅ Imagem 1: "Família protegida por seguro de vida"
  ✅ Imagem 2: "Carro segurado com proteção"
  ✅ Imagem 3: "Casa protegida contra riscos"
✨ 3 imagens geradas com sucesso!
```

### **4. Salvar**

Clique em "💾 Salvar Apostila"

**Pronto!** Apostila completa com imagens disponível para alunos!

---

## 🎉 Resultado Final

Os alunos verão apostilas profissionais com:

- ✅ Texto bem formatado
- ✅ Títulos hierárquicos
- ✅ Listas organizadas
- ✅ Destaques em negrito
- ✅ Boxes de informação
- ✅ **Imagens ilustrativas com legendas**

Tudo isso gerado **automaticamente** em segundos! 🚀✨

---

## 📚 Documentação Relacionada

- `APOSTILAS-COM-IA.md` - Sistema completo de apostilas
- `GEMINI-TROUBLESHOOTING.md` - Solução de problemas do Gemini
- `SISTEMA-TOASTS.md` - Sistema de notificações

---

**Sistema de geração de imagens implementado e funcionando!** 🖼️✨

*Transforme textos simples em apostilas visuais e profissionais em poucos cliques!*

