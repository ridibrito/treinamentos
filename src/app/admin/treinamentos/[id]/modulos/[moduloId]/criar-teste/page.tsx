import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CriarTesteContent from './CriarTesteContent'

interface PageProps {
  params: Promise<{
    id: string
    moduloId: string
  }>
}

export default async function CriarTestePage({ params }: PageProps) {
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
      treinamentos:treinamento_id(id, titulo)
    `)
    .eq('id', moduloId)
    .single()
  
  if (!modulo || modulo.treinamento_id !== id) {
    redirect('/admin/treinamentos')
  }
  
  // Verificar se já existe um teste
  const { data: testeExistente } = await supabase
    .from('testes')
    .select('id')
    .eq('modulo_id', moduloId)
    .single()
  
  const profileWithEmail = {
    ...profile,
    email: user.email
  }
  
  return (
    <CriarTesteContent
      profile={profileWithEmail}
      modulo={modulo}
      treinamentoId={id}
      testeExistenteId={testeExistente?.id}
    />
  )
}

