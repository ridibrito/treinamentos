# 📧 Guia de Implementação: Notificações por Email

## 🎯 Objetivo

Enviar emails automáticos para alunos em eventos importantes (novo treinamento, conclusão, etc).

---

## 🚀 Opção Recomendada: Supabase Edge Functions + Resend

### **Por quê Resend?**
- ✅ Gratuito até 3000 emails/mês
- ✅ Fácil de integrar
- ✅ Templates em React
- ✅ Alta entregabilidade
- ✅ API simples

---

## 📝 Passo a Passo

### **1. Criar conta no Resend**

```
https://resend.com/signup
```

1. Crie conta gratuita
2. Verifique domínio (ou use sandbox)
3. Gere API Key
4. Copie a key

### **2. Adicionar ao .env.local**

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
```

### **3. Criar Edge Function no Supabase**

No Supabase Dashboard:
```
Database → Edge Functions → New Function
```

Nome: `enviar-email-treinamento`

Código:
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!

serve(async (req) => {
  const { email, nome, treinamento, tipo } = await req.json()
  
  const templates = {
    'novo-treinamento': {
      subject: `🎓 Novo Treinamento Disponível: ${treinamento.titulo}`,
      html: `
        <h2>Olá, ${nome}!</h2>
        <p>Um novo treinamento está disponível para você:</p>
        <h3>${treinamento.titulo}</h3>
        <p>${treinamento.descricao}</p>
        <a href="https://seudominio.com/treinamentos/${treinamento.id}">
          Iniciar Treinamento
        </a>
      `
    },
    'conclusao': {
      subject: `🎉 Parabéns! Você concluiu: ${treinamento.titulo}`,
      html: `
        <h2>Parabéns, ${nome}!</h2>
        <p>Você concluiu o treinamento: <strong>${treinamento.titulo}</strong></p>
        <p>Continue sua jornada de aprendizado!</p>
      `
    },
    'lembrete': {
      subject: `⏰ Lembrete: Continue seu treinamento ${treinamento.titulo}`,
      html: `
        <h2>Olá, ${nome}!</h2>
        <p>Você começou mas ainda não concluiu:</p>
        <h3>${treinamento.titulo}</h3>
        <p>Continue de onde parou!</p>
      `
    }
  }
  
  const template = templates[tipo as keyof typeof templates]
  
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_API_KEY}`
    },
    body: JSON.stringify({
      from: 'DF Treinamentos <noreply@dfcorretora.com>',
      to: email,
      subject: template.subject,
      html: template.html
    })
  })
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

### **4. Chamar do Frontend**

```typescript
// Quando criar novo treinamento:
await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/enviar-email-treinamento`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${anonKey}`
  },
  body: JSON.stringify({
    email: aluno.email,
    nome: aluno.nome,
    treinamento: { id, titulo, descricao },
    tipo: 'novo-treinamento'
  })
})
```

---

## 📋 Eventos para Notificar

### **1. Novo Treinamento Criado**
**Quando:** Admin publica novo treinamento  
**Para:** Todos os alunos  
**Template:** novo-treinamento

### **2. Conclusão de Treinamento**
**Quando:** Aluno completa 100% + teste  
**Para:** O aluno específico  
**Template:** conclusao

### **3. Lembrete de Pendência**
**Quando:** Aluno não acessa há 7 dias  
**Para:** Alunos com treinamentos iniciados  
**Template:** lembrete

### **4. Certificado Pronto**
**Quando:** Aluno atinge 100% + nota ≥70%  
**Para:** O aluno  
**Template:** certificado (com anexo PDF)

---

## 🎨 Templates Profissionais

### **Usar react-email:**

```bash
npm install react-email @react-email/components
```

```tsx
// emails/NovoTreinamento.tsx
import {
  Html,
  Head,
  Body,
  Container,
  Heading,
  Text,
  Button
} from '@react-email/components'

export default function NovoTreinamento({ nome, treinamento }) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'Arial, sans-serif' }}>
        <Container>
          <Heading>Olá, {nome}!</Heading>
          <Text>Novo treinamento disponível:</Text>
          <Heading level={2}>{treinamento.titulo}</Heading>
          <Text>{treinamento.descricao}</Text>
          <Button href={`https://seudominio.com/treinamentos/${treinamento.id}`}>
            Iniciar Treinamento
          </Button>
        </Container>
      </Body>
    </Html>
  )
}
```

---

## ⚙️ Automação com Database Triggers

### **Trigger no Supabase:**

```sql
-- Enviar email quando novo treinamento é criado
CREATE OR REPLACE FUNCTION notify_new_training()
RETURNS TRIGGER AS $$
BEGIN
  -- Chamar Edge Function para todos os alunos
  PERFORM 
    net.http_post(
      url := 'https://[project-ref].supabase.co/functions/v1/enviar-email-treinamento',
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := json_build_object(
        'treinamento_id', NEW.id,
        'tipo', 'novo-treinamento'
      )::jsonb
    );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_training_created
  AFTER INSERT ON treinamentos
  FOR EACH ROW
  WHEN (NEW.ativo = true)
  EXECUTE FUNCTION notify_new_training();
```

---

## 💰 Custos

### **Resend (Recomendado):**
- Grátis: 3.000 emails/mês
- Pro: $20/mês = 50.000 emails
- **Para DF:** Grátis suficiente!

### **Alternativas:**
- SendGrid: 100 emails/dia grátis
- Amazon SES: $0.10 por 1.000 emails
- Postmark: $10/mês = 10.000 emails

---

## 📧 Exemplo Completo de Implementação

### **Arquivo: src/lib/email.ts**

```typescript
export async function enviarEmail(
  para: string,
  assunto: string,
  html: string
) {
  const response = await fetch('/api/email/enviar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ para, assunto, html })
  })
  
  if (!response.ok) {
    throw new Error('Falha ao enviar email')
  }
  
  return response.json()
}

// Usar:
await enviarEmail(
  'aluno@example.com',
  'Novo Treinamento Disponível',
  '<h2>Confira o novo treinamento...</h2>'
)
```

---

## ✅ Checklist de Implementação

- [ ] Criar conta no Resend
- [ ] Gerar API Key
- [ ] Adicionar ao .env.local
- [ ] Criar Edge Function no Supabase
- [ ] Criar templates de email
- [ ] Implementar triggers ou chamadas manuais
- [ ] Testar envio
- [ ] Configurar domínio (produção)

---

## 🎯 Tempo Estimado

- Configuração inicial: **30 minutos**
- Criar templates: **1-2 horas**
- Integrar com sistema: **2-3 horas**
- Testar: **30 minutos**

**Total:** ~4-6 horas para sistema completo de emails

---

**Guia completo para quando quiser implementar!** 📧✨

