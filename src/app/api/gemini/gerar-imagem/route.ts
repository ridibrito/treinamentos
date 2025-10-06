import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(request: NextRequest) {
  try {
    const { descricao } = await request.json()
    
    if (!descricao) {
      return NextResponse.json({ error: 'Descrição não fornecida' }, { status: 400 })
    }
    
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'GEMINI_API_KEY não configurada' 
      }, { status: 500 })
    }
    
    const genAI = new GoogleGenerativeAI(apiKey)
    
    // Usar o modelo Gemini 2.5 Flash Image para gerar imagens
    const model = genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash-image' })
    
    const prompt = `Generate a professional and educational image for corporate training material.

DESCRIPTION: ${descricao}

REQUIREMENTS:
- Style: Modern, clean, professional illustration
- Suitable for: Corporate educational material
- Theme: Insurance and brokerage
- Preferred colors: Blue tones (#014175), white, gray
- Visual: Clean, minimalist, corporate
- Quality: High resolution, suitable for printing

Create a visual image that professionally and educationally illustrates the described concept.`
    
    // Sistema de retry: tentar até 3 vezes para gerar imagem real
    const MAX_TENTATIVAS = 3
    let imagePart = null
    let tentativa = 0
    
    while (!imagePart && tentativa < MAX_TENTATIVAS) {
      tentativa++
      console.log(`🔄 Tentativa ${tentativa}/${MAX_TENTATIVAS} para: "${descricao.substring(0, 50)}..."`)
      
      const result = await model.generateContent(prompt)
      const response = await result.response
      
      const candidates = response.candidates
      if (!candidates || candidates.length === 0) {
        console.log(`⚠️ Tentativa ${tentativa}: Sem candidatos`)
        continue
      }
      
      const parts = candidates[0]?.content?.parts
      if (!parts || parts.length === 0) {
        console.log(`⚠️ Tentativa ${tentativa}: Sem parts`)
        continue
      }
      
      // Procurar pela parte que contém a imagem (inlineData)
      imagePart = parts.find((part: any) => part.inlineData)
      
      if (imagePart) {
        console.log(`✅ Tentativa ${tentativa}: Imagem REAL gerada!`)
      } else {
        console.log(`⚠️ Tentativa ${tentativa}: Modelo retornou texto. Tentando novamente...`)
        // Aguardar 500ms antes de tentar novamente
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }
    
    if (!imagePart || !imagePart.inlineData) {
      console.log('⚠️ Modelo retornou texto ao invés de imagem. Usando fallback SVG.')
      
      // FALLBACK: Gerar SVG ilustrativo
      const largura = 800
      const altura = 600
      const cor = '#014175'
      const corTexto = '#FFFFFF'
      
      // Quebrar texto em linhas
      const palavras = descricao.split(' ')
      const linhas = []
      let linhaAtual = ''
      
      for (const palavra of palavras) {
        if ((linhaAtual + ' ' + palavra).length <= 40) {
          linhaAtual += (linhaAtual ? ' ' : '') + palavra
        } else {
          if (linhaAtual) linhas.push(linhaAtual)
          linhaAtual = palavra
        }
      }
      if (linhaAtual) linhas.push(linhaAtual)
      
      const linhasExibir = linhas.slice(0, 4)
      const yInicial = 280
      const textosSVG = linhasExibir.map((linha, idx) => {
        const y = yInicial + (idx * 35)
        return `<text x="400" y="${y}" font-family="Arial, sans-serif" font-size="24" fill="${corTexto}" text-anchor="middle" font-weight="300">${linha}</text>`
      }).join('\n          ')
      
      const svgData = `<svg width="${largura}" height="${altura}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${cor}"/>
        <g transform="translate(400, 180)">
          <path d="M-40,-40 L40,-40 L40,40 L-40,40 Z" fill="none" stroke="${corTexto}" stroke-width="3" opacity="0.3"/>
          <circle cx="-20" cy="-15" r="8" fill="${corTexto}" opacity="0.3"/>
          <path d="M-40,20 L-10,-10 L20,20 L40,0" fill="none" stroke="${corTexto}" stroke-width="3" opacity="0.3"/>
        </g>
        ${textosSVG}
      </svg>`
      
      const svgBase64 = Buffer.from(svgData).toString('base64')
      
      return NextResponse.json({ 
        sucesso: true,
        mimeType: 'image/svg+xml',
        imageData: svgBase64,
        isFallback: true
      })
    }
    
    // Retornar a imagem REAL gerada pelo Gemini
    return NextResponse.json({ 
      sucesso: true,
      mimeType: imagePart.inlineData.mimeType,
      imageData: imagePart.inlineData.data,
      isFallback: false
    })
    
  } catch (error: any) {
    console.error('Erro ao gerar imagem:', error)
    return NextResponse.json(
      { 
        error: 'Erro ao processar',
        message: error.message 
      },
      { status: 500 }
    )
  }
}

