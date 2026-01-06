import { type ReactNode } from "react"
import { Loader2 } from "lucide-react"

interface ButtonProps {
  children: ReactNode
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive"
  size?: "sm" | "md" | "lg"
  disabled?: boolean
  loading?: boolean
  type?: "button" | "submit" | "reset"
  className?: string
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  className = "",
  ...props
}: ButtonProps) {
  const baseClasses = "font-medium transition-colors rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"

  const variants = {
    primary: "bg-primary text-background hover:bg-primary-dark",
    secondary: "bg-surface-secondary text-foreground hover:bg-border",
    outline: "border border-border text-foreground hover:bg-surface-secondary",
    ghost: "text-foreground hover:bg-surface-secondary",
    destructive: "bg-destructive text-white hover:bg-destructive/90",
  }

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  }

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      <div className="flex items-center justify-center gap-2">
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </div>
    </button>
  )
}
