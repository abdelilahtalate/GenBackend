"use client"

import type { Feature } from "@/types"
import { Card } from "@/components/card"
import { FeatureSelector } from "@/components/feature-selector"

interface Step2Props {
  selectedFeatures: Feature[]
  addFeature: (feature: Feature) => void
  removeFeature: (id: string) => void
  errors: Record<string, string>
}

export function Step2FeatureSelection({ selectedFeatures, addFeature, removeFeature, errors }: Step2Props) {
  const handleToggle = (featureName: string) => {
    // Single-instance features
    if (featureName === "Auth") {
      const existing = selectedFeatures.find((f) => f.name === featureName)
      if (existing) {
        removeFeature(existing.id)
      } else {
        addFeature({
          id: `${featureName}-${Date.now()}`,
          name: featureName as Feature["name"],
          mode: "manual",
          status: "pending",
        })
      }
      return
    }

    // Multi-instance features (CRUD, Functions, Analytics, etc.)
    // For these, we just add a new instance with a unique name
    const count = selectedFeatures.filter(f => f.feature_type === featureName.toUpperCase() || f.name.startsWith(featureName)).length
    const newName = `${featureName} ${count + 1}`

    // Check dependency for Analytics
    if (featureName === "Analytics") {
      const hasCRUD = selectedFeatures.some(f => f.name.includes("CRUD") || f.feature_type === "CRUD")
      if (!hasCRUD) {
        // Ideally show toast, but alert for now
        alert("Analytics requires at least one CRUD feature.")
        return
      }
    }

    addFeature({
      id: `${featureName}-${Date.now()}`,
      name: newName as any,
      feature_type: featureName.toUpperCase(), // Store the type explicitly
      mode: "manual",
      status: "pending",
    })
  }

  // Helper to check if a type is "selected" (has at least one instance)
  const isSelected = (name: string) => {
    // For Auth, exact match. For others, just check if any exist with that type base.
    if (name === 'Auth') return selectedFeatures.some(f => f.name === 'Auth')
    return false // For multi-instance, we don't show "selected" state on the card in the same way, or maybe we just highlight if > 0
  }

  // Helper to count instances
  const getCount = (name: string) => {
    if (name === 'Auth') return selectedFeatures.some(f => f.name === 'Auth') ? 1 : 0
    return selectedFeatures.filter(f => f.feature_type === name.toUpperCase() || f.name.startsWith(name)).length
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Select Features</h2>
        <p className="text-muted">Click to add features. You can add multiple Tables (CRUD), Functions, etc.</p>
      </div>

      <FeatureSelector
        selected={selectedFeatures.map(f => f.name)} // This prop might need adjustment in FeatureSelector to handle counts
        featureCounts={selectedFeatures.reduce((acc, f) => {
          const type = f.feature_type || (f.name === 'Auth' ? 'Auth' : f.name.split(' ')[0])
          // Map backend type to UI name if needed, or just use simple logic:
          // Our UI names are CRUD, Auth, Functions...
          // Let's rely on checking the 'base' name for now.
          let baseKey = 'CRUD'
          if (f.name === 'Auth') baseKey = 'Auth'
          else if (f.feature_type === 'FUNCTIONS') baseKey = 'Functions'
          else if (f.feature_type === 'ANALYTICS') baseKey = 'Analytics'
          else if (f.feature_type === 'CRUD' || f.name.includes('CRUD')) baseKey = 'CRUD'

          acc[baseKey] = (acc[baseKey] || 0) + 1
          return acc
        }, {} as Record<string, number>)}
        onToggle={handleToggle}
      />

      {errors.features && (
        <div className="bg-error/10 border border-error text-error text-sm p-3 rounded-lg">{errors.features}</div>
      )}

      {/* List of successfully added features */}
      <div className="space-y-3">
        <h3 className="font-semibold text-foreground">Your Features Loop</h3>
        {selectedFeatures.length === 0 ? (
          <p className="text-muted italic text-sm">No features added yet.</p>
        ) : (
          <div className="grid gap-2">
            {selectedFeatures.map(feature => (
              <Card key={feature.id} className="p-3 flex items-center justify-between bg-surface-secondary">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono bg-background border border-border px-2 py-0.5 rounded uppercase">
                    {feature.feature_type || (feature.name === 'Auth' ? 'AUTH' : 'CUSTOM')}
                  </span>
                  <span className="font-medium text-foreground">{feature.name}</span>
                </div>
                <button
                  onClick={() => removeFeature(feature.id)}
                  className="text-muted hover:text-destructive transition-colors text-sm px-2"
                >
                  Remove
                </button>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Card className="bg-surface-secondary border-primary/30">
        <p className="text-sm text-muted">
          <span className="font-semibold text-foreground">Total: </span>
          {selectedFeatures.length} feature{selectedFeatures.length !== 1 ? "s" : ""}
        </p>
      </Card>
    </div>
  )
}
