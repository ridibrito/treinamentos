import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { DashboardContent } from './DashboardContent'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect('/login')
  }
  
  // Buscar perfil do usuário
  let { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  
  // Se não tem profile, tentar criar um
  if (!profile) {
    console.log('Profile não encontrado, tentando criar...')
    
    // Usar service role para criar profile (bypass RLS)
    const supabaseAdmin = await createClient()
    
    const { data: newProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: user.id,
        nome: user.email?.split('@')[0] || 'Usuário',
        role: 'aluno'
      })
      .select()
      .single()
    
    if (profileError) {
      console.error('Erro ao criar profile:', profileError)
      
      // Se falhou, mostrar erro melhor
      throw new Error(`Erro ao criar perfil: ${profileError.message}. Execute o SQL: supabase-schema.sql no Supabase Dashboard.`)
    }
    
    console.log('Profile criado com sucesso:', newProfile)
    profile = newProfile
  }
  
  // Buscar treinamentos ativos
  const { data: treinamentos } = await supabase
    .from('treinamentos')
    .select(`
      *,
      modulos:modulos(count)
    `)
    .eq('ativo', true)
    .order('created_at', { ascending: false })
  
  // Buscar progresso do usuário
  const { data: progresso } = await supabase
    .from('progresso_treinamento')
    .select('*')
    .eq('user_id', user.id)
  
  // Buscar resultados do usuário
  const { data: resultados } = await supabase
    .from('resultados')
    .select(`
      *,
      testes:testes(
        titulo,
        modulos:modulos(
          titulo,
          treinamentos:treinamentos(titulo)
        )
      )
    `)
    .eq('user_id', user.id)
    .order('data', { ascending: false })
    .limit(5)
  
  // Adicionar email ao profile
  const profileWithEmail = {
    ...profile,
    email: user.email
  }
  
  return (
    <DashboardContent
      profile={profileWithEmail}
      treinamentos={treinamentos || []}
      progresso={progresso || []}
      resultados={resultados || []}
    />
  )
}

