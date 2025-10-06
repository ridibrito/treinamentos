# 👨‍🏫 Análise: Perfil Palestrante

## 🔍 SITUAÇÃO ATUAL

### **Palestrante hoje:**
- ✅ Faz login
- ✅ Vê dashboard (igual aluno)
- ✅ Acessa treinamentos (igual aluno)
- ✅ Faz testes (igual aluno)
- ❌ **Nenhuma funcionalidade exclusiva**

### **Conclusão:**
**Palestrante = Aluno** (interface idêntica)

---

## 💡 OPÇÃO A: Simplificar (Remover Palestrante)

### **Estrutura:**
```
Admin (Gerencia tudo)
  ↓
Aluno (Aprende)
```

### **Por quê?**
- ✅ Mais simples de gerenciar
- ✅ Sem perfil "inútil"
- ✅ Foco em quem cria (admin) e quem aprende (aluno)
- ✅ Se alguém precisa apresentar, pode usar conta de aluno

### **Mudanças:**
1. Remover opção "Palestrante" do cadastro
2. Atualizar sidebar (remover roles)
3. Simplificar documentação

---

## 🚀 OPÇÃO B: Dar Poderes ao Palestrante

### **Estrutura:**
```
Admin (Gerencia tudo)
  ↓
Palestrante (Apresenta + Monitora)
  ↓
Aluno (Aprende)
```

### **Funcionalidades exclusivas para Palestrante:**

#### **1. Dashboard de Palestrante**
```
┌─────────────────────────────────────┐
│ 📊 Seus Treinamentos                │
├─────────────────────────────────────┤
│ • Treinamento A: 15 alunos ativos   │
│   - 8 concluíram                    │
│   - 7 em andamento                  │
│   - Média de notas: 85%             │
│                                     │
│ • Treinamento B: 22 alunos ativos   │
│   - 12 concluíram                   │
│   - 10 em andamento                 │
│   - Média de notas: 78%             │
└─────────────────────────────────────┘
```

#### **2. Acompanhamento de Alunos**
```
/palestrante/treinamentos/[id]/alunos

┌────────────────────────────────────┐
│ Alunos - Introdução à Corretagem   │
├────────────────────────────────────┤
│ 👤 João Silva                      │
│    Progresso: 75% | Nota: 85%     │
│    Último acesso: Hoje             │
├────────────────────────────────────┤
│ 👤 Maria Santos                    │
│    Progresso: 100% | Nota: 92%    │
│    Certificado: ✅ Emitido        │
└────────────────────────────────────┘
```

#### **3. Correção de Questões Dissertativas**
```
/palestrante/corrigir

Lista de questões dissertativas pendentes
Palestrante dá nota manualmente
Sistema registra quem corrigiu
```

#### **4. Permissões Intermediárias**
- ✅ Ver progresso de SEUS alunos
- ✅ Corrigir questões dissertativas
- ✅ Gerar relatórios básicos
- ❌ Criar/editar treinamentos (só admin)
- ❌ Gerenciar usuários (só admin)

---

## 🎯 MINHA RECOMENDAÇÃO

### **Para DF Corretora: OPÇÃO A (Simplificar)**

**Por quê:**
1. **Uso real:** Palestrantes podem usar conta de aluno
2. **Gestão:** Admin controla tudo
3. **Simplicidade:** Menos papéis = menos confusão
4. **Foco:** Quem cria vs quem aprende

### **Quando usar Opção B:**
- Se você tem **instrutores externos** que precisam monitorar
- Se quer **delegar** a correção de dissertativas
- Se precisa **relatórios separados** por instrutor

---

## 🔄 IMPLEMENTAÇÃO OPÇÃO A (Simplificar)

### **Mudanças necessárias:**

**1. Cadastro (src/app/cadastro/page.tsx)**
```tsx
// Remover card de Palestrante
// Deixar apenas: Aluno e Admin
```

**2. Sidebar (src/components/layout/Sidebar.tsx)**
```tsx
roles: ['admin', 'aluno']  // Remove 'palestrante'
```

**3. Types**
```tsx
type Role = 'admin' | 'aluno'  // Remove 'palestrante'
```

**4. Banco (supabase-schema.sql)**
```sql
-- Manter palestrante no CHECK (pra não quebrar dados antigos)
-- Mas não oferecer no cadastro
```

---

## 🚀 IMPLEMENTAÇÃO OPÇÃO B (Dar Poderes)

### **Páginas a criar:**

1. **Dashboard Palestrante**
   - `/palestrante/dashboard`
   - Lista treinamentos que ministra
   - Estatísticas de alunos

2. **Acompanhamento**
   - `/palestrante/treinamentos/[id]/alunos`
   - Lista alunos inscritos
   - Progresso individual
   - Notas

3. **Correção**
   - `/palestrante/corrigir`
   - Fila de dissertativas
   - Interface de correção

4. **Relatórios**
   - `/palestrante/relatorios`
   - Por treinamento
   - Por período

**Tempo estimado:** ~6-8 horas

---

## 🎯 PERGUNTA PARA VOCÊ

**Qual opção prefere?**

### **A) Simplificar (só Admin e Aluno)** ⭐ Recomendado
- Rápido (30 min de ajustes)
- Simples de gerenciar
- Suficiente para maioria dos casos

### **B) Dar Poderes ao Palestrante**
- Mais completo
- Bom para instrutores externos
- Requer mais desenvolvimento

---

## 💬 Minha Sugestão

Para **DF Corretora**, começaria com **Opção A**:
- Admins criam e gerenciam
- Alunos aprendem
- Simples e eficiente

Depois, se surgir necessidade (ex: contratar instrutores externos), implementamos **Opção B**.

**O que você acha?** 🤔

