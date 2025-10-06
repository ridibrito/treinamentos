import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import GerenciarTreinamentoContent from './GerenciarTreinamentoContent'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function GerenciarTreinamentoPage({ params }: PageProps) {
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
  
  if (!profile || profile.role !== 'admin') {
    redirect('/dashboard')
  }
  
  // Buscar treinamento com módulos, slides e testes
  const { data: treinamento } = await supabase
    .from('treinamentos')
    .select(`
      *,
      modulos:modulos(
        *,
        slides:slides(count),
        testes:testes(id, titulo)
      )
    `)
    .eq('id', id)
    .single()
  
  if (!treinamento) {
    notFound()
  }
  
  // Ordenar módulos por ordem
  treinamento.modulos = treinamento.modulos?.sort((a: any, b: any) => a.ordem - b.ordem) || []
  
  const profileWithEmail = {
    ...profile,
    email: user.email
  }
  
  return (
    <GerenciarTreinamentoContent
      profile={profileWithEmail}
      treinamento={treinamento}
    />
  )
}

