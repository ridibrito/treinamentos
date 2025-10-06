import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(request: NextRequest) {
  try {
    const { htmlAtual, comando } = await request.json()
    
    if (!htmlAtual || !comando) {
      return NextResponse.json({ 
        error: 'HTML ou comando não fornecido' 
      }, { status: 400 })
    }
    
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'GEMINI_API_KEY não configurada' 
      }, { status: 500 })
    }
    
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash' })
    
    const prompt = `Você é um assistente especializado em edição de conteúdo HTML para apostilas corporativas.

TAREFA: Modificar o HTML abaixo conforme o comando do usuário.

HTML ATUAL:
${htmlAtual}

COMANDO DO USUÁRIO:
"${comando}"

INSTRUÇÕES:
1. Analise o comando e faça as modificações solicitadas no HTML
2. Mantenha a estrutura e formatação existente
3. Se o comando pedir para adicionar imagem, use:
   <div class="image-suggestion" data-suggestion="Descrição da imagem">
     [SUGESTÃO DE IMAGEM: Descrição]
   </div>
4. Preserve todas as imagens já existentes (tags <figure>), a menos que o comando peça para remover
5. Mantenha o estilo profissional e corporativo
6. Se o comando não for claro, faça a melhor interpretação possível

IMPORTANTE:
- NÃO inclua <!DOCTYPE>, <html>, <head>, <body>
- Retorne APENAS fragmentos HTML modificados
- Mantenha a formatação limpa e semântica

RETORNE APENAS O HTML MODIFICADO, sem explicações ou markdown.`
    
    const result = await model.generateContent(prompt)
    const response = await result.response
    let htmlModificado = response.text()
    
    // Limpar possíveis wrappers
    htmlModificado = htmlModificado
      .replace(/```html\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()
    
    // Extrair body se necessário
    if (htmlModificado.includes('<!DOCTYPE') || htmlModificado.includes('<html')) {
      const bodyMatch = htmlModificado.match(/<body[^>]*>([\s\S]*)<\/body>/i)
      if (bodyMatch) {
        htmlModificado = bodyMatch[1].trim()
      } else {
        htmlModificado = htmlModificado
          .replace(/<!DOCTYPE[^>]*>/gi, '')
          .replace(/<\/?html[^>]*>/gi, '')
          .replace(/<head[\s\S]*?<\/head>/gi, '')
          .replace(/<\/?body[^>]*>/gi, '')
          .trim()
      }
    }
    
    return NextResponse.json({ 
      html: htmlModificado,
      sucesso: true
    })
    
  } catch (error: any) {
    console.error('Erro ao refinar:', error)
    return NextResponse.json(
      { 
        error: 'Erro ao processar comando',
        message: error.message 
      },
      { status: 500 }
    )
  }
}

