'use client'

import { ReactNode, useState, useEffect } from 'react'
import { Sidebar } from './Sidebar'
import { ConfirmDialogProvider } from '@/components/ui/ConfirmDialog'
import { Topbar } from './Topbar'

interface AppLayoutProps {
  children: ReactNode
  user: {
    nome: string
    email?: string
    role: 'admin' | 'palestrante' | 'aluno'
    avatar_url?: string | null
  }
}

export function AppLayout({ children, user }: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  
  // Atualizar variável CSS quando sidebar colapsa/expande
  useEffect(() => {
    document.body.style.setProperty('--sidebar-width', sidebarCollapsed ? '80px' : '256px')
  }, [sidebarCollapsed])
  
  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }
  
  return (
    <ConfirmDialogProvider>
    <div className="min-h-screen bg-soft-white">
      {/* Topbar - Fixo no topo com logo e botão toggle */}
      <Topbar user={user} onToggleSidebar={handleToggleSidebar} />
      
      {/* Sidebar - Abaixo do topbar, colapsável */}
      <Sidebar userRole={user.role} collapsed={sidebarCollapsed} />
      
      {/* Main Content - Ajusta-se ao sidebar */}
      <main className="transition-all duration-300" style={{ 
        marginLeft: 'var(--sidebar-width, 256px)',
        paddingTop: '80px'
      }}>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
    </ConfirmDialogProvider>
  )
}

