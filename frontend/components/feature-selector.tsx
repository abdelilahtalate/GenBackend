"use client"

import { Check } from "lucide-react"
import { Card } from "./card"

interface FeatureSelectorProps {
  selected: string[]
  onToggle: (featureName: string) => void
  featureCounts?: Record<string, number>
}

// ... (AVAILABLE_FEATURES remains same)

const AVAILABLE_FEATURES = [
  {
    name: "CRUD",
    description: "Create, Read, Update, Delete operations",
    icon: "📊",
  },
  {
    name: "Auth",
    description: "User authentication and authorization",
    icon: "🔐",
  },
  {
    name: "Functions",
    description: "Custom backend functions",
    icon: "⚙️",
  },
  {
    name: "Analytics",
    description: "Aggregation and reports (requires CRUD)",
    icon: "📈",
  },
  {
    name: "AI Endpoints",
    description: "Integrate AI models and LLMs",
    icon: "🤖",
  },
  {
    name: "File Management",
    description: "Upload and manage files",
    icon: "📁",
  },
  {
    name: "RBAC",
    description: "Role-based access control",
    icon: "👥",
  },
  {
    name: "Background Tasks",
    description: "Queue and schedule async jobs",
    icon: "⏱️",
  },
]

export function FeatureSelector({ selected, onToggle, featureCounts = {} }: FeatureSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {AVAILABLE_FEATURES.map((feature) => {
        const count = featureCounts[feature.name] || 0
        const isSelected = selected.includes(feature.name) || count > 0

        return (
          <Card
            key={feature.name}
            interactive
            onClick={() => onToggle(feature.name)}
            className={`cursor-pointer ${isSelected ? "border-primary bg-surface-secondary" : ""}`}
          >
            <div className="flex items-start gap-4">
              <span className="text-2xl">{feature.icon}</span>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{feature.name}</h3>
                <p className="text-sm text-muted mt-1">{feature.description}</p>
              </div>
              {count > 0 ? (
                <span className="bg-primary text-background text-xs font-bold px-2 py-1 rounded-full w-6 h-6 flex items-center justify-center">
                  {count}
                </span>
              ) : isSelected && (
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
              )}
            </div>
          </Card>
        )
      })}
    </div>
  )
}
