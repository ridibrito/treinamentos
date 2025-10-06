# 🤖 Sistema de Apostilas com IA - DF Treinamentos

## ✨ Formatação Automática com Google Gemini

Sistema inteligente que transforma texto simples em apostilas profissionais formatadas!

---

## 🎯 Como Funciona

### **Você fornece:** Texto simples e desorganizado
### **IA entrega:** Apostila formatada, estruturada e profissional

```
ENTRADA:                          SAÍDA:
───────────                       ──────────
Texto simples      [🤖 Gemini]    ✨ HTML formatado
Sem formatação  ──────────────→   📝 Títulos e seções
Desorganizado                      📊 Listas e destaques
                                   🖼️ Sugestões de imagens
                                   📐 Layout profissional
```

---

## 📋 Configuração (1x apenas)

### **1. Obter API Key do Gemini**

1. Acesse: https://makersuite.google.com/app/apikey
2. Clique em "Create API Key"
3. Copie a chave gerada

### **2. Adicionar no .env.local**

```env
# Adicione esta linha:
GEMINI_API_KEY=sua_chave_aqui
```

### **3. Instalar Dependência**

```bash
npm install
```

(A dependência `@google/generative-ai` já está no package.json)

### **4. Reiniciar Servidor**

```bash
# Pare: Ctrl+C
npm run dev
```

---

## 🎨 Como Usar

### **Passo a Passo:**

#### **1. Acessar Editor**
- Admin > Gerenciar Treinamentos
- Clique no ícone **📄** (Editor de Apostila) de qualquer treinamento

#### **2. Colar Texto**

Cole ou digite o conteúdo bruto. Exemplo:

```
Introdução à Corretagem de Seguros

O corretor de seguros é um profissional regulamentado pela SUSEP.

Principais responsabilidades:
- Orientar o cliente sobre coberturas adequadas
- Negociar condições com seguradoras
- Auxiliar em processos de sinistro
- Manter-se atualizado com a legislação

A SUSEP é o órgão responsável pela fiscalização do mercado. 
Foi criada em 1966 pelo Decreto-Lei 73.

Importante: O corretor deve ter registro ativo para exercer a profissão.
```

#### **3. Clicar em "Formatar com IA"** ✨

A IA processa e retorna:

```html
<h2>Introdução à Corretagem de Seguros</h2>

<p>O corretor de seguros é um <strong>profissional regulamentado</strong> 
pela SUSEP que atua como intermediário entre clientes e seguradoras.</p>

<div class="image-suggestion" data-suggestion="Foto de corretor atendendo cliente">
  [SUGESTÃO DE IMAGEM: Corretor de seguros em atendimento profissional]
</div>

<h3>Principais Responsabilidades</h3>

<ul>
  <li><strong>Orientar o cliente</strong> sobre coberturas adequadas</li>
  <li><strong>Negociar condições</strong> com seguradoras</li>
  <li><strong>Auxiliar em sinistros</strong> e processos</li>
  <li><strong>Manter-se atualizado</strong> com a legislação</li>
</ul>

<h3>Órgão Regulador: SUSEP</h3>

<p>A <strong>SUSEP</strong> (Superintendência de Seguros Privados) é o órgão 
responsável pela fiscalização do mercado de seguros no Brasil.</p>

<div class="highlight-box">
  <strong>Marco histórico:</strong> A SUSEP foi criada em 1966 pelo Decreto-Lei 73.
</div>

<div class="image-suggestion" data-suggestion="Logomarca da SUSEP">
  [SUGESTÃO DE IMAGEM: Logo oficial da SUSEP]
</div>

<div class="example-box">
  <strong>⚠️ Importante:</strong> O corretor deve ter registro ativo na SUSEP 
  para exercer legalmente a profissão.
</div>
```

#### **4. Visualizar Preview**

O preview mostra em tempo real:
- ✅ Títulos hierárquicos (H2, H3)
- ✅ Textos formatados
- ✅ Destaques em negrito/marca-texto
- ✅ Listas organizadas
- ✅ Boxes de destaque (amarelo)
- ✅ Boxes de exemplo (azul)
- ✅ **Sugestões de imagem** (azul tracejado)

#### **5. Ver em Tela Cheia**

Clique em "Tela Cheia" para:
- ✅ Ver apostila ocupando toda a tela
- ✅ Simular visualização de impressão
- ✅ Layout de leitura otimizado

#### **6. Imprimir**

Clique em "Imprimir" para:
- ✅ Abrir diálogo de impressão
- ✅ Salvar como PDF
- ✅ Enviar para impressora

#### **7. Salvar**

Clique em "Salvar Apostila":
- ✅ Salva na tabela `apostilas`
- ✅ Vincula ao treinamento
- ✅ Disponível para alunos visualizarem

---

## 🎨 O que a IA Faz Automaticamente

### **1. Estrutura do Documento**
- ✅ Cria hierarquia de títulos (H2, H3)
- ✅ Organiza em seções lógicas
- ✅ Adiciona espaçamento adequado

### **2. Formatação de Texto**
- ✅ Negrito em conceitos importantes
- ✅ Marca-texto para destaques
- ✅ Itálico para citações

### **3. Listas e Organização**
- ✅ Converte enumerações em listas (ul/ol)
- ✅ Organiza tópicos
- ✅ Cria sub-itens quando necessário

### **4. Boxes Especiais**

**Highlight Box (Amarelo):**
```html
<div class="highlight-box">
  Informação importante que merece destaque
</div>
```

**Example Box (Azul):**
```html
<div class="example-box">
  Exemplo prático ou caso de uso
</div>
```

### **5. Sugestões de Imagens** 🖼️

A IA identifica pontos onde uma imagem seria útil e adiciona:

```html
<div class="image-suggestion" data-suggestion="Descrição">
  [SUGESTÃO DE IMAGEM: Gráfico mostrando evolução do mercado]
</div>
```

**Aparece assim:**
```
┌────────────────────────────────────────┐
│                                        │
│   [SUGESTÃO DE IMAGEM]                 │
│   Gráfico mostrando evolução           │
│   do mercado de seguros                │
│                                        │
└────────────────────────────────────────┘
```
(Com fundo azul claro e borda tracejada)

---

## 💡 Exemplos de Uso

### **Caso 1: Manual de Procedimentos**

**Entrada:**
```
Como fazer uma apólice

Primeiro passo é coletar dados do cliente.
Depois verificar disponibilidade.
Por fim emitir a apólice.

Atenção: Sempre conferir os dados antes de emitir.
```

**Saída (IA):**
```html
<h2>Como Emitir uma Apólice</h2>

<h3>Passo a Passo</h3>

<ol>
  <li><strong>Coleta de Dados:</strong> Reúna todas as informações do cliente</li>
  <li><strong>Verificação:</strong> Cheque disponibilidade na seguradora</li>
  <li><strong>Emissão:</strong> Gere a apólice no sistema</li>
</ol>

<div class="highlight-box">
  <strong>⚠️ Atenção:</strong> Sempre confira os dados antes de emitir.
</div>
```

---

### **Caso 2: Glossário Técnico**

**Entrada:**
```
Termos importantes

Apólice é o contrato de seguro.
Sinistro é o evento que gera indenização.
Prêmio é o valor pago pelo segurado.
```

**Saída (IA):**
```html
<h2>Glossário de Termos</h2>

<dl>
  <dt><strong>Apólice</strong></dt>
  <dd>Documento que formaliza o contrato de seguro</dd>
  
  <dt><strong>Sinistro</strong></dt>
  <dd>Evento previsto em contrato que gera direito à indenização</dd>
  
  <dt><strong>Prêmio</strong></dt>
  <dd>Valor pago pelo segurado à seguradora para ter cobertura</dd>
</dl>

<div class="image-suggestion">
  [SUGESTÃO DE IMAGEM: Infográfico com termos e definições]
</div>
```

---

## 📱 Visualizações

### **Modo Editor (Split Screen)**
```
┌─────────────────┬─────────────────┐
│  TEXTO ORIGINAL │  PREVIEW        │
│                 │                 │
│  [textarea]     │  [HTML render]  │
│                 │                 │
│  Cole aqui...   │  ✨ Formatado   │
│                 │                 │
│ [Formatar IA]   │  [Tela Cheia]   │
└─────────────────┴─────────────────┘
```

### **Modo Tela Cheia**
```
┌─────────────────────────────────────┐
│ [Fechar]              [Imprimir]    │
├─────────────────────────────────────┤
│                                     │
│         APOSTILA FORMATADA          │
│         (Layout de leitura)         │
│                                     │
│                                     │
│                                     │
└─────────────────────────────────────┘
```

---

## 🎨 Estilos Aplicados

### **Sugestões de Imagem:**
- Fundo: Gradiente azul claro
- Borda: Tracejada azul
- Texto: Azul (cor primária)
- Padding: Generoso
- Ícone: 🖼️ (visual)

### **Highlight Boxes:**
- Fundo: Amarelo suave (#fff3cd)
- Borda esquerda: Amarelo forte
- Uso: Informações importantes

### **Example Boxes:**
- Fundo: Azul claro (#e7f3ff)
- Borda esquerda: Azul primário
- Uso: Exemplos práticos

### **Títulos:**
- H2: Borda inferior azul
- H3: Margem superior aumentada
- Cores: Azul primário da DF

---

## 📄 Impressão

### **Recursos de Impressão:**

✅ **Formatação A4**
✅ **Quebras de página inteligentes**
✅ **Títulos não ficam sozinhos no final da página**
✅ **Boxes de destaque preservados**
✅ **Sugestões de imagem aparecem** (para marcar onde colocar)
✅ **Fonte otimizada** (12pt)
✅ **Margens adequadas**

### **Como Imprimir:**

1. Clique em "Imprimir" ou "Tela Cheia" → "Imprimir"
2. No diálogo:
   - **Destino:** Salvar como PDF
   - **Layout:** Retrato
   - **Margens:** Padrão
3. Salvar

---

## 🔧 Configuração

### **Arquivos Necessários:**

```
✨ NOVOS:
- src/app/api/gemini/formatar-apostila/route.ts   (API)
- src/app/admin/treinamentos/[id]/apostila/*      (Editor)
- APOSTILAS-COM-IA.md                             (Docs)

📝 ATUALIZADOS:
- package.json                                    (+@google/generative-ai)
- env.example                                     (+GEMINI_API_KEY)
- src/app/globals.css                             (Estilos apostila)
- AdminTreinamentosContent.tsx                    (Botão editor)
```

### **Variáveis de Ambiente:**

```env
# .env.local
GEMINI_API_KEY=AIzaSy...sua_chave_aqui
```

---

## 🚀 Passos para Testar

### **1. Configurar Gemini:**
```bash
# 1. Obter key: https://makersuite.google.com/app/apikey
# 2. Adicionar no .env.local
# 3. Instalar dependências
npm install

# 4. Reiniciar servidor
npm run dev
```

### **2. Criar Apostila:**
1. Admin > Gerenciar Treinamentos
2. Clique no ícone **📄** de um treinamento
3. Cole texto na área de texto
4. Clique em "✨ Formatar com IA"
5. Aguarde ~5-10 segundos
6. **Preview aparece formatado!**

### **3. Revisar e Ajustar:**
- Veja o preview
- Se precisar, edite o texto original
- Clique novamente em "Formatar com IA"

### **4. Salvar:**
- Clique em "💾 Salvar Apostila"
- Toast de sucesso!
- Apostila vinculada ao treinamento

### **5. Visualizar como Aluno:**
- Vá no treinamento (como aluno)
- Clique em "Visualizar Apostila"
- Veja o conteúdo formatado!

---

## 📊 O que o Gemini Identifica

### **Padrões Reconhecidos:**

**Lista de Itens:**
```
- Item 1          →  <ul><li>Item 1</li></ul>
- Item 2
```

**Enumerações:**
```
1. Primeiro       →  <ol><li>Primeiro</li></ol>
2. Segundo
```

**Avisos/Alertas:**
```
Atenção: texto    →  <div class="highlight-box">
Importante: texto     Atenção: texto
                      </div>
```

**Exemplos:**
```
Por exemplo:      →  <div class="example-box">
                      Por exemplo: ...
                      </div>
```

**Conceitos-chave:**
```
SUSEP             →  <strong>SUSEP</strong>
profissional          <strong>profissional</strong>
```

**Pontos para Imagens:**
```
(Contexto visual) →  <div class="image-suggestion">
                      [SUGESTÃO: descrição]
                      </div>
```

---

## 🎯 Sugestões de Imagem Inteligentes

### **A IA sugere imagens em:**

✅ **Após introdução de conceitos novos**
✅ **Antes de explicações detalhadas**
✅ **Ao mencionar processos visuais**
✅ **Em pontos que beneficiam de ilustração**
✅ **Entre seções maiores** (quebra visual)

### **Exemplo:**

Texto menciona "evolução do mercado" → IA sugere:
```
[SUGESTÃO DE IMAGEM: Gráfico de linha mostrando 
crescimento do setor de seguros nos últimos 10 anos]
```

---

## 💾 Salvamento

### **O que é Salvo:**

```sql
INSERT INTO apostilas (
  treinamento_id,
  versao,
  apresentacao,    ← HTML formatado pela IA
  capa,
  watermark,
  ativo,
  created_by
) VALUES (...)
```

### **Versionamento:**

- Cada save cria/atualiza a apostila
- Versão mais recente é exibida aos alunos
- Histórico mantido (futuro)

---

## 📱 Visualização para Alunos

Após salvar, alunos podem:

1. Ir no treinamento
2. Clicar em "Visualizar Apostila"
3. Ver conteúdo formatado
4. Imprimir ou salvar PDF
5. **Sugestões de imagem** aparecem como placeholders

---

## ⚙️ Configurações Avançadas

### **Personalizar Prompt do Gemini:**

Edite `src/app/api/gemini/formatar-apostila/route.ts`:

```ts
// Modelo usado: gemini-1.5-flash (rápido e eficiente)
// Alternativa: gemini-1.5-pro (mais poderoso, mas mais lento)
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

const prompt = `Seu prompt customizado...

Use tom [formal/informal]
Adicione [elementos específicos]
Foco em [público-alvo]
`
```

### **Ajustar Estilos:**

Edite `src/app/globals.css`:

```css
.apostila-content .image-suggestion {
  /* Customize cores, bordas, etc */
}
```

---

## 🎯 Benefícios

### **Para Admins:**
- ✅ Criação rápida de apostilas (minutos vs horas)
- ✅ Formatação profissional automática
- ✅ Sugestões de onde adicionar recursos visuais
- ✅ Sem precisar saber HTML/CSS

### **Para Alunos:**
- ✅ Conteúdo bem estruturado
- ✅ Fácil de ler e navegar
- ✅ Visual profissional
- ✅ Imprimível

### **Para a DF:**
- ✅ Padronização de material
- ✅ Identidade visual consistente
- ✅ Escalabilidade na criação de conteúdo

---

## 🔍 Troubleshooting

### **✨ NOVO: Sistema com Fallback Automático**

O sistema **tenta automaticamente 4 modelos diferentes**:
1. `gemini-1.5-flash-latest` ⚡
2. `gemini-1.5-flash`
3. `gemini-1.5-pro-latest` 🎯
4. `gemini-pro` (legado)

Se um modelo falhar, tenta o próximo automaticamente!

**Ver qual modelo funcionou:** Olhe o terminal do servidor:
```
✅ Conteúdo gerado com sucesso usando: gemini-1.5-flash-latest
```

### **Erro: "GEMINI_API_KEY não configurada"**
→ Adicione a chave no `.env.local` e reinicie o servidor

### **Erro: "Todos os modelos falharam"**
→ Gere nova API Key: https://makersuite.google.com/app/apikey
→ Substitua no `.env.local` e reinicie

### **Erro: "Quota exceeded"**
→ Limite gratuito atingido (60 req/min)
→ Aguarde reset ou upgrade para plano pago

### **Erro: API Key inválida**
→ Gere nova chave (link acima)
→ Copie corretamente (sem espaços) no `.env.local`
→ Reinicie: Ctrl+C e `npm run dev`

### **IA não formata bem**
→ Use texto mais estruturado, com parágrafos claros
→ Adicione quebras de linha entre seções
→ Mínimo 3-4 parágrafos para melhor resultado

### **Preview não aparece**
→ Abra console (F12) e veja erros
→ Verifique terminal do servidor
→ Tente texto mais simples primeiro

### **Hydration Mismatch Warning**
→ Causado por extensões do navegador (LastPass, etc.)
→ Não afeta funcionalidade, pode ignorar

---

### 📘 **Guia Completo de Troubleshooting**
Para soluções detalhadas, consulte: **`GEMINI-TROUBLESHOOTING.md`**

---

## 📈 Próximas Melhorias (Opcional)

- [ ] Upload de imagens para substituir sugestões
- [ ] Editor visual com drag & drop
- [ ] Templates pré-definidos
- [ ] Exportação direta para PDF
- [ ] Múltiplos idiomas
- [ ] Revisão por IA (correção ortográfica)

---

## 🎉 Resultado Final

**Você tem agora:**

✅ Editor de texto simples
✅ Botão mágico de formatação com IA
✅ Preview em tempo real
✅ Modo tela cheia
✅ Impressão otimizada
✅ Salvamento no banco
✅ Disponível para alunos

**Fluxo completo:** Texto simples → IA formata → Preview → Salvar → Alunos acessam

---

**Sistema de apostilas com IA implementado!** 🤖✨

*Transforme textos simples em apostilas profissionais em segundos!*

---

## 📝 Instruções Rápidas

```bash
# 1. Obter API Key
https://makersuite.google.com/app/apikey

# 2. Adicionar no .env.local
GEMINI_API_KEY=sua_chave

# 3. Instalar e reiniciar
npm install
npm run dev

# 4. Testar
Admin > Treinamento > [📄] > Cole texto > [✨ Formatar]
```

**Pronto para usar!** 🚀

