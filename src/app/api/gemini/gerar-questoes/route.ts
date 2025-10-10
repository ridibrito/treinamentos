import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

type FonteTipo = 'apostila_html' | 'transcricao_video' | 'texto_livre'

interface GerarQuestoesBody {
  fonte: FonteTipo
  conteudo: string
  idioma?: 'pt-BR' | 'pt' | 'en'
  quantidade?: number
  tipos?: Array<'multipla' | 'vf' | 'dissertativa'>
  nivel?: 'basico' | 'intermediario' | 'avancado'
  contexto?: {
    treinamentoTitulo?: string
    moduloTitulo?: string
    categoria?: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as GerarQuestoesBody
    const { fonte, conteudo } = body

    if (!fonte || !conteudo) {
      return NextResponse.json({ error: 'Parâmetros inválidos: fonte e conteudo são obrigatórios' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY não configurada' }, { status: 500 })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const modelosPreferidos = [
      'models/gemini-2.5-pro',
      'models/gemini-pro-latest',
      'models/gemini-2.5-flash',
      'models/gemini-flash-latest'
    ]

    const quantidade = Math.min(Math.max(body.quantidade ?? 8, 3), 25)
    const idioma = body.idioma ?? 'pt-BR'
    const tipos = body.tipos ?? ['multipla', 'vf']
    const nivel = body.nivel ?? 'intermediario'

    const contextoPartes: string[] = []
    if (body.contexto?.treinamentoTitulo) contextoPartes.push(`Treinamento: ${body.contexto.treinamentoTitulo}`)
    if (body.contexto?.moduloTitulo) contextoPartes.push(`Módulo: ${body.contexto.moduloTitulo}`)
    if (body.contexto?.categoria) contextoPartes.push(`Categoria: ${body.contexto.categoria}`)

    const contextoStr = contextoPartes.length ? contextoPartes.join('\n') + '\n' : ''

    const instrucaoFonte =
      fonte === 'apostila_html'
        ? 'A fonte é HTML de apostila. Ignore tags de layout e foque no conteúdo pedagógico.'
        : fonte === 'transcricao_video'
        ? 'A fonte é transcrição de vídeo. Texto pode ter ruídos e falas interrompidas; consolide ideias.'
        : 'A fonte é texto livre.'

    const incluirMultipla = tipos.includes('multipla')
    const incluirVF = tipos.includes('vf')
    const incluirDissertativa = tipos.includes('dissertativa')

    const prompt = `Você é um elaborador de avaliações para e-learning corporativo.

${contextoStr}Nível desejado: ${nivel}
Idioma: ${idioma}
Quantidade total de questões: ${quantidade}
Tipos permitidos: ${tipos.join(', ')}

${instrucaoFonte}

CONTEÚDO DE ESTUDO:
"""
${conteudo}
"""

TAREFA:
1) Gere exatamente ${quantidade} questões distribuídas entre os tipos permitidos.
2) Mantenha objetividade e clareza.
3) Para múltipla escolha, gere 4 alternativas (a, b, c, d) com apenas 1 correta.
4) Para verdadeiro/falso, a resposta correta deve ser "true" ou "false".
5) Para dissertativa, inclua diretriz de correção.
6) Assegure alinhamento com o conteúdo fornecido.

RETORNO:
Responda EXCLUSIVAMENTE em JSON com o formato:
{
  "questoes": [
    {
      "enunciado": string,
      "tipo": "multipla" | "vf" | "dissertativa",
      "alternativas": [{"id":"a|b|c|d","texto": string}] | null,
      "resposta_correta": "a|b|c|d" | "true" | "false" | "",
      "pontos": number
    }
  ]
}

REGRAS:
- Não explique, não use markdown, retorne apenas JSON válido.
- Garanta que o campo tipo corresponda ao conjunto permitido.
- Para dissertativa, "alternativas" deve ser null e "resposta_correta" vazio.
`

    let lastError: any = null
    for (const modelName of modelosPreferidos) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName })
        const result = await model.generateContent(prompt)
        const response = await result.response
        let text = response.text().trim()

        // Tentar normalizar conteúdo que venha com crases ou prefixos
        if (text.startsWith('```')) {
          text = text.replace(/^```[a-zA-Z]*\n?/, '').replace(/```$/, '').trim()
        }

        const parsed = JSON.parse(text)
        const questoes = Array.isArray(parsed.questoes) ? parsed.questoes : []

        // Sanitização básica
        const tiposPermitidos = new Set(['multipla', 'vf', 'dissertativa'])
        const questoesNormalizadas = questoes
          .filter((q: any) => q && tiposPermitidos.has(q.tipo))
          .map((q: any, index: number) => {
            const pontos = typeof q.pontos === 'number' && q.pontos > 0 ? q.pontos : 1
            if (q.tipo === 'multipla') {
              const alternativas = Array.isArray(q.alternativas)
                ? q.alternativas.slice(0, 4)
                : [
                    { id: 'a', texto: '' },
                    { id: 'b', texto: '' },
                    { id: 'c', texto: '' },
                    { id: 'd', texto: '' }
                  ]
              const idsValidos = new Set(['a', 'b', 'c', 'd'])
              const resposta = idsValidos.has(q.resposta_correta) ? q.resposta_correta : 'a'
              return {
                enunciado: String(q.enunciado || '').trim(),
                tipo: 'multipla',
                alternativas,
                resposta_correta: resposta,
                pontos
              }
            }
            if (q.tipo === 'vf') {
              const resposta = q.resposta_correta === 'false' ? 'false' : 'true'
              return {
                enunciado: String(q.enunciado || '').trim(),
                tipo: 'vf',
                alternativas: [
                  { id: 'true', texto: 'Verdadeiro' },
                  { id: 'false', texto: 'Falso' }
                ],
                resposta_correta: resposta,
                pontos
              }
            }
            // dissertativa
            return {
              enunciado: String(q.enunciado || '').trim(),
              tipo: 'dissertativa',
              alternativas: null,
              resposta_correta: '',
              pontos
            }
          })

        // Opcional: redistribuir tipos se o modelo ignorar pedido
        const needsMultipla = incluirMultipla && !questoesNormalizadas.some((q: any) => q.tipo === 'multipla')
        const needsVF = incluirVF && !questoesNormalizadas.some((q: any) => q.tipo === 'vf')
        const needsDissertativa = incluirDissertativa && !questoesNormalizadas.some((q: any) => q.tipo === 'dissertativa')
        if (needsMultipla || needsVF || needsDissertativa) {
          // Sem refetch aqui; aceitamos menor distribuição quando o modelo não atende perfeitamente
        }

        return NextResponse.json({
          modelo: modelName,
          total: questoesNormalizadas.length,
          questoes: questoesNormalizadas
        })
      } catch (err: any) {
        lastError = err
        continue
      }
    }

    return NextResponse.json(
      { error: 'Falha ao gerar questões', message: lastError?.message || 'Erro desconhecido' },
      { status: 500 }
    )
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Erro inesperado ao gerar questões', message: error.message },
      { status: 500 }
    )
  }
}


