"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Stepper } from "@/components/stepper"
import { Button } from "@/components/button"
import { useWizardState } from "@/hooks/useWizardState"
import { ArrowLeft, ArrowRight, Loader2, CheckCircle } from "lucide-react"
import Link from "next/link"
import { Step1ProjectInfo } from "@/components/wizard/step1-project-info"
import { Step2FeatureSelection } from "@/components/wizard/step2-feature-selection"
import { Step3FeatureMode } from "@/components/wizard/step3-feature-mode"
import { Step4Configuration } from "@/components/wizard/step4-configuration"
import { Step5Testing } from "@/components/wizard/step5-testing"
import { Step6Download } from "@/components/wizard/step6-download"
import { Step0ModeSelection } from "@/components/wizard/step0-mode-selection"
import { StepChatWorkspace } from "@/components/wizard/step-chat-workspace"
import { projectsApi, featuresApi, functionsApi } from "@/lib/api"

const STEPS = [
  { number: 1, label: "Project Info" },
  { number: 2, label: "Features" },
  { number: 3, label: "Generation Mode" },
  { number: 4, label: "Configuration" },
  { number: 5, label: "Testing" },
  { number: 6, label: "Download" },
]

export default function WizardPage() {
  const wizard = useWizardState()
  const searchParams = useSearchParams()
  const urlProjectId = searchParams.get('projectId')

  const [creationMode, setCreationMode] = useState<"normal" | "chat" | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingProject, setIsLoadingProject] = useState(false)

  // Load project if provided in URL
  useEffect(() => {
    const loadProject = async () => {
      if (!urlProjectId || wizard.state.projectId === urlProjectId) return

      setIsLoadingProject(true)
      try {
        const [projRes, featRes] = await Promise.all([
          projectsApi.get(urlProjectId),
          featuresApi.list(urlProjectId)
        ])

        if (projRes.data?.project) {
          const p = projRes.data.project
          wizard.setProjectId(p.id.toString())
          wizard.updateProjectInfo({ name: p.name, description: p.description })

          if (p.generation_mode === 'chat') {
            setCreationMode('chat')
          } else {
            setCreationMode('normal')
            // Jump to Features step if basic info is done
            wizard.goToStep(2)
          }
        }

        if (featRes.data?.features) {
          // Ensure normalization of config
          const normalizedFeatures = featRes.data.features.map((f: any) => ({
            ...f,
            config: f.configuration || f.config || {},
            configuration: f.configuration || f.config || {}
          }))
          wizard.setFeatures(normalizedFeatures)
        }
      } catch (e) {
        console.error("Failed to load project", e)
      } finally {
        setIsLoadingProject(false)
      }
    }

    if (urlProjectId) {
      loadProject()
    }
  }, [urlProjectId])

  // Adjust steps based on mode
  const currentSteps = creationMode === "chat"
    ? [{ number: 1, label: "AI Workspace" }]
    : STEPS

  // Overwrite the step count logic if in chat mode
  const isChatMode = creationMode === "chat"

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!creationMode) return true // Step 0 checks

    if (creationMode === "normal") {
      if (wizard.state.step === 1) {
        if (!wizard.state.projectInfo.name.trim()) newErrors.name = "Project name is required"
        if (!wizard.state.projectInfo.description.trim()) newErrors.description = "Description is required"
      } else if (wizard.state.step === 2) {
        if (wizard.state.selectedFeatures.length === 0) newErrors.features = "Select at least one feature"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const saveProject = async () => {
    setIsSaving(true)
    try {
      const { name, description } = wizard.state.projectInfo
      if (wizard.state.projectId) {
        await projectsApi.update(wizard.state.projectId, { name, description })
      } else {
        const response = await projectsApi.create({
          name,
          description,
          generation_mode: creationMode || "manual",
        })
        if (response.data?.project?.id) {
          wizard.setProjectId(response.data.project.id.toString())
        }
      }
    } catch (error) {
      console.error("Failed to save project:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const saveFeatures = async () => {
    setIsSaving(true)
    try {
      if (!wizard.state.projectId) return

      const existingResponse = await featuresApi.list(wizard.state.projectId)
      const existingFeatures = existingResponse.data?.features || []


      for (const feature of wizard.state.selectedFeatures) {
        // Save to features table (CRUD, Auth, Analytics, Functions, etc.)
        const exists = existingFeatures.find((f: any) => f.name === feature.name)
        if (!exists) {
          await featuresApi.create({
            project_id: wizard.state.projectId,
            name: feature.name,
            feature_type: feature.feature_type || feature.name.toLowerCase().replace(/\s+/g, "_"),
            generation_mode: feature.mode,
            configuration: feature.config || {},
            schema_definition: {},
          })
        } else {
          await featuresApi.update(exists.id, {
            configuration: feature.config || {},
            generation_mode: feature.mode,
          })
        }
      }
    } catch (error) {
      console.error("Failed to save features:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleNext = async () => {
    if (validateStep()) {
      if (creationMode === "normal") {
        if (wizard.state.step === 1) {
          await saveProject()
        } else if (wizard.state.step === 2 || wizard.state.step === 4) {
          await saveFeatures()
        } else if (wizard.state.step === STEPS.length) {
          // Final step: Mark project as completed
          if (wizard.state.projectId) {
            setIsSaving(true)
            try {
              await projectsApi.update(wizard.state.projectId, { status: 'completed' })
            } catch (e) {
              console.error("Failed to mark project as completed", e)
            } finally {
              setIsSaving(false)
            }
          }
        }
      }
      wizard.nextStep()
    }
  }

  const handleModeSelect = (mode: "normal" | "chat") => {
    setCreationMode(mode)
    if (mode === 'chat') {
      // Chat mode handles its own project creation
    }
  }

  const handleChatComplete = () => {
    // Go to download step directly? Or a review step? 
    // For now, let's just go to download step logic or final "Review"
    // But wait, user wanted "test", which is in the workspace.
    // So "Complete" probably implies ready to download.
    // We can just switch to step 6 (Download) if we reuse the stepper structure?
    // Or just show download modal.
    // Let's actually switch to Normal Mode's Step 6 logic but keep 'chat' flag?
    // Simplest: Redirect to /projects/{id} or show download UI.
    // Let's just create a synthetic "Step 2" in Chat Mode which IS Step 6.
    setCreationMode("normal")
    wizard.goToStep(6) // Jump to download
  }

  const renderStep = () => {
    if (isLoadingProject) {
      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-muted mt-4">Loading your project workspace...</p>
        </div>
      )
    }

    if (!creationMode) {
      return <Step0ModeSelection onSelectMode={handleModeSelect} />
    }

    if (creationMode === "chat") {
      return (
        <StepChatWorkspace
          onComplete={handleChatComplete}
          projectInfo={wizard.state.projectInfo}
          features={wizard.state.selectedFeatures}
          projectId={wizard.state.projectId}
          updateState={(updates) => {
            if (updates.projectId) wizard.setProjectId(updates.projectId)
            if (updates.projectInfo) wizard.updateProjectInfo(updates.projectInfo)
            if (updates.selectedFeatures) {
              wizard.setFeatures(updates.selectedFeatures)
            }
          }}
        />
      )
    }

    switch (wizard.state.step) {
      case 1:
        return <Step1ProjectInfo state={wizard.state} updateProjectInfo={wizard.updateProjectInfo} errors={errors} />
      case 2:
        return (
          <Step2FeatureSelection
            selectedFeatures={wizard.state.selectedFeatures}
            addFeature={wizard.addFeature}
            removeFeature={wizard.removeFeature}
            errors={errors}
          />
        )
      case 3:
        return <Step3FeatureMode features={wizard.state.selectedFeatures} updateFeature={wizard.updateFeature} />
      case 4:
        return <Step4Configuration projectId={wizard.state.projectId} features={wizard.state.selectedFeatures} updateFeature={wizard.updateFeature} />
      case 5:
        return <Step5Testing features={wizard.state.selectedFeatures} projectId={wizard.state.projectId} />
      case 6:
        return <Step6Download projectInfo={wizard.state.projectInfo} features={wizard.state.selectedFeatures} />
      default:
        // Success Screen (Step 7+)
        if (wizard.state.step > STEPS.length) {
          return (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center space-y-6 animate-in fade-in zoom-in duration-300">
              <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-success" />
              </div>

              <div>
                <h2 className="text-3xl font-bold text-foreground">Project Completed!</h2>
                <p className="text-muted mt-2 max-w-md mx-auto">
                  Your backend project "{wizard.state.projectInfo.name}" has been successfully configured and generated.
                </p>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <Button variant="outline" onClick={wizard.prevStep} size="lg">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>

                <Link href="/dashboard">
                  <Button size="lg" className="min-w-[150px]">
                    Go to Dashboard
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          )
        }
        return null
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-border p-6">
          <Link href="/dashboard" className="flex items-center gap-2 text-primary hover:underline mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-foreground">Create Backend Project</h1>
            {creationMode && (
              <span className="px-3 py-1 bg-surface-secondary border border-border rounded-full text-xs font-medium uppercase text-muted">
                {creationMode} Mode
              </span>
            )}
          </div>

          {/* Stepper - Hide in chat mode or step 0 */}
          {creationMode === "normal" && (
            <div className="mt-6">
              <Stepper
                steps={STEPS}
                currentStep={wizard.state.step}
                onStepClick={(step) => {
                  if (step < wizard.state.step) {
                    wizard.goToStep(step)
                  }
                }}
              />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className={creationMode === 'chat' ? "h-full max-w-7xl mx-auto" : "max-w-4xl mx-auto"}>
            {renderStep()}
          </div>
        </div>

        {/* Footer Navigation - Only for Normal Mode */}
        {creationMode === "normal" && (
          <div className="border-t border-border p-6 flex items-center justify-between bg-surface">
            <Button variant="outline" onClick={wizard.prevStep} disabled={wizard.state.step === 1}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <div className="text-sm text-muted">
              Step {wizard.state.step} of {STEPS.length}
            </div>

            <Button onClick={handleNext} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : wizard.state.step === STEPS.length ? (
                "Complete"
              ) : (
                "Next"
              )}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
