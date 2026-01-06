"use client"

import type { WizardState } from "@/types"
import { Card } from "@/components/card"
import { Input } from "@/components/input"

interface Step1Props {
  state: WizardState
  updateProjectInfo: (info: Partial<WizardState["projectInfo"]>) => void
  errors: Record<string, string>
}

export function Step1ProjectInfo({ state, updateProjectInfo, errors }: Step1Props) {
  return (
    <Card className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Project Information</h2>
        <p className="text-muted">Give your backend project a name and description</p>
      </div>

      <Input
        label="Project Name"
        placeholder="My E-Commerce API"
        value={state.projectInfo.name}
        onChange={(e) => updateProjectInfo({ name: e.target.value })}
        error={errors.name}
        required
      />

      <Input
        label="Description"
        placeholder="A full-featured e-commerce backend with products, orders, and payments"
        value={state.projectInfo.description}
        onChange={(e) => updateProjectInfo({ description: e.target.value })}
        multiline
        rows={4}
        error={errors.description}
        required
      />

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Environment</label>
        <select
          value={state.projectInfo.environment}
          onChange={(e) => updateProjectInfo({ environment: e.target.value })}
          className="w-full bg-surface-secondary border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary transition-colors"
        >
          <option value="development">Development</option>
          <option value="staging">Staging</option>
          <option value="production">Production</option>
        </select>
      </div>

      <div className="bg-surface-secondary border border-border rounded-lg p-4">
        <p className="text-sm text-muted">
          <span className="font-semibold text-foreground">Tip:</span> You can always modify these details later in
          project settings.
        </p>
      </div>
    </Card>
  )
}
