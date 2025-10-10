import { NextRequest } from 'next/server'
import { createClient as createServerSupabase } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return new Response(JSON.stringify({ error: 'Não autenticado' }), { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Acesso negado' }), { status: 403 })
    }

    const body = await req.json()
    const { nome, email, role, senha } = body as { nome: string; email: string; role: 'aluno' | 'palestrante' | 'admin'; senha: string }

    if (!nome || !email || !role) {
      return new Response(JSON.stringify({ error: 'Campos obrigatórios ausentes' }), { status: 400 })
    }

    const admin = createAdminClient()

    // Cria o usuário no Auth com metadata
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password: senha || Math.random().toString(36).slice(2, 10),
      email_confirm: true,
      user_metadata: { nome, role }
    })

    if (createErr) {
      return new Response(JSON.stringify({ error: createErr.message }), { status: 400 })
    }

    const userId = created.user?.id
    if (!userId) {
      return new Response(JSON.stringify({ error: 'Falha ao criar usuário' }), { status: 500 })
    }

    // Garante consistência no profile
    const { error: upErr } = await admin
      .from('profiles')
      .update({ nome, role })
      .eq('id', userId)

    if (upErr) {
      return new Response(JSON.stringify({ error: upErr.message }), { status: 400 })
    }

    return new Response(JSON.stringify({ ok: true, id: userId }), { status: 201 })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message || 'Erro interno' }), { status: 500 })
  }
}


