import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TreinamentoContent } from './TreinamentoContent'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function TreinamentoPage({ params }: PageProps) {
  const { id } = await params
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
  
  // Buscar treinamento com módulos
  const { data: treinamento, error } = await supabase
    .from('treinamentos')
    .select(`
      *,
      modulos:modulos(
        id,
        titulo,
        descricao,
        ordem,
        duracao,
        testes:testes(id, titulo)
      )
    `)
    .eq('id', id)
    .eq('ativo', true)
    .single()
  
  if (error || !treinamento) {
    notFound()
  }
  
  // Ordenar módulos
  treinamento.modulos = treinamento.modulos.sort((a: any, b: any) => a.ordem - b.ordem)
  
  // Buscar progresso do usuário
  const { data: progresso } = await supabase
    .from('progresso_treinamento')
    .select('*')
    .eq('user_id', user.id)
    .eq('treinamento_id', id)
  
  // Buscar apostila se existir
  const { data: apostila } = await supabase
    .from('apostilas')
    .select('*, arquivos:apostilas_arquivos(*)')
    .eq('treinamento_id', id)
    .eq('ativo', true)
    .order('versao', { ascending: false })
    .limit(1)
    .single()
  
  const profileWithEmail = {
    ...profile,
    email: user.email
  }
  
  return (
    <TreinamentoContent
      profile={profileWithEmail}
      treinamento={treinamento}
      progresso={progresso || []}
      apostila={apostila}
    />
  )
}

