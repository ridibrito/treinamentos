# 🚀 Guia Rápido - DF Treinamentos

## ⚡ Comece a Usar em 5 Minutos!

---

## 📝 PASSO 1: Aplicar Migration (1x apenas)

No **Supabase SQL Editor**, execute:

```sql
-- Arquivo: migrations/criar-certificados.sql
```

Copie e cole o conteúdo completo do arquivo e execute.

✅ **Feito!** Tabela de certificados criada.

---

## 👨‍💼 PASSO 2: Criar sua conta Admin

1. **Acesse:** `http://localhost:3000/cadastro`
2. **Clique** no card "Administrador"
3. **Preencha:**
   - Nome: Seu nome
   - Email: seu@email.com
   - Empresa: DF Corretora
   - Cargo: Gestor de Treinamentos
   - Senha: mínimo 6 caracteres
4. **Crie** e faça **login**

---

## 📚 PASSO 3: Criar seu Primeiro Treinamento

1. **Admin > Gerenciar Treinamentos**
2. **Clique em "Novo Treinamento"**
3. **Wizard - Etapa 1 (Dados Básicos):**
   - Título: "Introdução à Corretagem"
   - Descrição: "Aprenda os fundamentos..."
   - Categoria: "Técnico"
   - Duração: "2 horas"
   - Imagem: URL de uma imagem (opcional)
   - ✅ Ativo
   - **Próximo →**

4. **Wizard - Etapa 2 (Tipo):**
   - Escolha: **"Apresentação de Slides"**
   - **Próximo →**

5. **Wizard - Etapa 3 (Módulos):**
   - **Adicionar Módulo**
   - Título: "Módulo 1 - O que é Corretagem"
   - Descrição: "Conceitos básicos"
   - **Adicionar Módulo** (novamente)
   - Título: "Módulo 2 - Legislação"
   - **Criar Treinamento** ✅

---

## 🎨 PASSO 4: Adicionar Slides aos Módulos

1. **Admin > Gerenciar Treinamentos**
2. **Clique no ⚙️** (Gerenciar Módulos) do treinamento
3. **Para cada módulo:**
   - Clique em **"Adicionar Slides"**
   - **Adicionar Slide**
   - Título: "Slide 1 - Introdução"
   - Conteúdo (HTML):
   ```html
   <h2>Bem-vindo ao Treinamento!</h2>
   <p>Neste módulo você aprenderá:</p>
   <ul>
     <li>Conceitos fundamentais</li>
     <li>Legislação aplicável</li>
     <li>Boas práticas</li>
   </ul>
   ```
   - **Adicionar Slide** (adicione mais 2-3)
   - **Salvar Slides** ✅

---

## ✍️ PASSO 5: Criar Teste para o Módulo

1. **Ainda na tela de gerenciamento**
2. **Clique em "Criar Teste"**
3. **Configurações:**
   - Título: "Avaliação - Conceitos Básicos"
   - Tempo: 10 minutos
   - Nota mínima: 70%
   
4. **Adicionar Questões:**
   
   **Questão 1 - Múltipla Escolha:**
   - Clique: **"+ Múltipla Escolha"**
   - Enunciado: "Qual órgão regula a corretagem no Brasil?"
   - A) CVM
   - B) SUSEP ← Marque como correta
   - C) Banco Central
   - D) CADE
   - Pontos: 1.0
   
   **Questão 2 - Verdadeiro ou Falso:**
   - Clique: **"+ V ou F"**
   - Enunciado: "O corretor pode trabalhar sem registro na SUSEP"
   - Resposta: **Falso** ← Marque
   - Pontos: 1.0
   
   **Questão 3 - Dissertativa:**
   - Clique: **"+ Dissertativa"**
   - Enunciado: "Explique o papel do corretor de seguros"
   - Pontos: 2.0

5. **Salvar Teste** ✅

---

## 🎓 PASSO 6: Testar como Aluno

1. **Abra em aba anônima** (ou outro navegador)
2. **Cadastre-se como Aluno**
3. **Login**
4. **Dashboard** → veja o treinamento
5. **Entre no treinamento**
6. **Acesse Módulo 1**
7. **Veja os slides** que você criou
8. **Marque como concluído**
9. **Clique em "Fazer Teste"** ✅
10. **Responda as questões**
11. **Envie** e **veja sua nota**
12. **Complete todos os módulos**
13. **Volte para o treinamento**
14. **GERE SEU CERTIFICADO!** 🎉

---

## 🏆 RESULTADO ESPERADO

Ao final, o aluno terá:

✅ **Acessado** o treinamento  
✅ **Estudado** todos os slides  
✅ **Feito** todos os testes  
✅ **Recebido** notas  
✅ **Gerado** certificado oficial  
✅ **Baixado** certificado em PDF  

---

## 🎯 ATALHOS RÁPIDOS

### **Admin:**
```
Gerenciar Treinamentos: /admin/treinamentos
Criar Treinamento: /admin/treinamentos/criar
Gerenciar Módulos: /admin/treinamentos/[id]/gerenciar
Criar Slides: /admin/treinamentos/[id]/modulos/[moduloId]/slides
Criar Teste: /admin/treinamentos/[id]/modulos/[moduloId]/criar-teste
```

### **Aluno:**
```
Dashboard: /dashboard
Treinamento: /treinamentos/[id]
Módulo: /treinamentos/[id]/modulos/[moduloId]
Teste: /treinamentos/[id]/modulos/[moduloId]/teste
Certificado: /certificados/[treinamentoId]
```

---

## 💡 DICAS

### **Para Slides:**
- Use HTML simples: `<h2>`, `<p>`, `<ul>`, `<strong>`
- Adicione imagens com `<img src="URL" />`
- Mantenha slides concisos (1 ideia por slide)

### **Para Testes:**
- 3-5 questões por módulo é ideal
- Misture tipos de questões
- Nota mínima 70% é padrão DF

### **Para Certificados:**
- Aluno precisa 100% + aprovação em testes
- Código de validação é único
- PDF via impressão do navegador

---

## ❓ TROUBLESHOOTING

### **"Botão de teste não aparece"**
→ Certifique-se que criou o teste no módulo

### **"Não consigo gerar certificado"**
→ Verifique se completou 100% dos módulos e passou nos testes

### **"Slides não aparecem"**
→ Adicione slides na interface de gerenciamento

---

## ✅ TUDO PRONTO!

Agora você tem uma **plataforma completa de treinamentos**!

**Comece a criar conteúdo e treinar sua equipe!** 🎓✨

