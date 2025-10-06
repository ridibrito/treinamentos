import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CertificadoView from './CertificadoView'

interface PageProps {
  params: Promise<{
    treinamentoId: string
  }>
}

export default async function CertificadoPage({ params }: PageProps) {
  const { treinamentoId } = await params
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
  
  // Buscar certificado
  const { data: certificado } = await supabase
    .from('certificados')
    .select(`
      *,
      treinamentos:treinamento_id(titulo, categoria, duracao)
    `)
    .eq('user_id', user.id)
    .eq('treinamento_id', treinamentoId)
    .single()
  
  if (!certificado) {
    notFound()
  }
  
  return (
    <CertificadoView
      certificado={certificado}
      profile={profile}
    />
  )
}

