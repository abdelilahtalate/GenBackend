"use client"

import type { Feature } from "@/types"
import { Card } from "@/components/card"

interface Step3Props {
  features: Feature[]
  updateFeature: (id: string, updates: Partial<Feature>) => void
}

export function Step3FeatureMode({ features, updateFeature }: Step3Props) {
  const modes: Array<{ value: Feature["mode"]; label: string; description: string }> = [
    { value: "manual", label: "Manual", description: "Configure using UI forms" },
    { value: "ai", label: "AI-Assisted", description: "Generate with AI prompts" },
    { value: "mixed", label: "Mixed", description: "Combine manual & AI" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Generation Mode</h2>
        <p className="text-muted">Choose how you want to configure each feature</p>
      </div>

      <div className="space-y-4">
        {features.map((feature) => (
          <Card key={feature.id} className="space-y-3">
            <div>
              <h3 className="font-semibold text-foreground mb-3">{feature.name}</h3>
              <div className="grid grid-cols-3 gap-3">
                {modes.map((mode) => (
                  <button
                    key={mode.value}
                    onClick={() => updateFeature(feature.id, { mode: mode.value })}
                    className={`p-3 rounded-lg border-2 transition-all text-center ${
                      feature.mode === mode.value
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <p className="font-medium text-foreground text-sm">{mode.label}</p>
                    <p className="text-xs text-muted mt-1">{mode.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="bg-surface-secondary border-primary/30">
        <p className="text-sm text-muted">
          <span className="font-semibold text-foreground">Tip:</span> You can change modes for each feature anytime
          during configuration.
        </p>
      </Card>
    </div>
  )
}
