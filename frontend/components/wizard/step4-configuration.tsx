"use client"

import type { Feature } from "@/types"
import { Card } from "@/components/card"
import { useState, useEffect, useRef, useCallback } from "react"
import { aiApi } from "@/lib/api"

interface Step4Props {
  projectId?: string
  features: Feature[]
  updateFeature: (id: string, updates: Partial<Feature>) => void
}

export function Step4Configuration({ projectId, features, updateFeature }: Step4Props) {
  const [activeFeature, setActiveFeature] = useState(features[0]?.id)

  const currentFeature = features.find((f) => f.id === activeFeature)
  const crudFeatures = features.filter(f => f.feature_type === "CRUD" || f.name === "CRUD")
  const isCrudPending = crudFeatures.some(f => !f.config || Object.keys(f.config).length === 0 || !f.config.table)
  const isAnalyticsSelected = currentFeature?.feature_type === "ANALYTICS" || currentFeature?.name === "Analytics"

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Configure Features</h2>
        <p className="text-muted">Set up each feature based on your chosen generation mode</p>
      </div>

      {features.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {features.map((feature) => (
            <button
              key={feature.id}
              onClick={() => setActiveFeature(feature.id)}
              className={`px-4 py-2 rounded-lg border whitespace-nowrap transition-colors ${activeFeature === feature.id
                ? "bg-primary text-background border-primary"
                : "bg-surface-secondary border-border hover:border-primary"
                }`}
            >
              {feature.name}
            </button>
          ))}
        </div>
      )}

      {currentFeature && (
        <Card className="space-y-4">
          {isAnalyticsSelected && isCrudPending ? (
            <div className="p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-warning/10 text-warning rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0 0v2m0-2h2m-2 0H10m-3-3l-2.293-2.293a1 1 0 010-1.414l7-7a1 1 0 011.414 0l7 7a1 1 0 010 1.414L15 12m-3 3L9 12h6l-3 3z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-foreground">Complete CRUD Setup First</h3>
              <p className="text-muted max-w-md mx-auto">
                Analytics needs to know about your database tables to perform aggregations.
                Please finish configuring your <strong>CRUD</strong> features before setting up Analytics.
              </p>
              <button
                onClick={() => {
                  const firstCrud = crudFeatures.find(f => !f.config || !f.config.table)
                  if (firstCrud) setActiveFeature(firstCrud.id)
                }}
                className="px-6 py-2 bg-primary text-background rounded-full font-medium hover:bg-primary-dark transition-colors"
              >
                Go to CRUD Configuration
              </button>
            </div>
          ) : (
            <>
              {currentFeature.mode === "manual" && (
                <ManualConfiguration projectId={projectId} feature={currentFeature} features={features} onUpdate={updateFeature} />
              )}
              {currentFeature.mode === "ai" && <AIConfiguration projectId={projectId} feature={currentFeature} features={features} onUpdate={updateFeature} />}
              {currentFeature.mode === "mixed" && <MixedConfiguration projectId={projectId} feature={currentFeature} features={features} onUpdate={updateFeature} />}
            </>
          )}
        </Card>
      )}
    </div>
  )
}

import { CrudConfig } from "./features/crud-config"
import { FunctionConfig } from "./features/function-config"
import { AuthConfig } from "./features/auth-config"
import { AnalyticsConfig } from "./features/analytics-config"

// ... (existing imports)

// ...

function ManualConfiguration({
  projectId,
  feature,
  features,
  onUpdate,
}: {
  projectId?: string
  feature: Feature
  features: Feature[]
  onUpdate: (id: string, updates: Partial<Feature>) => void
}) {
  const [rawConfig, setRawConfig] = useState(() => JSON.stringify(feature.config || {}, null, 2))
  const [error, setError] = useState("")
  const prevConfigRef = useRef<string>("")

  // Update rawConfig if feature.config changes externally
  useEffect(() => {
    const currentConfigString = JSON.stringify(feature.config || {})
    if (prevConfigRef.current !== currentConfigString) {
      prevConfigRef.current = currentConfigString
      setRawConfig(JSON.stringify(feature.config || {}, null, 2))
    }
  }, [feature.config])

  const handleConfigChange = useCallback((config: any) => {
    onUpdate(feature.id, { config })
  }, [feature.id, onUpdate])

  const handleBlur = () => {
    try {
      const parsed = JSON.parse(rawConfig)
      setError("")
      onUpdate(feature.id, { config: parsed })
    } catch {
      setError("Invalid JSON. Please fix it.")
    }
  }
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-foreground">Manual Configuration</h3>
      <p className="text-sm text-muted">Configure {feature.name} using the UI below</p>

      <div className="bg-surface p-4 rounded-lg border border-border">
        <p className="text-sm text-muted mb-4">Configuration interface for {feature.name}</p>
        {error && <p className="text-sm text-red-500 mb-2">{error}</p>}
        {feature.feature_type === "CRUD" || feature.name === "CRUD" ? (
          <CrudConfig
            projectId={projectId}
            feature={feature}
            onChange={handleConfigChange}
          />
        ) : feature.feature_type === "FUNCTIONS" || feature.name === "Functions" ? (
          <FunctionConfig
            projectId={projectId}
            feature={feature}
            onChange={handleConfigChange}
          />
        ) : feature.feature_type === "AUTH" || feature.name === "Auth" ? (
          <AuthConfig
            projectId={projectId}
            feature={feature}
            onChange={handleConfigChange}
          />
        ) : feature.feature_type === "ANALYTICS" || feature.name === "Analytics" ? (
          <AnalyticsConfig
            projectId={projectId}
            feature={feature}
            features={features}
            onChange={handleConfigChange}
          />
        ) : (
          <textarea
            value={rawConfig}
            onChange={(e) => setRawConfig(e.target.value)}
            onBlur={handleBlur}
            className="w-full h-48 bg-background border border-border rounded p-3 font-mono text-sm text-foreground focus:outline-none focus:border-primary"
            placeholder="Configuration as JSON"
          />
        )}
      </div>
    </div>
  )
}

function AIConfiguration({
  projectId,
  feature,
  features,
  onUpdate,
}: {
  projectId?: string
  feature: Feature
  features: Feature[]
  onUpdate: (id: string, updates: Partial<Feature>) => void
}) {
  const [prompt, setPrompt] = useState("")
  const [preview, setPreview] = useState("")
  const [loading, setLoading] = useState(false)
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([])

  useEffect(() => {
    const fetchSuggestions = async () => {
      const { data } = await aiApi.getSuggestedPrompts('config', {
        name: feature.name,
        feature_type: feature.feature_type || (feature.name === 'Functions' ? 'FUNCTIONS' : feature.name === 'Auth' ? 'AUTH' : feature.name === 'Analytics' ? 'ANALYTICS' : 'CRUD'),
        crud_features: features.filter(f => f.feature_type === 'CRUD' || f.name === 'CRUD')
      })
      if (data && data.prompts) {
        setSuggestedPrompts(data.prompts)
      }
    }
    fetchSuggestions()
  }, [feature.name])

  const handleGenerate = async () => {
    setLoading(true)
    setPreview("")
    try {
      const { data, error } = await aiApi.generateConfig(
        feature.feature_type || (feature.name === 'Functions' ? 'FUNCTIONS' : feature.name === 'Auth' ? 'AUTH' : feature.name === 'Analytics' ? 'ANALYTICS' : 'CRUD'),
        prompt,
        {
          ...(feature.config || {}),
          crud_features: features.filter(f => f.feature_type === 'CRUD' || f.name === 'CRUD')
        }
      )

      if (error) {
        throw new Error(error)
      }

      if (data && data.config) {
        // Display the full AI response
        let previewText = `✅ ${data.message || 'Configuration generated successfully!'}\n\n` +
          `🤖 Model: ${data.ai_response?.model_used || 'AI'}\n\n`

        // Specifically show SQL previews for Analytics
        if (feature.name === 'Analytics' && data.config.reports) {
          previewText += `📊 Aggregation Queries:\n`
          data.config.reports.forEach((r: any) => {
            if (r.sql_preview) {
              previewText += `- ${r.name}: ${r.sql_preview}\n`
            }
          })
          previewText += `\n`
        }

        previewText += `📋 Generated Configuration:\n${JSON.stringify(data.config, null, 2)}\n\n` +
          (data.ai_response?.raw_text ? `💬 AI Response:\n${data.ai_response.raw_text}` : '')

        setPreview(previewText)
        onUpdate(feature.id, { config: data.config })
      }
    } catch (e: any) {
      setPreview(`Error: ${e.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-foreground">AI-Assisted Configuration</h3>

      <div>
        <label className="text-sm font-medium text-foreground block mb-2">Describe your requirements</label>

        {suggestedPrompts.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {suggestedPrompts.map((p, i) => (
              <button
                key={i}
                onClick={() => setPrompt(p)}
                className="text-xs bg-surface-secondary hover:bg-surface border border-border px-2 py-1 rounded transition-colors text-muted-foreground hover:text-foreground"
              >
                {p}
              </button>
            ))}
          </div>
        )}

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={`Describe how you want ${feature.name} to work...`}
          className="w-full h-32 bg-background border border-border rounded-lg p-3 text-foreground focus:outline-none focus:border-primary resize-none"
        />
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading || !prompt.trim()}
        className="px-4 py-2 bg-primary text-background rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Generating..." : "Generate Configuration"}
      </button>

      {preview && (
        <div className="bg-surface p-4 rounded-lg border border-border">
          <p className="text-sm font-medium text-foreground mb-2">Preview:</p>
          <pre className="text-xs text-muted overflow-auto max-h-48 font-mono">{preview}</pre>
        </div>
      )}
    </div>
  )
}

function MixedConfiguration({
  projectId,
  feature,
  features,
  onUpdate,
}: {
  projectId?: string
  feature: Feature
  features: Feature[]
  onUpdate: (id: string, updates: Partial<Feature>) => void
}) {
  const [showAI, setShowAI] = useState(false)

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-foreground">Mixed Configuration</h3>

      <div className="flex gap-2">
        <button
          onClick={() => setShowAI(false)}
          className={`flex-1 py-2 rounded-lg border transition-colors ${!showAI ? "bg-primary text-background border-primary" : "bg-surface border-border"
            }`}
        >
          Manual
        </button>
        <button
          onClick={() => setShowAI(true)}
          className={`flex-1 py-2 rounded-lg border transition-colors ${showAI ? "bg-primary text-background border-primary" : "bg-surface border-border"
            }`}
        >
          AI-Assisted
        </button>
      </div>

      {!showAI && <ManualConfiguration projectId={projectId} feature={feature} features={features} onUpdate={onUpdate} />}
      {showAI && <AIConfiguration projectId={projectId} feature={feature} features={features} onUpdate={onUpdate} />}
    </div>
  )
}
