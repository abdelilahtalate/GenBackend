"use client"

import { useState, useCallback } from "react"
import type { WizardState, Feature } from "@/types"

const initialState: WizardState = {
  step: 1,
  projectInfo: {
    name: "",
    description: "",
    environment: "development",
  },
  selectedFeatures: [],
}

export function useWizardState() {
  const [state, setState] = useState<WizardState>(initialState)

  const updateProjectInfo = useCallback((info: Partial<WizardState["projectInfo"]>) => {
    setState((prev) => ({
      ...prev,
      projectInfo: { ...prev.projectInfo, ...info },
    }))
  }, [])

  const addFeature = useCallback((feature: Feature) => {
    // Normalize config/configuration
    const normalized = {
      ...feature,
      config: feature.config || feature.configuration || {},
      configuration: feature.configuration || feature.config || {}
    }
    setState((prev) => ({
      ...prev,
      selectedFeatures: [...prev.selectedFeatures, normalized],
    }))
  }, [])

  const updateFeature = useCallback((featureId: string, updates: Partial<Feature>) => {
    setState((prev) => ({
      ...prev,
      selectedFeatures: prev.selectedFeatures.map((f) => {
        if (f.id === featureId) {
          const merged = { ...f, ...updates }
          // Re-normalize if config changed
          if (updates.config || updates.configuration) {
            merged.config = updates.config || updates.configuration || merged.config
            merged.configuration = updates.configuration || updates.config || merged.configuration
          }
          return merged
        }
        return f
      }),
    }))
  }, [])

  const removeFeature = useCallback((featureId: string) => {
    setState((prev) => ({
      ...prev,
      selectedFeatures: prev.selectedFeatures.filter((f) => f.id !== featureId),
    }))
  }, [])

  const nextStep = useCallback(() => {
    setState((prev) => ({ ...prev, step: prev.step + 1 }))
  }, [])

  const prevStep = useCallback(() => {
    setState((prev) => ({ ...prev, step: Math.max(1, prev.step - 1) }))
  }, [])

  const goToStep = useCallback((step: number) => {
    setState((prev) => ({ ...prev, step }))
  }, [])

  const reset = useCallback(() => {
    setState(initialState)
  }, [])

  const setProjectId = useCallback((id: string) => {
    setState((prev) => ({ ...prev, projectId: id }))
  }, [])

  const setFeatures = useCallback((features: Feature[]) => {
    const normalized = features.map(f => ({
      ...f,
      config: f.config || f.configuration || {},
      configuration: f.configuration || f.config || {}
    }))
    setState((prev) => ({ ...prev, selectedFeatures: normalized }))
  }, [])

  return {
    state,
    updateProjectInfo,
    addFeature,
    updateFeature,
    removeFeature,
    nextStep,
    prevStep,
    goToStep,
    setProjectId,
    setFeatures,
    reset,
  }
}
