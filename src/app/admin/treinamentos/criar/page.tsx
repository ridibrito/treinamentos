import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CriarTreinamentoWizard } from './CriarTreinamentoWizard'

export default async function CriarTreinamentoPage() {
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
  
  const profileWithEmail = {
    ...profile,
    email: user.email
  }
  
  return <CriarTreinamentoWizard profile={profileWithEmail} />
}

