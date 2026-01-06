"use client"

import { useState, useEffect } from "react"
import { Play, Sparkles, AlertCircle } from "lucide-react"
import { ExternalAPITesting } from "@/components/dashboard/external-api-testing"
import type { Feature } from "@/types"
import { aiApi } from "@/lib/api"

interface FunctionConfigProps {
    projectId?: string
    feature: Feature
    onChange: (config: any) => void
}

export function FunctionConfig({ projectId, feature, onChange }: FunctionConfigProps) {
    const defaultCode = `def handler(input_data):
    """
    Main function handler.
    'input_data' is a dict containing request body or params.
    Return a dict or list as response.
    """
    name = input_data.get('name', 'World')
    return {
        'message': f'Hello {name}!',
        'status': 'success'
    }`

    const [config, setConfig] = useState(
        feature.config || {
            name: feature.name.toLowerCase().replace(/\s+/g, '_'),
            path: `/${feature.name.toLowerCase().replace(/\s+/g, '-')}`,
            method: "POST",
            code: defaultCode,
            input_schema: { type: "object", properties: { name: { type: "string" } } },
            output_schema: { type: "object", properties: { message: { type: "string" } } }
        }
    )

    const [aiPrompt, setAiPrompt] = useState("")
    const [generating, setGenerating] = useState(false)
    const [testing, setTesting] = useState(false)
    const [testResult, setTestResult] = useState<any>(null)
    const [testInput, setTestInput] = useState('{"name": "Developer"}')

    useEffect(() => {
        onChange(config)
    }, [config, onChange])

    const updateField = (field: string, value: any) => {
        setConfig(prev => ({ ...prev, [field]: value }))
    }

    const handleGenerateCode = async () => {
        if (!aiPrompt.trim()) return
        setGenerating(true)
        try {
            const { data, error } = await aiApi.generateCode({
                prompt: aiPrompt,
                name: config.name,
                existing_code: config.code
            })
            if (data && data.code) {
                updateField('code', data.code)
            }
        } catch (err) {
            console.error(err)
        } finally {
            setGenerating(false)
        }
    }

    const handleRunTest = async () => {
        setTesting(true)
        setTestResult(null)
        try {
            const input = JSON.parse(testInput)
            const { data, error } = await aiApi.sandboxExecute(config.code, input)
            if (error) {
                setTestResult({ error })
            } else {
                setTestResult(data)
            }
        } catch (err: any) {
            setTestResult({ error: err.message })
        } finally {
            setTesting(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-medium mb-1 block">Function Name</label>
                    <input
                        type="text"
                        value={config.name}
                        onChange={(e) => updateField('name', e.target.value)}
                        className="w-full bg-background border border-border rounded p-2 text-sm text-foreground focus:outline-none focus:border-primary"
                        placeholder="my_function"
                    />
                </div>
                <div>
                    <label className="text-sm font-medium mb-1 block">HTTP Method</label>
                    <select
                        value={config.method}
                        onChange={(e) => updateField('method', e.target.value)}
                        className="w-full bg-background border border-border rounded p-2 text-sm text-foreground focus:outline-none focus:border-primary"
                    >
                        <option>GET</option>
                        <option>POST</option>
                        <option>PUT</option>
                        <option>DELETE</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="text-sm font-medium mb-1 block">Endpoint Path</label>
                <input
                    type="text"
                    value={config.path}
                    onChange={(e) => updateField('path', e.target.value)}
                    className="w-full bg-background border border-border rounded p-2 text-sm text-foreground focus:outline-none focus:border-primary"
                    placeholder="/api/my-endpoint"
                />
            </div>

            <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Logic (Python)</label>
                    <div className="flex gap-2">
                        <span className="text-[10px] text-muted flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Define 'handler(input_data)'
                        </span>
                    </div>
                </div>

                <div className="bg-surface-secondary/50 rounded-lg border border-border p-3 space-y-3">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            className="flex-1 bg-background border border-border rounded px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary"
                            placeholder="Describe logic (e.g. 'Calculate discount' or 'Fetch currency')"
                        />
                        <button
                            onClick={handleGenerateCode}
                            disabled={generating || !aiPrompt}
                            className="bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 px-3 py-1.5 rounded text-xs flex items-center gap-2 transition-colors disabled:opacity-50"
                        >
                            <Sparkles className={`w-3 h-3 ${generating ? 'animate-spin' : ''}`} />
                            {generating ? 'Generating...' : 'AI Generate'}
                        </button>
                    </div>

                    <textarea
                        value={config.code}
                        onChange={(e) => updateField('code', e.target.value)}
                        className="w-full h-64 bg-background border border-border rounded p-3 font-mono text-sm text-foreground focus:outline-none focus:border-primary"
                        spellCheck={false}
                    />
                </div>
            </div>

            <div className="border-t border-border pt-4">
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Play className="w-4 h-4 text-primary" />
                    Quick Sandbox Test
                </h4>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-medium text-muted uppercase tracking-wider">Test Input (JSON)</label>
                        <textarea
                            value={testInput}
                            onChange={(e) => setTestInput(e.target.value)}
                            className="w-full h-24 bg-background border border-border rounded p-2 font-mono text-xs text-foreground focus:outline-none focus:border-primary"
                        />
                        <button
                            onClick={handleRunTest}
                            disabled={testing}
                            className="w-full py-1.5 bg-surface-secondary border border-border rounded text-xs hover:border-primary transition-colors flex items-center justify-center gap-2"
                        >
                            {testing ? 'Executing...' : 'Run Sandbox'}
                        </button>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-medium text-muted uppercase tracking-wider">Result</label>
                        <div className="w-full h-32 bg-background border border-border rounded p-2 font-mono text-xs text-muted overflow-auto">
                            {testResult ? (
                                <pre>{JSON.stringify(testResult, null, 2)}</pre>
                            ) : (
                                <span className="text-muted-foreground/50 italic">Execute code to see result...</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 opacity-50">
                <div>
                    <label className="text-[10px] font-medium mb-1 block uppercase">Input Schema (Auto-mapped)</label>
                    <textarea
                        readOnly
                        value={JSON.stringify(config.input_schema, null, 2)}
                        className="w-full h-24 bg-background border border-border rounded p-2 font-mono text-[10px] text-foreground focus:outline-none cursor-not-allowed"
                    />
                </div>
                <div>
                    <label className="text-[10px] font-medium mb-1 block uppercase">Output Schema (Auto-mapped)</label>
                    <textarea
                        readOnly
                        value={JSON.stringify(config.output_schema, null, 2)}
                        className="w-full h-24 bg-background border border-border rounded p-2 font-mono text-[10px] text-foreground focus:outline-none cursor-not-allowed"
                    />
                </div>
            </div>

            <ExternalAPITesting
                projectId={projectId || ""}
                featureId={feature.id}
            />
        </div>
    )
}
