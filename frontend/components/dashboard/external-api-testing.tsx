"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/card"
import { Button } from "@/components/button"
import { Copy, Check, ChevronDown, ChevronUp, Terminal, Globe, Send } from "lucide-react"
import { apiRequest } from "@/lib/api"

interface Endpoint {
    method: string
    path: string
    description: string
    body: any
    curl: string
    raw: string
    postman: string
}

interface ExternalAPITestingProps {
    projectId: string
    featureId: string
    apiKey?: string
}

export function ExternalAPITesting({ projectId, featureId, apiKey }: ExternalAPITestingProps) {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({})
    const [expandedEndpoints, setExpandedEndpoints] = useState<{ [key: string]: boolean }>({})
    const [testLoading, setTestLoading] = useState<string | null>(null)
    const [testResult, setTestResult] = useState<{ [key: string]: any }>({})

    useEffect(() => {
        // ... rest of the code
        async function fetchMetadata() {
            setLoading(true)
            try {
                const response = await apiRequest(`/api/features/project/${projectId}/features/${featureId}/endpoints`)
                if (response.error) throw new Error(response.error)
                if (response.data) {
                    setData(response.data)
                }
            } catch (err: any) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        if (projectId && featureId) {
            fetchMetadata()
        }
    }, [projectId, featureId, apiKey])

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text)
        setCopiedStates({ ...copiedStates, [id]: true })
        setTimeout(() => {
            setCopiedStates({ ...copiedStates, [id]: false })
        }, 2000)
    }

    const toggleExpand = (index: number) => {
        setExpandedEndpoints({
            ...expandedEndpoints,
            [index]: !expandedEndpoints[index]
        })
    }

    const handleTestRequest = async (ep: Endpoint) => {
        setTestLoading(ep.path)
        try {
            const externalUrl = `${data.base_url}/api/features/external/${ep.path}`
            const options: any = {
                method: ep.method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-KEY': apiKey
                }
            }

            if (ep.method !== 'GET' && ep.method !== 'DELETE' && ep.body) {
                options.body = JSON.stringify(ep.body)
            }

            const res = await fetch(externalUrl, options)
            const resultData = await res.json()

            setTestResult(prev => ({
                ...prev,
                [ep.path]: {
                    status: res.status,
                    data: resultData
                }
            }))

            // Expand to show result
            const idx = data.endpoints.findIndex((e: any) => e.path === ep.path)
            if (idx !== -1) setExpandedEndpoints(prev => ({ ...prev, [idx]: true }))

        } catch (err: any) {
            setTestResult(prev => ({
                ...prev,
                [ep.path]: {
                    status: 'Error',
                    data: { error: err.message }
                }
            }))
        } finally {
            setTestLoading(null)
        }
    }

    if (loading) return <div className="p-4 animate-pulse bg-muted rounded-lg h-32" />
    if (error) return <div className="p-4 text-destructive bg-destructive/10 rounded-lg">Error: {error}</div>
    if (!data) return null

    return (
        <Card className="p-6 space-y-6 bg-card border-border/50 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Globe size={120} />
            </div>

            <div className="relative z-10">
                <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-foreground mb-1">
                    External API Testing
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                    Test your endpoints from Postman, curl, or any external HTTP client.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
                        <span className="text-xs font-semibold uppercase text-muted-foreground block mb-1">Base URL</span>
                        <code className="text-sm font-mono text-primary">{data.base_url}</code>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
                        <span className="text-xs font-semibold uppercase text-muted-foreground block mb-1">X-API-KEY</span>
                        <div className="flex items-center justify-between">
                            <code className="text-sm font-mono text-primary truncate mr-2">
                                {data.headers["X-API-KEY"].substring(0, 8)}...
                            </code>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2"
                                onClick={() => handleCopy(data.headers["X-API-KEY"], "apikey")}
                            >
                                {copiedStates["apikey"] ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-muted-foreground px-1">Available Endpoints</h4>
                    {data.endpoints.map((ep: Endpoint, idx: number) => (
                        <div key={idx} className="border border-border/40 rounded-xl overflow-hidden bg-muted/10 hover:bg-muted/20 transition-all duration-200">
                            <div
                                className="p-4 flex items-center justify-between cursor-pointer"
                                onClick={() => toggleExpand(idx)}
                            >
                                <div className="flex items-center space-x-3">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${ep.method === 'GET' ? 'bg-blue-500/10 text-blue-500' :
                                        ep.method === 'POST' ? 'bg-green-500/10 text-green-500' :
                                            ep.method === 'PUT' ? 'bg-amber-500/10 text-amber-500' :
                                                'bg-red-500/10 text-red-500'
                                        }`}>
                                        {ep.method}
                                    </span>
                                    <span className="font-mono text-sm font-medium">{ep.path}</span>
                                    <span className="text-xs text-muted-foreground hidden sm:inline">- {ep.description}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 px-3 border-primary/30 hover:border-primary text-xs"
                                        disabled={testLoading === ep.path}
                                        onClick={(e?: React.MouseEvent<HTMLButtonElement>) => {
                                            if (e) e.stopPropagation()
                                            handleTestRequest(ep)
                                        }}
                                    >
                                        <div className="flex items-center">
                                            {testLoading === ep.path ? (
                                                <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
                                            ) : (
                                                <Send size={12} className="mr-2" />
                                            )}
                                            {testLoading === ep.path ? "Testing..." : "Test Live"}
                                        </div>
                                    </Button>
                                    {expandedEndpoints[idx] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </div>
                            </div>

                            {expandedEndpoints[idx] && (
                                <div className="p-4 pt-0 space-y-4 border-t border-border/20 bg-muted/5">
                                    {testResult[ep.path] && (
                                        <div className={`p-3 rounded-lg text-xs font-mono overflow-auto max-h-40 border ${testResult[ep.path].status >= 200 && testResult[ep.path].status < 300
                                            ? 'bg-green-500/5 border-green-500/20 text-green-400'
                                            : 'bg-red-500/5 border-red-500/20 text-red-400'
                                            }`}>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-bold uppercase">Response Status: {testResult[ep.path].status}</span>
                                                <Button size="sm" variant="ghost" className="h-5 px-1" onClick={() => setTestResult({ ...testResult, [ep.path]: null })}>×</Button>
                                            </div>
                                            <pre>{JSON.stringify(testResult[ep.path].data, null, 2)}</pre>
                                        </div>
                                    )}
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between px-1">
                                                <span className="text-[10px] font-bold uppercase text-muted-foreground flex items-center">
                                                    <Terminal size={12} className="mr-1" /> curl Example
                                                </span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 px-2 hover:bg-primary/10"
                                                    onClick={() => handleCopy(ep.curl, `curl-${idx}`)}
                                                >
                                                    {copiedStates[`curl-${idx}`] ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                                                </Button>
                                            </div>
                                            <pre className="p-3 bg-[#0f172a] text-[#f8fafc] rounded-lg text-[11px] font-mono overflow-x-auto border border-blue-500/20 shadow-inner">
                                                {ep.curl}
                                            </pre>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between px-1">
                                                    <span className="text-[10px] font-bold uppercase text-muted-foreground flex items-center">
                                                        <Send size={12} className="mr-1" /> Raw HTTP
                                                    </span>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 px-2"
                                                        onClick={() => handleCopy(ep.raw, `raw-${idx}`)}
                                                    >
                                                        {copiedStates[`raw-${idx}`] ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                                                    </Button>
                                                </div>
                                                <pre className="p-3 bg-muted/50 rounded-lg text-[11px] font-mono overflow-x-auto h-32">
                                                    {ep.raw}
                                                </pre>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between px-1">
                                                    <span className="text-[10px] font-bold uppercase text-muted-foreground flex items-center">
                                                        <Globe size={12} className="mr-1" /> Postman JSON
                                                    </span>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 px-2"
                                                        onClick={() => handleCopy(ep.postman, `postman-${idx}`)}
                                                    >
                                                        {copiedStates[`postman-${idx}`] ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                                                    </Button>
                                                </div>
                                                <pre className="p-3 bg-muted/50 rounded-lg text-[11px] font-mono overflow-x-auto h-32">
                                                    {ep.postman}
                                                </pre>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    )
}
