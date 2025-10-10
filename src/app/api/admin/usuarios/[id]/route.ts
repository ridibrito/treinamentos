import { NextRequest } from 'next/server'
import { createClient as createServerSupabase } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function assertAdmin() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { status: 401 as const, error: 'Não autenticado' }
  }
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  if (!profile || profile.role !== 'admin') {
    return { status: 403 as const, error: 'Acesso negado' }
  }
  return { status: 200 as const }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await assertAdmin()
  if (auth.status !== 200) {
    return new Response(JSON.stringify({ error: auth.error }), { status: auth.status })
  }
  try {
    const id = params.id
    const body = await req.json()
    const { nome, role } = body as { nome?: string; role?: 'aluno' | 'palestrante' | 'admin' }

    const admin = createAdminClient()

    if (role || nome) {
      const { error: upErr } = await admin
        .from('profiles')
        .update({ ...(nome ? { nome } : {}), ...(role ? { role } : {}) })
        .eq('id', id)
      if (upErr) {
        return new Response(JSON.stringify({ error: upErr.message }), { status: 400 })
      }

      // Sincroniza metadados no Auth
      const { error: authErr } = await admin.auth.admin.updateUserById(id, {
        user_metadata: { ...(nome ? { nome } : {}), ...(role ? { role } : {}) }
      })
      if (authErr) {
        return new Response(JSON.stringify({ error: authErr.message }), { status: 400 })
      }
    }

    return new Response(JSON.stringify({ ok: true }))
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message || 'Erro interno' }), { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await assertAdmin()
  if (auth.status !== 200) {
    return new Response(JSON.stringify({ error: auth.error }), { status: auth.status })
  }
  try {
    const id = params.id
    const admin = createAdminClient()
    const { error: delErr } = await admin.auth.admin.deleteUser(id)
    if (delErr) {
      return new Response(JSON.stringify({ error: delErr.message }), { status: 400 })
    }
    return new Response(JSON.stringify({ ok: true }))
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message || 'Erro interno' }), { status: 500 })
  }
}


