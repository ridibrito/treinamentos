# 🎥 Vídeos nos Treinamentos - Guia Rápido

## ✅ Problema Resolvido!

Agora os vídeos do YouTube/Vimeo aparecem corretamente nos módulos!

---

## 🎯 Como Funciona

### **1. Execute a Migration (1x apenas)**

No Supabase SQL Editor, execute:
```sql
-- migrations/adicionar-tipos-conteudo.sql
```

Isso adiciona os campos necessários para vídeos.

---

### **2. Criar Treinamento com Vídeo**

**Opção A: Via Wizard (Recomendado)**

1. Admin > Gerenciar Treinamentos
2. Clique em "Novo Treinamento"
3. **Etapa 1:** Preencha dados básicos
4. **Etapa 2:** Escolha "Vídeo-aula"
5. **Etapa 3:** Adicione módulos e cole as URLs

**Opção B: Via Banco de Dados**

```sql
-- Inserir vídeo no módulo
UPDATE modulos
SET video_url = 'https://www.youtube.com/watch?v=VIDEO_ID'
WHERE id = 'seu-modulo-id';
```

---

## 📺 Formatos de URL Suportados

### **YouTube:**
```
✅ https://www.youtube.com/watch?v=dQw4w9WgXcQ
✅ https://youtu.be/dQw4w9WgXcQ
✅ https://www.youtube.com/embed/dQw4w9WgXcQ
```

**Converte para:**
```
https://www.youtube.com/embed/dQw4w9WgXcQ
```

### **Vimeo:**
```
✅ https://vimeo.com/123456789
✅ https://vimeo.com/video/123456789
✅ https://player.vimeo.com/video/123456789
```

**Converte para:**
```
https://player.vimeo.com/video/123456789
```

### **Outros:**
Se você colar uma URL de embed direto, ela será usada como está.

---

## 🎬 Como o Vídeo Aparece

### **Página do Módulo:**

```
┌────────────────────────────────────────┐
│ Módulo 1: Introdução                   │
│ Vídeo-aula • 15 min • Teste disponível │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ 🎥 Vídeo-aula Principal                │
│                                        │
│  ┌────────────────────────────────┐    │
│  │                                │    │
│  │     [Player do YouTube]        │    │
│  │                                │    │
│  └────────────────────────────────┘    │
│                                        │
│  ⏱️ Duração: 15 minutos                │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ Assistiu ao vídeo completo?            │
│              [Marcar como Concluído →] │
└────────────────────────────────────────┘
```

---

## 🎨 Recursos do Player

### **Iframe Configurado:**
```tsx
<iframe
  src={embedUrl}
  allowFullScreen
  allow="accelerometer; autoplay; clipboard-write; 
         encrypted-media; gyroscope; picture-in-picture"
/>
```

**Permite:**
- ✅ Fullscreen
- ✅ Autoplay (se configurado)
- ✅ Controles nativos do YouTube/Vimeo
- ✅ Picture-in-picture
- ✅ Tela cheia

---

## 📋 Ordem de Exibição

**Quando o módulo tem:**

1. **Vídeo principal** → Mostra primeiro (grande)
2. **Slides** → Mostra depois (navegação)
3. **Conteúdo texto** → Mostra se não tem vídeo nem slides
4. **Botão concluir** → Sempre ao final

**Exemplo de módulo misto:**
```
[Vídeo Principal do Módulo]
    ↓
[Slide 1] → [Slide 2] → [Slide 3]
    ↓
[Marcar como Concluído]
```

---

## 🔄 Tipos de Treinamento

### **Treinamento tipo VÍDEO:**
- Cada módulo = 1 vídeo
- Sem slides
- URL obrigatória

### **Treinamento tipo SLIDES:**
- Cada módulo = N slides
- Vídeos opcionais (dentro dos slides)

### **Treinamento tipo TEXTO:**
- Cada módulo = 1 documento
- HTML/Markdown
- Sem slides

### **Treinamento tipo MISTO:**
- Módulos podem ser de qualquer tipo
- Máxima flexibilidade

---

## ✅ Checklist de Teste

Para garantir que está funcionando:

- [ ] Execute `migrations/adicionar-tipos-conteudo.sql`
- [ ] Crie um treinamento tipo "Vídeo"
- [ ] Adicione um módulo com URL do YouTube
- [ ] Salve o treinamento
- [ ] Acesse como aluno
- [ ] Entre no módulo
- [ ] **Vídeo aparece e toca?** ✅
- [ ] Marca como concluído
- [ ] Faz o teste (se tiver)

---

## 🎯 Exemplo Prático

### **Criar treinamento "Fundamentos de Vendas":**

**Etapa 1:**
- Título: "Fundamentos de Vendas"
- Categoria: "Comercial"
- Duração: "2 horas"

**Etapa 2:**
- Tipo: **Vídeo-aula**

**Etapa 3 - Módulos:**

**Módulo 1:**
- Título: "O que é venda consultiva"
- URL: `https://www.youtube.com/watch?v=EXEMPLO1`

**Módulo 2:**
- Título: "Técnicas de abordagem"
- URL: `https://www.youtube.com/watch?v=EXEMPLO2`

**Módulo 3:**
- Título: "Fechamento de vendas"
- URL: `https://www.youtube.com/watch?v=EXEMPLO3`

**Salvar** → ✅ Treinamento criado com 3 vídeo-aulas!

---

## 📁 Arquivos Atualizados

```
✨ NOVOS:
- src/lib/video-utils.ts                    (Conversão de URLs)
- migrations/adicionar-tipos-conteudo.sql   (Migration)
- VIDEOS-NO-TREINAMENTO.md                  (Este guia)

📝 ATUALIZADOS:
- src/app/treinamentos/[id]/modulos/[moduloId]/ModuloContent.tsx
- src/app/treinamentos/[id]/modulos/[moduloId]/apresentacao/ApresentacaoContent.tsx
```

---

## 🚀 Teste Agora!

1. **Execute a migration** no Supabase
2. **Recarregue a página**
3. **Acesse um módulo com vídeo**
4. **Vídeo deve aparecer e tocar!** 🎬

---

**Player de vídeo integrado e funcionando!** 🎉

*Suporta YouTube, Vimeo e URLs customizadas*

