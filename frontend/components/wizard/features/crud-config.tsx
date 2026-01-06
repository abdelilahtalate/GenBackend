"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/card"
import { ExternalAPITesting } from "@/components/dashboard/external-api-testing"
import type { Feature } from "@/types"

interface CrudConfigProps {
    projectId?: string
    feature: Feature
    onChange: (config: any) => void
}

export function CrudConfig({ projectId, feature, onChange }: CrudConfigProps) {
    const [jsonConfig, setJsonConfig] = useState(
        JSON.stringify(
            feature.config || {
                table: feature.name.toLowerCase(),
                primary_key: "id",
                fields: [
                    { name: "id", type: "integer", auto_increment: true },
                    { name: "name", type: "string", required: true },
                ],
                features: {
                    create: true,
                    read: true,
                    update: true,
                    delete: true,
                },
            },
            null,
            2
        )
    )
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        try {
            const parsed = JSON.parse(jsonConfig)
            setError(null)
            onChange(parsed)
        } catch (e) {
            setError("Invalid JSON format")
        }
    }, [jsonConfig, onChange])

    return (
        <Card className="p-4 space-y-4">
            <div>
                <h3 className="font-semibold mb-2">CRUD Configuration</h3>
                <p className="text-sm text-muted mb-4">
                    Define your table schema and operations.
                </p>
            </div>

            <div>
                <label className="text-sm font-medium mb-1 block">Schema JSON</label>
                <textarea
                    value={jsonConfig}
                    onChange={(e) => setJsonConfig(e.target.value)}
                    className={`w-full h-64 bg-background border rounded p-3 font-mono text-sm ${error ? "border-destructive" : "border-border"
                        }`}
                />
                {error && <p className="text-destructive text-xs mt-1">{error}</p>}
            </div>

            <ExternalAPITesting
                projectId={projectId || ""}
                featureId={feature.id}
            />
        </Card>
    )
}
