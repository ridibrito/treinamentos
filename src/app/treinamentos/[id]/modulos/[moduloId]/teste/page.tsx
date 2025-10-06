import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TesteContent } from './TesteContent'

interface PageProps {
  params: Promise<{
    id: string
    moduloId: string
  }>
}

export default async function TestePage({ params }: PageProps) {
  const { id, moduloId } = await params
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
  
  // Buscar módulo
  const { data: modulo } = await supabase
    .from('modulos')
    .select(`
      *,
      treinamentos:treinamentos(id, titulo)
    `)
    .eq('id', moduloId)
    .single()
  
  if (!modulo || modulo.treinamento_id !== id) {
    notFound()
  }
  
  // Buscar teste com questões
  const { data: teste, error } = await supabase
    .from('testes')
    .select(`
      *,
      questoes:questoes(*)
    `)
    .eq('modulo_id', moduloId)
    .single()
  
  if (error || !teste) {
    notFound()
  }
  
  // Ordenar questões
  teste.questoes = teste.questoes.sort((a: any, b: any) => a.ordem - b.ordem)
  
  // Verificar se já fez o teste
  const { data: resultado } = await supabase
    .from('resultados')
    .select('*')
    .eq('user_id', user.id)
    .eq('teste_id', teste.id)
    .order('data', { ascending: false })
    .limit(1)
    .single()
  
  const profileWithEmail = {
    ...profile,
    email: user.email
  }
  
  return (
    <TesteContent
      profile={profileWithEmail}
      modulo={modulo}
      teste={teste}
      resultadoAnterior={resultado}
    />
  )
}

