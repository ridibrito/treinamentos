import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'GEMINI_API_KEY não configurada' 
      }, { status: 500 })
    }

    // Listar modelos via API REST direta
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    
    const response = await fetch(url)
    const data = await response.json()
    
    if (!response.ok) {
      return NextResponse.json({
        error: 'Erro ao listar modelos',
        message: data.error?.message || 'Erro desconhecido'
      }, { status: response.status })
    }
    
    // Filtrar apenas modelos que suportam generateContent
    const modelosDisponiveis = data.models?.filter((m: any) => 
      m.supportedGenerationMethods?.includes('generateContent')
    ) || []
    
    return NextResponse.json({
      total: modelosDisponiveis.length,
      modelos: modelosDisponiveis.map((m: any) => ({
        nome: m.name,
        displayName: m.displayName,
        description: m.description,
        supportedMethods: m.supportedGenerationMethods
      }))
    })
    
  } catch (error: any) {
    console.error('Erro ao listar modelos:', error)
    return NextResponse.json(
      { 
        error: 'Erro ao listar modelos',
        message: error.message 
      },
      { status: 500 }
    )
  }
}

