"use client"

import type { ReactNode } from "react"

interface CardProps {
  children: ReactNode
  className?: string
  interactive?: boolean
  onClick?: () => void
}

export function Card({ children, className = "", interactive = false, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-surface border border-border rounded-lg p-6 ${
        interactive ? "hover:border-primary hover:bg-surface-secondary transition-all cursor-pointer" : ""
      } ${className}`}
    >
      {children}
    </div>
  )
}
