'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/Toast'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardBody } from '@/components/ui/Card'
import Image from 'next/image'

export default function LoginPage() {
  const router = useRouter()
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Verifica se o Supabase está configurado
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      toast.error('Supabase não configurado', 'Crie o arquivo .env.local com as credenciais')
      setLoading(false)
      return
    }
    
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      })
      
      if (error) throw error
      
      if (data.session) {
        toast.success('Login realizado!', 'Bem-vindo de volta')
        setTimeout(() => {
          router.push('/dashboard')
          router.refresh()
        }, 500)
      }
    } catch (err: any) {
      if (err.message.includes('Invalid login credentials')) {
        toast.error('Credenciais inválidas', 'E-mail ou senha incorretos')
      } else {
        toast.error('Erro ao fazer login', err.message)
      }
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-6">
            <Image 
              src="/logo.png" 
              alt="DF Corretora" 
              width={200} 
              height={80}
              className="h-20 w-auto"
              priority
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bem-vindo</h1>
          <p className="text-gray-600">Acesse sua conta para continuar</p>
        </div>
        
        {/* Card de Login */}
        <Card>
          <CardBody className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Acessar Plataforma
            </h2>
            
            <form onSubmit={handleLogin} className="space-y-5">
              <Input
                type="email"
                label="E-mail"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
              
              <Input
                type="password"
                label="Senha"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                disabled={loading}
              />
              
              <Button
                type="submit"
                fullWidth
                size="lg"
                disabled={loading}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
            
            <div className="mt-6 text-center space-y-3">
              <p className="text-sm text-gray-600">
                Esqueceu sua senha?{' '}
                <button className="text-primary hover:underline font-medium">
                  Recuperar acesso
                </button>
              </p>
              <p className="text-sm text-gray-600">
                Não tem uma conta?{' '}
                <a href="/cadastro" className="text-primary hover:underline font-medium">
                  Criar conta
                </a>
              </p>
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

