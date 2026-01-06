"use client"

import type { Feature } from "@/types"
import { Card } from "@/components/card"
import { useState, useEffect } from "react"
import { Play, Copy, Check, Sparkles, Eye, Code, ChevronDown, ChevronUp, Database, Shield, BarChart3, Zap } from "lucide-react"
import { featuresApi, aiApi } from "@/lib/api"
import { AuthTestPresets } from "./features/auth-test-presets"
import { AnalyticsTestPresets } from "./features/analytics-test-presets"

interface Step5Props {
  features: Feature[]
  projectId?: string
}

export function Step5Testing({ features, projectId }: Step5Props) {
  const [activeTab, setActiveTab] = useState<string>(features[0]?.id || "")

  // Dynamic endpoint generation based on active feature
  const currentFeature = features.find((f) => f.id === activeTab)

  const [endpoint, setEndpoint] = useState("/api/items")
  const [method, setMethod] = useState("GET")
  const [body, setBody] = useState("{}")
  const [response, setResponse] = useState("")
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [useAiAssistant, setUseAiAssistant] = useState(false)
  const [aiPrompt, setAiPrompt] = useState("")
  const [generatingData, setGeneratingData] = useState(false)
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([])
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    if (!currentFeature) return

    const fetchSuggestions = async () => {
      const featureType =
        currentFeature.feature_type?.toUpperCase() ||
        (currentFeature.name.includes('Functions') || currentFeature.name.startsWith('Function') ? 'FUNCTIONS' :
          currentFeature.name.includes('Auth') ? 'AUTH' :
            currentFeature.name.includes('Analytics') ? 'ANALYTICS' : 'CRUD')

      const { data } = await aiApi.getSuggestedPrompts('test_data', {
        name: currentFeature.name,
        feature_type: featureType,
        schema: currentFeature.config || {}
      })
      if (data && data.prompts) {
        setSuggestedPrompts(data.prompts)
      }
    }
    fetchSuggestions()
  }, [currentFeature?.id])

  // Update endpoint when tab changes
  useEffect(() => {
    if (currentFeature) {
      const type = currentFeature.feature_type?.toUpperCase() ||
        (currentFeature.name.includes('Auth') ? 'AUTH' :
          currentFeature.name.includes('Analytics') ? 'ANALYTICS' :
            (currentFeature.name.includes('Functions') || currentFeature.name.startsWith('Function')) ? 'FUNCTIONS' : 'CRUD');

      if (type === 'AUTH') {
        setEndpoint('/api/auth/login')
        setMethod('GET')
      } else if (type === 'ANALYTICS') {
        setEndpoint('/api/analytics/stats')
        setMethod('GET')
      } else {
        setEndpoint(`/api/${currentFeature.name.toLowerCase().replace(/\s+/g, '-')}`)
        setMethod('GET')
      }
    }
  }, [currentFeature])

  const handleTest = async () => {
    setLoading(true)
    setResponse("")

    try {
      const requestBody = method !== "GET" ? JSON.parse(body) : undefined
      // Pass the features config (schema) to the backend
      const featureType =
        currentFeature?.feature_type?.toUpperCase() ||
        (currentFeature?.name?.includes('Functions') || currentFeature?.name?.startsWith('Function') ? 'FUNCTIONS' :
          currentFeature?.name?.includes('Auth') ? 'AUTH' :
            currentFeature?.name?.includes('Analytics') ? 'ANALYTICS' : 'CRUD')

      const result = await featuresApi.test(
        endpoint,
        method,
        requestBody,
        currentFeature?.config || currentFeature?.configuration,
        featureType,
        projectId
      )

      if (result.error) {
        // Use the error data from backend if available, otherwise fallback to result.error
        const errorDisplay = result.data || {
          status: 400,
          error: result.error,
          message: result.message || "Request failed",
        }
        setResponse(JSON.stringify(errorDisplay, null, 2))
      } else if (result.data) {
        setResponse(JSON.stringify(result.data, null, 2))
      } else {
        setResponse(
          JSON.stringify(
            {
              status: 400,
              error: "Request failed",
              message: "No response data received",
            },
            null,
            2,
          ),
        )
      }
    } catch (error) {
      setResponse(
        JSON.stringify(
          {
            status: 400,
            error: "Request failed",
            message: error instanceof Error ? error.message : "Check your endpoint and request body",
          },
          null,
          2,
        ),
      )
    } finally {
      setLoading(false)
    }
  }

  const copyResponse = () => {
    navigator.clipboard.writeText(response)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleGenerateData = async () => {
    if (!currentFeature) return

    setGeneratingData(true)
    const featureType =
      currentFeature.feature_type?.toUpperCase() ||
      (currentFeature.name.includes('Functions') || currentFeature.name.startsWith('Function') ? 'FUNCTIONS' :
        currentFeature.name.includes('Auth') ? 'AUTH' :
          currentFeature.name.includes('Analytics') ? 'ANALYTICS' : 'CRUD')

    try {
      const { data, error } = await aiApi.generateTestData(
        featureType,
        currentFeature.config || currentFeature.configuration || {},
        aiPrompt
      )

      if (error) {
        throw new Error(error)
      }

      if (data && data.test_data) {
        setBody(JSON.stringify(data.test_data, null, 2))
      }
    } catch (e: any) {
      console.error("Failed to generate test data:", e)
    } finally {
      setGeneratingData(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Test Your API</h2>
        <p className="text-muted">Make requests to your generated APIs and see responses</p>
      </div>

      {features.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {features.map((feature) => (
            <button
              key={feature.id}
              onClick={() => setActiveTab(feature.id)}
              className={`px-4 py-2 rounded-lg border whitespace-nowrap transition-colors ${activeTab === feature.id
                ? "bg-primary text-background border-primary"
                : "bg-surface-secondary border-border"
                }`}
            >
              {feature.name}
            </button>
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Request */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Request</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowDetails(!showDetails)}
                title={showDetails ? "Hide Details" : "Show Feature Details"}
                className={`p-1.5 rounded-md border transition-all ${showDetails ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-surface-secondary border-border text-muted hover:text-foreground'}`}
              >
                {showDetails ? <Eye className="w-4 h-4" /> : <Code className="w-4 h-4" />}
              </button>
              <div className="text-[10px] px-2 py-0.5 rounded-full bg-surface-secondary border border-border text-muted-foreground font-mono">
                {(currentFeature?.feature_type?.toUpperCase() ||
                  (currentFeature?.name?.includes('Functions') || currentFeature?.name?.startsWith('Function') ? 'FUNCTIONS' :
                    currentFeature?.name?.includes('Auth') ? 'AUTH' :
                      currentFeature?.name?.includes('Analytics') ? 'ANALYTICS' : 'CRUD'))} TEST
              </div>
            </div>
          </div>

          {showDetails && (
            <div className="p-4 bg-surface-secondary/50 rounded-lg border border-border animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-primary uppercase tracking-wider">
                {currentFeature?.feature_type?.toUpperCase() === 'FUNCTIONS' || currentFeature?.name?.includes('Function') ? <Zap className="w-3 h-3" /> :
                  currentFeature?.feature_type?.toUpperCase() === 'AUTH' || currentFeature?.name?.includes('Auth') ? <Shield className="w-3 h-3" /> :
                    currentFeature?.feature_type?.toUpperCase() === 'ANALYTICS' || currentFeature?.name?.includes('Analytics') ? <BarChart3 className="w-3 h-3" /> :
                      <Database className="w-3 h-3" />}
                {currentFeature?.name} Configuration
              </div>

              {/* Function Details */}
              {(currentFeature?.feature_type?.toUpperCase() === 'FUNCTIONS' || currentFeature?.name?.includes('Function')) && (
                <div className="space-y-2">
                  <div className="text-[10px] text-muted-foreground font-mono bg-background/50 p-2 rounded border border-border/50 max-h-60 overflow-auto">
                    <pre className="text-primary/80">{currentFeature.config?.code || '# No code defined'}</pre>
                  </div>
                  <div className="flex gap-4 text-[10px] text-muted-foreground">
                    <span>Method: <span className="text-foreground">{currentFeature?.config?.method || 'POST'}</span></span>
                    <span>Path: <span className="text-foreground">{currentFeature?.config?.path || `/api/${currentFeature?.name?.toLowerCase()}`}</span></span>
                  </div>
                </div>
              )}

              {/* CRUD Details */}
              {(currentFeature?.feature_type?.toUpperCase() === 'CRUD' || (!currentFeature?.feature_type && !currentFeature?.name?.includes('Auth') && !currentFeature?.name?.includes('Analytics') && !currentFeature?.name?.includes('Function'))) && (
                <div className="space-y-2">
                  <div className="text-[10px] font-medium text-muted-foreground mb-1">Table: <span className="text-foreground font-mono">{currentFeature?.config?.table || currentFeature?.name?.toLowerCase()}</span></div>
                  <div className="grid grid-cols-2 gap-2">
                    {currentFeature?.config?.fields?.map((field: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-1.5 bg-background/50 rounded border border-border/50 text-[10px]">
                        <span className="font-mono text-foreground">{field.name}</span>
                        <span className="text-muted-foreground lowercase">{field.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Auth Details */}
              {(currentFeature?.feature_type?.toUpperCase() === 'AUTH' || currentFeature?.name?.includes('Auth')) && (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {currentFeature.config?.providers?.map((p: string) => (
                      <span key={p} className="px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded text-[10px] font-bold uppercase">{p}</span>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(currentFeature.config?.features || {}).map(([key, val]) => (
                      <div key={key} className={`flex items-center justify-between p-1.5 rounded border text-[10px] ${val ? 'bg-success/5 border-success/20 text-success' : 'bg-muted/5 border-border text-muted-foreground opacity-50'}`}>
                        <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                        {val ? <Check className="w-3 h-3" /> : null}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Analytics Details */}
              {(currentFeature?.feature_type?.toUpperCase() === 'ANALYTICS' || currentFeature?.name?.includes('Analytics')) && (
                <div className="space-y-2">
                  {currentFeature.config?.reports?.map((report: any, idx: number) => (
                    <div key={idx} className="p-2 bg-background/50 rounded border border-border/50 space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-medium text-foreground">{report.name}</span>
                        <span className="text-primary italic">{report.type}</span>
                      </div>
                      <div className="text-[9px] text-muted-foreground truncate font-mono">
                        Source: {report.entity} {report.field ? `(${report.field})` : ''}
                      </div>
                      {report.sql_preview && (
                        <div className="text-[9px] bg-background/50 border border-border/50 rounded px-1.5 py-1 text-primary/70 font-mono mt-1 italic break-all">
                          Query: {report.sql_preview}
                        </div>
                      )}
                    </div>
                  ))}
                  {(!currentFeature.config?.reports || currentFeature.config.reports.length === 0) && (
                    <div className="text-[10px] text-muted-foreground italic text-center py-2">No reports configured</div>
                  )}
                </div>
              )}
            </div>
          )}

          {(currentFeature?.feature_type?.toUpperCase() === 'AUTH' || currentFeature?.name?.includes('Auth')) && (
            <AuthTestPresets
              config={currentFeature?.config}
              onSelect={(preset: any) => {
                setMethod(preset.method)
                setEndpoint(preset.endpoint)
                setBody(preset.body)
              }}
            />
          )}

          {(currentFeature?.feature_type?.toUpperCase() === 'ANALYTICS' || currentFeature?.name?.includes('Analytics')) && (
            <AnalyticsTestPresets
              onSelect={(preset: any) => {
                setMethod(preset.method)
                setEndpoint(preset.endpoint)
                setBody(preset.body)
              }}
            />
          )}

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Method</label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full bg-background border border-border rounded p-2 text-foreground text-sm"
                >
                  <option>GET</option>
                  <option>POST</option>
                  <option>PUT</option>
                  <option>DELETE</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Endpoint</label>
                <input
                  type="text"
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                  className="w-full bg-background border border-border rounded p-2 text-foreground text-sm focus:outline-none focus:border-primary"
                  placeholder="/api/endpoint"
                />
              </div>
            </div>

            {method !== "GET" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">Body</label>
                  <button
                    onClick={() => setUseAiAssistant(!useAiAssistant)}
                    className={`text-xs flex items-center gap-1.5 px-2 py-1 rounded transition-colors ${useAiAssistant ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-surface-secondary text-muted hover:text-foreground border border-border'}`}
                  >
                    <Sparkles className="w-3 h-3" />
                    AI Assistant
                  </button>
                </div>

                {useAiAssistant ? (
                  <div className="space-y-3 p-3 bg-surface-secondary/50 rounded-lg border border-border border-dashed">
                    <p className="text-xs text-muted italic">Describe the data you want to generate:</p>

                    {suggestedPrompts.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {suggestedPrompts.map((p, i) => (
                          <button
                            key={i}
                            onClick={() => setAiPrompt(p)}
                            className="text-[10px] bg-background hover:bg-surface border border-border px-2 py-0.5 rounded transition-colors text-muted-foreground hover:text-foreground"
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    )}

                    <textarea
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      className="w-full h-20 bg-background border border-border rounded p-2 text-foreground text-sm focus:outline-none focus:border-primary resize-none"
                      placeholder="Requirements for generated data..."
                    />
                    <button
                      onClick={handleGenerateData}
                      disabled={generatingData}
                      className="w-full bg-surface-secondary border border-border text-foreground hover:border-primary text-xs py-1.5 rounded flex items-center justify-center gap-2 transition-all"
                    >
                      <Sparkles className={`w-3 h-3 ${generatingData ? 'animate-spin' : ''}`} />
                      {generatingData ? "Generating..." : "Generate Body with AI"}
                    </button>
                  </div>
                ) : null}

                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full h-32 bg-background border border-border rounded p-2 text-foreground text-sm font-mono focus:outline-none focus:border-primary resize-none"
                  placeholder="{}"
                />
              </div>
            )}

            <button
              onClick={handleTest}
              disabled={loading}
              className="w-full bg-primary text-background py-2 rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" />
              {loading ? "Testing..." : "Send Request"}
            </button>
          </div>
        </Card>

        {/* Response */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Response</h3>
            {response && (
              <button
                onClick={copyResponse}
                className="flex items-center gap-2 px-2 py-1 hover:bg-surface-secondary rounded text-xs"
              >
                {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied" : "Copy"}
              </button>
            )}
          </div>

          {response ? (
            <pre className="bg-background p-4 rounded border border-border text-xs text-muted overflow-auto max-h-64 font-mono">
              {response}
            </pre>
          ) : (
            <div className="bg-background p-4 rounded border border-border text-center text-muted text-sm h-48 flex items-center justify-center">
              Send a request to see response
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
