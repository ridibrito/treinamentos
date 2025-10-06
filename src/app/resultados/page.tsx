import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ResultadosContent } from './ResultadosContent'

export default async function ResultadosPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  // Buscar perfil
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  
  if (!profile) {
    redirect('/login')
  }
  
  // Buscar todos os resultados do usuário
  const { data: resultados } = await supabase
    .from('resultados')
    .select(`
      *,
      testes:testes(
        titulo,
        modulos:modulos(
          titulo,
          treinamentos:treinamentos(
            id,
            titulo,
            categoria
          )
        )
      )
    `)
    .eq('user_id', user.id)
    .order('data', { ascending: false })
  
  const profileWithEmail = {
    ...profile,
    email: user.email
  }
  
  return (
    <ResultadosContent
      profile={profileWithEmail}
      resultados={resultados || []}
    />
  )
}

