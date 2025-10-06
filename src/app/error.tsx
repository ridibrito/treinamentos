'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { AlertCircle } from 'lucide-react'
import Image from 'next/image'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  const isSupabaseError = error.message.includes('Supabase não configurado')

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <Image 
            src="/logo.png" 
            alt="DF Corretora" 
            width={200} 
            height={80}
            className="h-20 w-auto mx-auto mb-6"
          />
        </div>

        <Card>
          <CardBody className="p-12">
            <div className="w-20 h-20 bg-red-100 rounded-full mx-auto mb-6 flex items-center justify-center">
              <AlertCircle className="w-12 h-12 text-red-600" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">
              {isSupabaseError ? '⚙️ Configuração Necessária' : 'Algo deu errado'}
            </h1>

            {isSupabaseError ? (
              <div className="space-y-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <h2 className="font-bold text-lg text-yellow-900 mb-3">
                    🔧 Supabase não configurado
                  </h2>
                  <p className="text-yellow-800 mb-4">
                    Para usar a plataforma, você precisa configurar o Supabase primeiro.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 text-left">
                  <h3 className="font-bold text-gray-900 mb-3">Passos rápidos:</h3>
                  <ol className="space-y-3 text-sm text-gray-700">
                    <li className="flex items-start space-x-2">
                      <span className="font-bold text-primary">1.</span>
                      <span>
                        Crie um arquivo <code className="bg-gray-200 px-2 py-1 rounded">.env.local</code> na raiz do projeto
                      </span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="font-bold text-primary">2.</span>
                      <span>
                        Adicione suas credenciais do Supabase (veja <code className="bg-gray-200 px-2 py-1 rounded">env.example</code>)
                      </span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="font-bold text-primary">3.</span>
                      <span>Reinicie o servidor (<code className="bg-gray-200 px-2 py-1 rounded">Ctrl+C</code> e <code className="bg-gray-200 px-2 py-1 rounded">npm run dev</code>)</span>
                    </li>
                  </ol>
                </div>

                <div className="text-sm text-gray-600 text-center">
                  <p className="mb-2">📖 Consulte os guias:</p>
                  <ul className="space-y-1">
                    <li><code className="bg-gray-200 px-2 py-1 rounded text-xs">CONFIGURE-AGORA.md</code> - Solução rápida</li>
                    <li><code className="bg-gray-200 px-2 py-1 rounded text-xs">INICIO-RAPIDO.md</code> - Guia completo</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-600 text-center mb-4">
                  Ocorreu um erro inesperado ao carregar a página.
                </p>
                
                <details className="bg-gray-50 rounded-lg p-4 text-left">
                  <summary className="cursor-pointer font-medium text-gray-700 mb-2">
                    Detalhes do erro
                  </summary>
                  <pre className="text-xs text-gray-600 overflow-auto">
                    {error.message}
                  </pre>
                </details>
              </div>
            )}

            <div className="mt-8 flex justify-center space-x-3">
              <Button
                variant="outline"
                onClick={() => window.location.href = '/login'}
              >
                Voltar ao Login
              </Button>
              
              <Button
                variant="primary"
                onClick={reset}
              >
                Tentar Novamente
              </Button>
            </div>
          </CardBody>
        </Card>

        <p className="text-center text-gray-500 text-sm mt-6">
          © 2025 DF Corretora - Todos os direitos reservados
        </p>
      </div>
    </div>
  )
}

