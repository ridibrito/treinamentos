'use client'

import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { 
  Bell,
  Lock,
  Palette,
  Globe,
  Database,
  Shield
} from 'lucide-react'

interface ConfiguracoesContentProps {
  profile: any
}

export function ConfiguracoesContent({ profile }: ConfiguracoesContentProps) {
  return (
    <AppLayout user={profile}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Configurações
          </h2>
          <p className="text-gray-600">
            Gerencie preferências e configurações da plataforma
          </p>
        </div>
        
        <div className="space-y-6">
          {/* Notificações */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Bell className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold text-gray-900">Notificações</h3>
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">E-mail de novos treinamentos</p>
                  <p className="text-sm text-gray-600">Receba notificações quando novos treinamentos estiverem disponíveis</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Resultados de testes</p>
                  <p className="text-sm text-gray-600">Receba um resumo dos seus resultados por e-mail</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </CardBody>
          </Card>
          
          {/* Privacidade e Segurança */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Lock className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold text-gray-900">Privacidade e Segurança</h3>
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              <button className="w-full text-left p-4 rounded-lg hover:bg-gray-50 transition-colors border border-border">
                <p className="font-medium text-gray-900 mb-1">Alterar senha</p>
                <p className="text-sm text-gray-600">Atualize sua senha de acesso</p>
              </button>
              
              <button className="w-full text-left p-4 rounded-lg hover:bg-gray-50 transition-colors border border-border">
                <p className="font-medium text-gray-900 mb-1">Atividade da conta</p>
                <p className="text-sm text-gray-600">Veja dispositivos e sessões ativas</p>
              </button>
            </CardBody>
          </Card>
          
          {/* Preferências */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Palette className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold text-gray-900">Aparência</h3>
              </div>
            </CardHeader>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Tema</p>
                  <p className="text-sm text-gray-600">Modo claro (padrão)</p>
                </div>
                <select className="px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="light">Claro</option>
                  <option value="dark" disabled>Escuro (em breve)</option>
                  <option value="auto" disabled>Automático (em breve)</option>
                </select>
              </div>
            </CardBody>
          </Card>
          
          {/* Idioma */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Globe className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold text-gray-900">Idioma e Região</h3>
              </div>
            </CardHeader>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Idioma</p>
                  <p className="text-sm text-gray-600">Português (Brasil)</p>
                </div>
                <select className="px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="pt-BR">Português (Brasil)</option>
                  <option value="en" disabled>English (em breve)</option>
                  <option value="es" disabled>Español (em breve)</option>
                </select>
              </div>
            </CardBody>
          </Card>
          
          {/* Informações do Sistema (apenas admin) */}
          {profile.role === 'admin' && (
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Database className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-bold text-gray-900">Informações do Sistema</h3>
                </div>
              </CardHeader>
              <CardBody className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Versão da Plataforma:</span>
                  <span className="font-medium text-gray-900">1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Banco de Dados:</span>
                  <span className="font-medium text-gray-900">Supabase (PostgreSQL)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Storage:</span>
                  <span className="font-medium text-gray-900">Supabase Storage</span>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  )
}

