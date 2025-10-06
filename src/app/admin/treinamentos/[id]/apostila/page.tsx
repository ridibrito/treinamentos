import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EditorApostilaSimplificado } from './EditorApostilaSimplificado'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ApostilaEditorPage({ params }: PageProps) {
  const { id } = await params
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
  
  // Buscar treinamento
  const { data: treinamento, error } = await supabase
    .from('treinamentos')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error || !treinamento) {
    notFound()
  }
  
  // Buscar apostila existente
  const { data: apostila } = await supabase
    .from('apostilas')
    .select('*')
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
    <EditorApostilaSimplificado 
      profile={profileWithEmail}
      treinamento={treinamento}
      apostilaExistente={apostila}
    />
  )
}

