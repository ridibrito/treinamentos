import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import GerenciarSlidesContent from './GerenciarSlidesContent'

interface PageProps {
  params: Promise<{
    id: string
    moduloId: string
  }>
}

export default async function GerenciarSlidesPage({ params }: PageProps) {
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
  
  if (!profile || profile.role !== 'admin') {
    redirect('/dashboard')
  }
  
  // Buscar módulo
  const { data: modulo } = await supabase
    .from('modulos')
    .select(`
      *,
      treinamentos:treinamento_id(id, titulo),
      slides:slides(*)
    `)
    .eq('id', moduloId)
    .single()
  
  if (!modulo || modulo.treinamento_id !== id) {
    notFound()
  }
  
  // Ordenar slides por ordem
  modulo.slides = modulo.slides?.sort((a: any, b: any) => a.ordem - b.ordem) || []
  
  const profileWithEmail = {
    ...profile,
    email: user.email
  }
  
  return (
    <GerenciarSlidesContent
      profile={profileWithEmail}
      modulo={modulo}
      treinamentoId={id}
    />
  )
}

