"use client"

import type React from "react"
import { forwardRef } from "react"

interface InputProps {
  label?: string
  name?: string
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  type?: "text" | "email" | "password" | "number"
  error?: string
  multiline?: boolean
  rows?: number
  className?: string
  required?: boolean
}
export const Input = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  InputProps
>(
  (
    {
      label,
      name,
      placeholder,
      value,
      onChange,
      type = "text",
      error,
      multiline = false,
      rows = 3,
      className = "",
      required,
    },
    ref
  ) => {
    const Component = multiline ? "textarea" : "input"

    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label className="text-sm font-medium text-foreground">
            {label}
          </label>
        )}

        <Component
          ref={ref as any}
          name={name}          /* ✅ CRITICAL */
          required={required}  /* ✅ */
          type={!multiline ? type : undefined}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          rows={multiline ? rows : undefined}
          className={`bg-surface-secondary border border-border rounded-lg px-4 py-2 text-foreground placeholder-muted focus:outline-none focus:border-primary transition-colors ${
            error ? "border-error" : ""
          } ${className}`}
        />

        {error && <span className="text-error text-sm">{error}</span>}
      </div>
    )
  }
)
