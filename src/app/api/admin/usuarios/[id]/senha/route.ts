import { NextRequest } from 'next/server'
import { createClient as createServerSupabase } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
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

  try {
    const { senha } = await req.json() as { senha: string }
    if (!senha || senha.length < 6) {
      return new Response(JSON.stringify({ error: 'Senha inválida (mínimo 6 caracteres)' }), { status: 400 })
    }
    const admin = createAdminClient()
    const { error } = await admin.auth.admin.updateUserById(params.id, { password: senha })
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400 })
    }
    return new Response(JSON.stringify({ ok: true }))
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message || 'Erro interno' }), { status: 500 })
  }
}


