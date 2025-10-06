'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { Button } from './Button'

interface ConfirmOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'primary' | 'warning'
}

interface ConfirmDialogContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>
}

const ConfirmDialogContext = createContext<ConfirmDialogContextType | undefined>(undefined)

export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<ConfirmOptions>({
    title: '',
    message: '',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    variant: 'primary'
  })
  const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null)

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    setOptions({
      ...opts,
      confirmText: opts.confirmText || 'Confirmar',
      cancelText: opts.cancelText || 'Cancelar',
      variant: opts.variant || 'primary'
    })
    setIsOpen(true)

    return new Promise<boolean>((resolve) => {
      setResolvePromise(() => resolve)
    })
  }, [])

  const handleConfirm = useCallback(() => {
    if (resolvePromise) {
      resolvePromise(true)
    }
    setIsOpen(false)
  }, [resolvePromise])

  const handleCancel = useCallback(() => {
    if (resolvePromise) {
      resolvePromise(false)
    }
    setIsOpen(false)
  }, [resolvePromise])

  return (
    <ConfirmDialogContext.Provider value={{ confirm }}>
      {children}
      
      {/* Modal Overlay */}
      {isOpen && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center p-4 confirm-dialog-open">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 animate-in fade-in"
            onClick={handleCancel}
          />
          
          {/* Modal */}
          <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full animate-in fade-in slide-in-from-top-2">
            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b border-border">
              <div className="flex items-start space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  options.variant === 'danger' 
                    ? 'bg-red-100' 
                    : options.variant === 'warning'
                    ? 'bg-yellow-100'
                    : 'bg-blue-100'
                }`}>
                  <AlertTriangle className={`w-6 h-6 ${
                    options.variant === 'danger' 
                      ? 'text-red-600' 
                      : options.variant === 'warning'
                      ? 'text-yellow-600'
                      : 'text-blue-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">
                    {options.title}
                  </h3>
                </div>
              </div>
              
              <button
                onClick={handleCancel}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            {/* Body */}
            <div className="p-6">
              <p className="text-gray-700 leading-relaxed">
                {options.message}
              </p>
            </div>
            
            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-border bg-gray-50 rounded-b-xl">
              <Button
                variant="outline"
                onClick={handleCancel}
              >
                {options.cancelText}
              </Button>
              
              <Button
                variant={options.variant === 'danger' ? 'danger' : 'primary'}
                onClick={handleConfirm}
              >
                {options.confirmText}
              </Button>
            </div>
          </div>
        </div>
      )}
    </ConfirmDialogContext.Provider>
  )
}

export function useConfirm() {
  const context = useContext(ConfirmDialogContext)
  if (!context) {
    throw new Error('useConfirm deve ser usado dentro de ConfirmDialogProvider')
  }
  return context
}

