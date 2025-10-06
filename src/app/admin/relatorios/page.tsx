import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { RelatoriosContent } from './RelatoriosContent'

export default async function RelatoriosPage() {
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
  
  // Buscar estatísticas gerais
  const { count: totalUsuarios } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
  
  const { count: totalTreinamentos } = await supabase
    .from('treinamentos')
    .select('*', { count: 'exact', head: true })
  
  const { count: totalTestes } = await supabase
    .from('resultados')
    .select('*', { count: 'exact', head: true })
  
  const { data: resultados } = await supabase
    .from('resultados')
    .select(`
      *,
      profiles:profiles(nome),
      testes:testes(
        titulo,
        modulos:modulos(
          titulo,
          treinamentos:treinamentos(titulo, categoria)
        )
      )
    `)
    .order('data', { ascending: false })
    .limit(100)
  
  const profileWithEmail = {
    ...profile,
    email: user.email
  }
  
  return (
    <RelatoriosContent
      profile={profileWithEmail}
      stats={{
        totalUsuarios: totalUsuarios || 0,
        totalTreinamentos: totalTreinamentos || 0,
        totalTestes: totalTestes || 0
      }}
      resultados={resultados || []}
    />
  )
}

