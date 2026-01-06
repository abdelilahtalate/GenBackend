"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/card"
import { ExternalAPITesting } from "@/components/dashboard/external-api-testing"
import type { Feature } from "@/types"
import { BarChart3, Plus, Trash2, Calculator, Settings2, Code2 } from "lucide-react"

interface AnalyticsConfigProps {
    projectId?: string
    feature: Feature
    features?: Feature[]
    onChange: (config: any) => void
}

export function AnalyticsConfig({ projectId, feature, features = [], onChange }: AnalyticsConfigProps) {
    const crudFeatures = features.filter(f => {
        const type = (f.feature_type || f.name || "").toUpperCase()
        return ["CRUD", "DATABASE", "RESOURCE"].includes(type)
    })

    const [reports, setReports] = useState<any[]>(
        feature.config?.reports || []
    )
    const [jsonMode, setJsonMode] = useState(false)

    useEffect(() => {
        onChange({ reports })
    }, [reports, onChange])

    const addReport = () => {
        if (crudFeatures.length === 0) return
        const firstTable = crudFeatures[0].config?.table || crudFeatures[0].name.toLowerCase()
        setReports([...reports, {
            name: `Report ${reports.length + 1}`,
            entity: firstTable,
            type: "count",
            field: "id",
            mode: "simple",
            expression: ""
        }])
    }

    const updateReport = (index: number, updates: any) => {
        const newReports = [...reports]
        newReports[index] = { ...newReports[index], ...updates }
        setReports(newReports)
    }

    const removeReport = (index: number) => {
        setReports(reports.filter((_, i) => i !== index))
    }

    if (crudFeatures.length === 0) {
        return (
            <Card className="p-6 text-center space-y-4">
                <BarChart3 className="w-12 h-12 text-muted mx-auto opacity-20" />
                <h3 className="text-lg font-medium text-foreground">No CRUD Tables Found</h3>
                <p className="text-sm text-muted max-w-xs mx-auto">
                    Analytics requires at least one CRUD feature to aggregate data from.
                    Please add a CRUD feature first.
                </p>
            </Card>
        )
    }

    return (
        <Card className="p-4 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-primary" />
                        Data Aggregation Reports
                    </h3>
                    <p className="text-sm text-muted">Define insights from your CRUD tables</p>
                </div>
                <button
                    onClick={() => setJsonMode(!jsonMode)}
                    className="text-xs text-primary hover:underline"
                >
                    {jsonMode ? "Back to UI" : "Edit as JSON"}
                </button>
            </div>

            {!jsonMode ? (
                <div className="space-y-4">
                    {reports.map((report, idx) => {
                        const selectedCrud = crudFeatures.find(f => (f.config?.table || f.name.toLowerCase()) === report.entity)
                        const availableFields = selectedCrud?.config?.fields || []
                        const isAdvanced = report.mode === "advanced"

                        return (
                            <div key={idx} className="p-4 bg-surface rounded-lg border border-border space-y-3 relative overflow-hidden group">
                                <div className={`absolute top-0 left-0 w-1 h-full ${isAdvanced ? 'bg-purple-500' : 'bg-primary'}`} />

                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3 flex-1">
                                        <input
                                            value={report.name}
                                            onChange={(e) => updateReport(idx, { name: e.target.value })}
                                            className="bg-transparent text-sm font-medium text-foreground focus:outline-none border-b border-transparent focus:border-primary w-1/3"
                                            placeholder="Report Name"
                                        />
                                        <div className="flex bg-background rounded p-1 border border-border">
                                            <button
                                                onClick={() => updateReport(idx, { mode: 'simple' })}
                                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors ${!isAdvanced ? 'bg-primary text-background' : 'text-muted-foreground hover:text-foreground'}`}
                                            >
                                                Simple
                                            </button>
                                            <button
                                                onClick={() => updateReport(idx, { mode: 'advanced' })}
                                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors ${isAdvanced ? 'bg-purple-500 text-white' : 'text-muted-foreground hover:text-foreground'}`}
                                            >
                                                Advanced
                                            </button>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeReport(idx)}
                                        className="text-muted hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                                    <div className="sm:col-span-4">
                                        <label className="text-[10px] uppercase font-bold text-muted block mb-1">Entity / Source Table</label>
                                        <select
                                            value={report.entity}
                                            onChange={(e) => updateReport(idx, { entity: e.target.value, field: "id" })}
                                            className="w-full bg-background border border-border rounded px-2 py-1.5 text-xs text-foreground focus:ring-1 focus:ring-primary"
                                        >
                                            {crudFeatures.map(f => {
                                                const tableName = f.config?.table || f.name.toLowerCase()
                                                return <option key={tableName} value={tableName}>{f.name} ({tableName})</option>
                                            })}
                                        </select>
                                    </div>

                                    {!isAdvanced ? (
                                        <>
                                            <div className="sm:col-span-4">
                                                <label className="text-[10px] uppercase font-bold text-muted block mb-1">Metric</label>
                                                <select
                                                    value={report.type}
                                                    onChange={(e) => updateReport(idx, { type: e.target.value })}
                                                    className="w-full bg-background border border-border rounded px-2 py-1.5 text-xs text-foreground focus:ring-1 focus:ring-primary"
                                                >
                                                    <option value="count">Count Total</option>
                                                    <option value="sum">Sum Of</option>
                                                    <option value="avg">Average Of</option>
                                                    <option value="max">Max Value</option>
                                                    <option value="min">Min Value</option>
                                                </select>
                                            </div>

                                            <div className="sm:col-span-4">
                                                <label className="text-[10px] uppercase font-bold text-muted block mb-1">Target Field</label>
                                                <select
                                                    value={report.field}
                                                    disabled={report.type === 'count'}
                                                    onChange={(e) => updateReport(idx, { field: e.target.value })}
                                                    className="w-full bg-background border border-border rounded px-2 py-1.5 text-xs text-foreground focus:ring-1 focus:ring-primary disabled:opacity-50"
                                                >
                                                    {report.type === 'count' ? (
                                                        <option value="id">id (primary key)</option>
                                                    ) : (
                                                        <>
                                                            {availableFields.filter((f: any) => f.type === 'integer' || f.type === 'float' || f.type === 'number').map((f: any) => (
                                                                <option key={f.name} value={f.name}>{f.name}</option>
                                                            ))}
                                                            {availableFields.length === 0 && <option value="id">id</option>}
                                                        </>
                                                    )}
                                                </select>
                                            </div>

                                            <div className="sm:col-span-12">
                                                <label className="text-[10px] uppercase font-bold text-muted block mb-1">Group By (Optional)</label>
                                                <select
                                                    value={report.group_by || ""}
                                                    onChange={(e) => updateReport(idx, { group_by: e.target.value || undefined })}
                                                    className="w-full bg-background border border-border rounded px-2 py-1.5 text-xs text-foreground focus:ring-1 focus:ring-primary"
                                                >
                                                    <option value="">No Grouping</option>
                                                    {availableFields.map((f: any) => (
                                                        <option key={f.name} value={f.name}>{f.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="sm:col-span-8">
                                            <label className="text-[10px] uppercase font-bold text-purple-400 block mb-1 flex items-center gap-1">
                                                <Code2 className="w-3 h-3" />
                                                SQL-Like Expression
                                            </label>
                                            <input
                                                value={report.expression}
                                                onChange={(e) => updateReport(idx, { expression: e.target.value })}
                                                className="w-full bg-background border border-purple-500/30 rounded px-2 py-1.5 text-xs text-foreground font-mono placeholder:text-muted-foreground focus:border-purple-500 focus:outline-none"
                                                placeholder="e.g. count(id) * 1.5, sum(price) / count(*)"
                                            />
                                            <p className="text-[9px] text-muted mt-1">Use standard SQL functions like count, sum, avg, min, max.</p>
                                        </div>
                                    )}
                                </div>

                                {report.sql_preview && (
                                    <div className="text-[10px] bg-background/50 border border-border/50 rounded px-2 py-1 text-muted-foreground italic font-mono truncate">
                                        Query: {report.sql_preview}
                                    </div>
                                )}
                            </div>
                        )
                    })}

                    <button
                        onClick={addReport}
                        className="w-full py-3 border-2 border-dashed border-border rounded-lg text-muted hover:text-primary hover:border-primary transition-all flex items-center justify-center gap-2 text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Add New Aggregator
                    </button>
                </div>
            ) : (
                <textarea
                    value={JSON.stringify({ reports }, null, 2)}
                    onChange={(e) => {
                        try {
                            const parsed = JSON.parse(e.target.value)
                            if (parsed.reports) setReports(parsed.reports)
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
