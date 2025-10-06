import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ModuloContent } from './ModuloContent'

interface PageProps {
  params: Promise<{
    id: string
    moduloId: string
  }>
}

export default async function ModuloPage({ params }: PageProps) {
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
  
  // Buscar módulo com slides
  const { data: modulo, error } = await supabase
    .from('modulos')
    .select(`
      *,
      treinamentos:treinamentos(id, titulo),
      slides:slides(*)
    `)
    .eq('id', moduloId)
    .single()
  
  if (error || !modulo) {
    notFound()
  }
  
  // Verificar se o módulo pertence ao treinamento correto
  if (modulo.treinamento_id !== id) {
    notFound()
  }
  
  // Ordenar slides
  modulo.slides = modulo.slides.sort((a: any, b: any) => a.ordem - b.ordem)
  
  // Buscar teste do módulo
  const { data: teste } = await supabase
    .from('testes')
    .select('*')
    .eq('modulo_id', moduloId)
    .single()
  
  // Buscar progresso
  const { data: progresso } = await supabase
    .from('progresso_treinamento')
    .select('*')
    .eq('user_id', user.id)
    .eq('modulo_id', moduloId)
    .single()
  
  const profileWithEmail = {
    ...profile,
    email: user.email
  }
  
  return (
    <ModuloContent
      profile={profileWithEmail}
      modulo={modulo}
      teste={teste}
      progresso={progresso}
    />
  )
}

