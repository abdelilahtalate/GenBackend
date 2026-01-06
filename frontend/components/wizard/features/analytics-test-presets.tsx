"use client"

import { Card } from "@/components/card"
import { MousePointer2, BarChart3, Activity } from "lucide-react"

interface AnalyticsTestPresetsProps {
    onSelect: (preset: { method: string, endpoint: string, body: string }) => void
}

const PRESETS = [
    {
        id: "get_summary",
        name: "View Data Summary",
        description: "Retrieve aggregated metrics from CRUD tables",
        icon: BarChart3,
        method: "GET",
        endpoint: "/api/analytics/summary",
        body: "{}"
    }
]

export function AnalyticsTestPresets({ onSelect }: AnalyticsTestPresetsProps) {
    return (
        <div className="space-y-3 mb-6">
            <p className="text-sm font-medium text-foreground">Analytics Test Presets</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {PRESETS.map((preset) => (
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
