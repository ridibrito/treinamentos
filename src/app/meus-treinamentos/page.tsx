import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MeusTreinamentosContent } from './MeusTreinamentosContent'

export default async function MeusTreinamentosPage() {
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
  
  // Buscar progresso do usuário
  const { data: progresso } = await supabase
    .from('progresso_treinamento')
    .select(`
      *,
      treinamentos:treinamentos(*),
      modulos:modulos(*)
    `)
    .eq('user_id', user.id)
  
  // Agrupar por treinamento
  const treinamentosMap = new Map()
  
  progresso?.forEach((p: any) => {
    if (!treinamentosMap.has(p.treinamento_id)) {
      treinamentosMap.set(p.treinamento_id, {
        treinamento: p.treinamentos,
        modulos: [],
        modulosConcluidos: 0
      })
    }
    
    const item = treinamentosMap.get(p.treinamento_id)
    item.modulos.push(p)
    if (p.concluido) {
      item.modulosConcluidos++
    }
  })
  
  const treinamentosComProgresso = Array.from(treinamentosMap.values())
  
  const profileWithEmail = {
    ...profile,
    email: user.email
  }
  
  return (
    <MeusTreinamentosContent
      profile={profileWithEmail}
      treinamentos={treinamentosComProgresso}
    />
  )
}

