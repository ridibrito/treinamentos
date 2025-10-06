import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PerfilContent } from './PerfilContent'

export default async function PerfilPage() {
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
  
  if (!profile) {
    redirect('/login')
  }
  
  const profileWithEmail = {
    ...profile,
    email: user.email
  }
  
  return <PerfilContent profile={profileWithEmail} />
}
