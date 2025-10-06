import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ApresentacaoContent } from './ApresentacaoContent'

interface PageProps {
  params: Promise<{
    id: string
    moduloId: string
  }>
}

export default async function ApresentacaoPage({ params }: PageProps) {
  const { id, moduloId } = await params
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
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
  
  if (modulo.treinamento_id !== id) {
    notFound()
  }
  
  // Ordenar slides
  modulo.slides = modulo.slides.sort((a: any, b: any) => a.ordem - b.ordem)
  
  return <ApresentacaoContent modulo={modulo} />
}

