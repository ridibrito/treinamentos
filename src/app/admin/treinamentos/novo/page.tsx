import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { FormTreinamento } from '../FormTreinamento'

export default async function NovoTreinamentoPage() {
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
  
  const profileWithEmail = {
    ...profile,
    email: user.email
  }
  
  return <FormTreinamento profile={profileWithEmail} />
}

