import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { treinamentoId } = await request.json()
    
    if (!treinamentoId) {
      return NextResponse.json(
        { error: 'treinamentoId obrigatório' },
        { status: 400 }
      )
    }
    
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }
    
    // Buscar todos os módulos do treinamento
    const { data: modulos } = await supabase
      .from('modulos')
      .select('id')
      .eq('treinamento_id', treinamentoId)
    
    if (!modulos || modulos.length === 0) {
      return NextResponse.json(
        { error: 'Treinamento sem módulos' },
        { status: 400 }
      )
    }
    
    // Verificar progresso (todos módulos concluídos)
    const { data: progresso } = await supabase
      .from('progresso_treinamento')
      .select('*')
      .eq('user_id', user.id)
      .eq('treinamento_id', treinamentoId)
      .eq('concluido', true)
    
    if (!progresso || progresso.length < modulos.length) {
      return NextResponse.json(
        { 
          error: 'Treinamento não concluído',
          motivo: `Apenas ${progresso?.length || 0} de ${modulos.length} módulos concluídos`
        },
        { status: 400 }
      )
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
    
    let notaFinal = 100
    
    // Se tem testes, verificar aprovação
    if (testes && testes.length > 0) {
      const testeIds = testes.map(t => t.id)
      const { data: resultados } = await supabase
        .from('resultados')
        .select('*')
        .eq('user_id', user.id)
        .in('teste_id', testeIds)
        .eq('aprovado', true)
      
      if (!resultados || resultados.length < testes.length) {
        return NextResponse.json(
          { 
            error: 'Testes não aprovados',
            motivo: `Aprovado em ${resultados?.length || 0} de ${testes.length} testes`
          },
          { status: 400 }
        )
      }
      
      // Calcular média
      notaFinal = resultados.reduce((sum, r) => sum + r.pontuacao, 0) / resultados.length
    }
    
    // Verificar se já existe certificado
    const { data: certificadoExistente } = await supabase
      .from('certificados')
      .select('id')
      .eq('user_id', user.id)
      .eq('treinamento_id', treinamentoId)
      .single()
    
    if (certificadoExistente) {
      return NextResponse.json({
        success: true,
        certificadoId: certificadoExistente.id,
        jaExistia: true
      })
    }
    
    // Gerar código de validação
    const ano = new Date().getFullYear()
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    const codigoValidacao = `DFCERT-${ano}-${random}`
    
    // Criar certificado
    const { data: certificado, error } = await supabase
      .from('certificados')
      .insert({
        user_id: user.id,
        treinamento_id: treinamentoId,
        codigo_validacao: codigoValidacao,
        nota_final: notaFinal,
        data_conclusao: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) {
      console.error('Erro ao criar certificado:', error)
      return NextResponse.json(
        { error: 'Erro ao gerar certificado' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      certificadoId: certificado.id,
      codigoValidacao: certificado.codigo_validacao
    })
    
  } catch (error: any) {
    console.error('Erro na API de certificados:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

