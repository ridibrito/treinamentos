import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ApostilaView } from './ApostilaView'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ApostilaPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  // Buscar treinamento com módulos e slides
  const { data: treinamento, error } = await supabase
    .from('treinamentos')
    .select(`
      *,
      modulos:modulos(
        id,
        titulo,
        descricao,
        conteudo,
        ordem,
        slides:slides(
          id,
          titulo,
          conteudo,
          imagem,
          ordem
        )
      )
    `)
    .eq('id', id)
    .single()
  
  if (error || !treinamento) {
    notFound()
  }
  
  // Ordenar módulos e slides
  treinamento.modulos = treinamento.modulos
    .sort((a: any, b: any) => a.ordem - b.ordem)
    .map((m: any) => ({
      ...m,
      slides: m.slides.sort((a: any, b: any) => a.ordem - b.ordem)
    }))
  
  // Buscar apostila
  const { data: apostila } = await supabase
    .from('apostilas')
    .select('*')
    .eq('treinamento_id', id)
    .eq('ativo', true)
    .order('versao', { ascending: false })
    .limit(1)
    .single()
  
  return (
    <ApostilaView
      treinamento={treinamento}
      apostila={apostila}
    />
  )
}

