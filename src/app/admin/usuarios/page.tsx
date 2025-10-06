import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { UsuariosContent } from './UsuariosContent'

export default async function UsuariosPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  
  if (!profile || profile.role !== 'admin') {
    redirect('/dashboard')
  }
  
  // Buscar todos os usuários
  const { data: usuarios } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
  
  // Buscar progresso de cada usuário
  const { data: progressoData } = await supabase
    .from('progresso_treinamento')
    .select('user_id, concluido')
  
  // Buscar resultados de cada usuário
  const { data: resultadosData } = await supabase
    .from('resultados')
    .select('user_id, pontuacao, aprovado')
  
  const profileWithEmail = {
    ...profile,
    email: user.email
  }
  
  return (
    <UsuariosContent
      profile={profileWithEmail}
      usuarios={usuarios || []}
      progressoData={progressoData || []}
      resultadosData={resultadosData || []}
    />
  )
}

