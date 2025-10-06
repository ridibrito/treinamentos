import { createClient } from './supabase/client'

/**
 * Gera um código único de validação para o certificado
 */
function gerarCodigoValidacao(): string {
  const ano = new Date().getFullYear()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `DFCERT-${ano}-${random}`
}

/**
 * Verifica se o aluno completou o treinamento e tem nota suficiente
 */
export async function verificarElegibilidadeCertificado(
  userId: string,
  treinamentoId: string
): Promise<{
  elegivel: boolean
  motivo?: string
  notaFinal?: number
}> {
  const supabase = createClient()
  
  // Buscar todos os módulos do treinamento
  const { data: modulos } = await supabase
    .from('modulos')
    .select('id')
    .eq('treinamento_id', treinamentoId)
  
  if (!modulos || modulos.length === 0) {
    return { elegivel: false, motivo: 'Treinamento sem módulos' }
  }
  
  // Verificar progresso (todos módulos concluídos)
  const { data: progresso } = await supabase
    .from('progresso_treinamento')
    .select('*')
    .eq('user_id', userId)
    .eq('treinamento_id', treinamentoId)
    .eq('concluido', true)
  
  if (!progresso || progresso.length < modulos.length) {
    return { 
      elegivel: false, 
      motivo: `Apenas ${progresso?.length || 0} de ${modulos.length} módulos concluídos` 
    }
  }
  
  // Buscar testes do treinamento
  const { data: testes } = await supabase
    .from('testes')
    .select(`
      id,
      modulo_id,
      modulos!inner(treinamento_id)
    `)
    .eq('modulos.treinamento_id', treinamentoId)
  
  // Se não tem testes, pode emitir (só precisa completar módulos)
  if (!testes || testes.length === 0) {
    return { elegivel: true, notaFinal: 100 }
  }
  
  // Verificar resultados dos testes
  const testeIds = testes.map(t => t.id)
  const { data: resultados } = await supabase
    .from('resultados')
    .select('*')
    .eq('user_id', userId)
    .in('teste_id', testeIds)
    .eq('aprovado', true)
  
  if (!resultados || resultados.length < testes.length) {
    return { 
      elegivel: false, 
      motivo: `Aprovado em ${resultados?.length || 0} de ${testes.length} testes` 
    }
  }
  
  // Calcular média das notas
  const notaFinal = resultados.reduce((sum, r) => sum + r.pontuacao, 0) / resultados.length
  
  return { elegivel: true, notaFinal }
}

/**
 * Gera certificado para um aluno
 */
export async function gerarCertificado(
  userId: string,
  treinamentoId: string
): Promise<{
  success: boolean
  certificadoId?: string
  error?: string
}> {
  const supabase = createClient()
  
  // Verificar elegibilidade
  const { elegivel, motivo, notaFinal } = await verificarElegibilidadeCertificado(userId, treinamentoId)
  
  if (!elegivel) {
    return { success: false, error: motivo }
  }
  
  // Verificar se já existe certificado
  const { data: certificadoExistente } = await supabase
    .from('certificados')
    .select('id')
    .eq('user_id', userId)
    .eq('treinamento_id', treinamentoId)
    .single()
  
  if (certificadoExistente) {
    return { 
      success: true, 
      certificadoId: certificadoExistente.id 
    }
  }
  
  // Criar certificado
  const { data: certificado, error } = await supabase
    .from('certificados')
    .insert({
      user_id: userId,
      treinamento_id: treinamentoId,
      codigo_validacao: gerarCodigoValidacao(),
      nota_final: notaFinal || 100,
      data_conclusao: new Date().toISOString()
    })
    .select()
    .single()
  
  if (error) {
    return { success: false, error: error.message }
  }
  
  return { success: true, certificadoId: certificado.id }
}

