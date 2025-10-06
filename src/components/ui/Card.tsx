import { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  hover?: boolean
}

export function Card({ children, hover = false, className = '', ...props }: CardProps) {
  return (
    <div
      className={`
        bg-white rounded-xl border border-border shadow-sm
        ${hover ? 'transition-all hover:shadow-md hover:border-primary/30' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function CardHeader({ children, className = '', ...props }: CardHeaderProps) {
  return (
    <div className={`px-6 py-4 border-b border-border ${className}`} {...props}>
      {children}
    </div>
  )
}

interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function CardBody({ children, className = '', ...props }: CardBodyProps) {
  return (
    <div className={`px-6 py-4 ${className}`} {...props}>
      {children}
    </div>
  )
}

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function CardFooter({ children, className = '', ...props }: CardFooterProps) {
  return (
    <div className={`px-6 py-4 border-t border-border ${className}`} {...props}>
      {children}
    </div>
  )
}

