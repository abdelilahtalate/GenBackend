"use client"

import { Card } from "@/components/card"
import { UserPlus, LogIn, UserCircle } from "lucide-react"

interface AuthTestPresetsProps {
    config?: any
    onSelect: (preset: { method: string, endpoint: string, body: string }) => void
}

export function AuthTestPresets({ config, onSelect }: AuthTestPresetsProps) {
    const extraFields = config?.extra_fields || []

    const getDynamicBody = (type: 'register' | 'login') => {
        const hasUsername = extraFields.some((f: any) => f.name === 'username')

        const base: any = {
            email: "test@example.com",
            password: "password123"
        }

        if (hasUsername) {
            base.username = "testuser"
        }

        if (type === 'register') {
            // Add default names if no extra fields, otherwise add the extra fields
            if (extraFields.length === 0) {
                base.first_name = "John"
                base.last_name = "Doe"
            } else {
                extraFields.forEach((f: any) => {
                    if (f.name !== 'email' && f.name !== 'password' && f.name !== 'username') {
                        base[f.name] = f.type === 'integer' ? 123 : `Sample ${f.name}`
                    }
                })
            }
        }

        return JSON.stringify(base, null, 2)
    }

    const presets = [
        {
            id: "register",
            name: "Register (Custom)",
            description: "Register with your fields",
            icon: UserPlus,
            method: "POST",
            endpoint: "/api/auth/register",
            body: getDynamicBody('register')
        },
        {
            id: "login",
            name: "Login",
            description: "Standard login",
            icon: LogIn,
            method: "GET",
            endpoint: "/api/auth/login",
            body: getDynamicBody('login')
        },
        {
            id: "profile",
            name: "Get Profile",
            description: "Access profile data",
            icon: UserCircle,
            method: "GET",
            endpoint: "/api/auth/profile",
            body: "{}"
        }
    ]

    return (
        <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">Auth Test Presets</p>
                {extraFields.length > 0 && (
                    <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20">
                        {extraFields.length} Custom Fields Detected
                    </span>
                )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {presets.map((preset) => (
                    <button
                        key={preset.id}
                        onClick={() => onSelect(preset)}
                        className="p-3 text-left border border-border bg-surface hover:border-primary rounded-lg transition-all group"
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <preset.icon className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium text-foreground group-hover:text-primary">{preset.name}</span>
                        </div>
                        <p className="text-[10px] text-muted">{preset.description}</p>
                    </button>
                ))}
            </div>
        </div>
    )
}
