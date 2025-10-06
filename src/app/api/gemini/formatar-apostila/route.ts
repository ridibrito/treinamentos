import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(request: NextRequest) {
  try {
    const { texto, titulo, categoria } = await request.json()
    
    if (!texto) {
      return NextResponse.json({ error: 'Texto não fornecido' }, { status: 400 })
    }
    
    // Verificar se tem API key do Gemini
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'GEMINI_API_KEY não configurada',
        message: 'Adicione GEMINI_API_KEY no arquivo .env.local'
      }, { status: 500 })
    }
    
    const genAI = new GoogleGenerativeAI(apiKey)
    
    // Tentar diferentes modelos em ordem de preferência
    // Usando nomes exatos dos modelos Gemini 2.5 (verificado via /api/gemini/listar-modelos)
    const modelosParaTestar = [
      'models/gemini-2.5-flash',          // ⚡ Estável, rápido (Jun 2025)
      'models/gemini-flash-latest',       // ⚡ Sempre a versão mais recente do Flash
      'models/gemini-2.5-pro',            // 🎯 Estável, poderoso (Jun 2025)
      'models/gemini-pro-latest',         // 🎯 Sempre a versão mais recente do Pro
      'models/gemini-2.0-flash',          // 🔄 Fallback para 2.0
    ]
    
    let model
    let modeloUsado = ''
    
    // Começar com o primeiro modelo (tentaremos outros se falhar)
    model = genAI.getGenerativeModel({ model: modelosParaTestar[0] })
    modeloUsado = modelosParaTestar[0]
    
    const prompt = `Você é um especialista em design instrucional e formatação de conteúdo educacional.

TAREFA: Transforme o texto abaixo em uma apostila profissional e bem formatada em HTML.

TÍTULO: ${titulo}
CATEGORIA: ${categoria}

TEXTO BRUTO:
${texto}

INSTRUÇÕES:
1. Formate o texto em HTML semântico e bem estruturado
2. Adicione títulos (h2, h3) para organizar o conteúdo
3. Use listas (ul, ol) onde apropriado
4. Destaque conceitos importantes com <strong> ou <mark>
5. Adicione citações com <blockquote> quando relevante
6. Crie divisões lógicas com <section>
7. IMPORTANTE: Em pontos estratégicos, adicione marcadores de imagem assim:
   <div class="image-suggestion" data-suggestion="Descrição do que a imagem deveria mostrar">
     [SUGESTÃO DE IMAGEM: Descrição]
   </div>

8. Mantenha um tom profissional e didático
9. Adicione boxes de destaque para informações importantes:
   <div class="highlight-box">Informação importante</div>

10. Se houver exemplos, use:
    <div class="example-box">Exemplo prático</div>

IMPORTANTE: 
- NÃO inclua <!DOCTYPE>, <html>, <head>, <body> ou outras tags de documento
- NÃO inclua tags <style> ou <script>
- Retorne APENAS fragmentos HTML para conteúdo (começando com <h2>, <section>, etc)
- NÃO use markdown (sem \`\`\`html)

RETORNE APENAS FRAGMENTOS HTML PUROS, começando direto com as tags de conteúdo.`

    let result
    let response
    let htmlFormatado
    
    // Tentar gerar conteúdo com diferentes modelos se necessário
    for (let i = 0; i < modelosParaTestar.length; i++) {
      try {
        if (i > 0) {
          console.log(`Tentando modelo alternativo: ${modelosParaTestar[i]}`)
          model = genAI.getGenerativeModel({ model: modelosParaTestar[i] })
          modeloUsado = modelosParaTestar[i]
        }
        
        result = await model.generateContent(prompt)
        response = await result.response
        htmlFormatado = response.text()
        
        console.log(`✅ Conteúdo gerado com sucesso usando: ${modeloUsado}`)
        break
        
      } catch (err: any) {
        console.error(`❌ Erro com modelo ${modelosParaTestar[i]}:`, err.message)
        
        if (i === modelosParaTestar.length - 1) {
          // Último modelo falhou
          throw new Error(
            `❌ Nenhum modelo Gemini disponível para sua API key.\n\n` +
            `SOLUÇÃO: Gere uma nova API key em:\n` +
            `https://makersuite.google.com/app/apikey\n\n` +
            `Depois atualize o .env.local e reinicie o servidor.\n\n` +
            `Erro técnico: ${err.message}`
          )
        }
        // Continuar para próximo modelo
      }
    }
    
    if (!htmlFormatado) {
      throw new Error('Falha ao gerar conteúdo com todos os modelos disponíveis')
    }
    
    // Limpar possíveis markdown wrappers
    let htmlLimpo = htmlFormatado
      .replace(/```html\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()
    
    // Se o Gemini retornou um documento HTML completo, extrair apenas o body
    if (htmlLimpo.includes('<!DOCTYPE') || htmlLimpo.includes('<html')) {
      const bodyMatch = htmlLimpo.match(/<body[^>]*>([\s\S]*)<\/body>/i)
      if (bodyMatch) {
        htmlLimpo = bodyMatch[1].trim()
        console.log('✂️ Extraído conteúdo do <body>')
      } else {
        // Tentar remover tags html/head/body manualmente
        htmlLimpo = htmlLimpo
          .replace(/<!DOCTYPE[^>]*>/gi, '')
          .replace(/<\/?html[^>]*>/gi, '')
          .replace(/<head[\s\S]*?<\/head>/gi, '')
          .replace(/<\/?body[^>]*>/gi, '')
          .trim()
        console.log('✂️ Removido tags HTML/HEAD/BODY')
      }
    }
    
    return NextResponse.json({ 
      html: htmlLimpo,
      sucesso: true
    })
    
  } catch (error: any) {
    console.error('Erro ao formatar com Gemini:', error)
    return NextResponse.json(
      { 
        error: 'Erro ao processar',
        message: error.message 
      },
      { status: 500 }
    )
  }
}

