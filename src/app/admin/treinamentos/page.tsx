import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminTreinamentosContent } from './AdminTreinamentosContent'

export default async function AdminTreinamentosPage() {
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
  
  // Verificar se é admin
  if (!profile || profile.role !== 'admin') {
    redirect('/dashboard')
  }
  
  // Buscar todos os treinamentos
  const { data: treinamentos } = await supabase
    .from('treinamentos')
    .select(`
      *,
      modulos:modulos(count)
    `)
    .order('created_at', { ascending: false })
  
  const profileWithEmail = {
    ...profile,
    email: user.email
  }
  
  return (
    <AdminTreinamentosContent
      profile={profileWithEmail}
      treinamentos={treinamentos || []}
    />
  )
}

