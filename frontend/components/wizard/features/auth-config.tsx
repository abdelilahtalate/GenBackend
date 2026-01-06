"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/card"
import { ExternalAPITesting } from "@/components/dashboard/external-api-testing"
import type { Feature } from "@/types"
import { Info, Shield, Key, User } from "lucide-react"

interface AuthConfigProps {
    projectId?: string
    feature: Feature
    onChange: (config: any) => void
}

const AUTH_EXAMPLES = [
    {
        id: "jwt-basic",
        name: "Standard JWT Auth",
        description: "Email/Password with JWT tokens",
        config: {
            auth_type: "jwt",
            providers: ["email"],
            session_timeout: 3600,
            features: {
                registration: true,
                forgot_password: true,
                email_verification: true,
                multi_factor: false
            }
        }
    },
    {
        id: "oauth-google",
        name: "Google OAuth",
        description: "Allow users to sign in with Google",
        config: {
            auth_type: "oauth",
            providers: ["google"],
            features: {
                registration: true,
                auto_link_accounts: true
            }
        }
    },
    {
        id: "passwordless",
        name: "Passwordless Magic Links",
        description: "Send login links to user emails",
        config: {
            auth_type: "passwordless",
            providers: ["email"],
            token_expiry: 600,
            features: {
                registration: true
            }
        }
    }
]

export function AuthConfig({ projectId, feature, onChange }: AuthConfigProps) {
    const [config, setConfig] = useState(
        feature.config?.auth_type ? feature.config : AUTH_EXAMPLES[0].config
    )
    const [jsonMode, setJsonMode] = useState(false)

    useEffect(() => {
        onChange(config)
    }, [config, onChange])

    const selectExample = (exampleConfig: any) => {
        setConfig(exampleConfig)
    }

    return (
        <Card className="p-4 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                        <Shield className="w-5 h-5 text-primary" />
                        Auth Configuration
                    </h3>
                    <p className="text-sm text-muted">Select an example or customize your auth settings</p>
                </div>
                <button
                    onClick={() => setJsonMode(!jsonMode)}
                    className="text-xs text-primary hover:underline"
                >
                    {jsonMode ? "Back to UI" : "Edit as JSON"}
                </button>
            </div>

            {!jsonMode ? (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {AUTH_EXAMPLES.map((example) => (
                            <button
                                key={example.id}
                                onClick={() => selectExample(example.config)}
                                className={`p-3 text-left border rounded-lg transition-all hover:border-primary ${config.auth_type === example.config.auth_type && (config.providers?.[0] === example.config.providers?.[0])
                                    ? "border-primary bg-primary/5"
                                    : "border-border bg-surface"
                                    }`}
                            >
                                <p className="text-sm font-medium text-foreground">{example.name}</p>
                                <p className="text-xs text-muted mt-1">{example.description}</p>
                            </button>
                        ))}
                    </div>

                    <div className="space-y-4 pt-4 border-t border-border">
                        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                            <Info className="w-4 h-4 text-primary" />
                            Current Configuration Settings
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-surface rounded border border-border">
                                <p className="text-xs font-medium text-muted mb-1">Auth Type</p>
                                <p className="text-sm text-foreground capitalize">{config.auth_type}</p>
                            </div>
                            <div className="p-3 bg-surface rounded border border-border">
                                <p className="text-xs font-medium text-muted mb-1">Providers</p>
                                <p className="text-sm text-foreground">{config.providers?.join(', ') || 'None'}</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-xs font-medium text-muted">Feature Support</p>
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(config.features || {}).map(([key, value]) => (
                                    <span
                                        key={key}
                                        className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold ${value ? "bg-success/10 text-success border border-success/20" : "bg-muted/10 text-muted border border-border"
                                            }`}
                                    >
                                        {key.replace(/_/g, ' ')}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <textarea
                    value={JSON.stringify(config, null, 2)}
                    onChange={(e) => {
                        try {
                            setConfig(JSON.parse(e.target.value))
                        } catch (e) { }
                    }}
                    className="w-full h-64 bg-background border border-border rounded p-3 font-mono text-sm text-foreground focus:outline-none focus:border-primary"
                />
            )}

            <ExternalAPITesting
                projectId={projectId || ""}
                featureId={feature.id}
            />
        </Card>
    )
}
