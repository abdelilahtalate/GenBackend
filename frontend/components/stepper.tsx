"use client"

interface Step {
  number: number
  label: string
  completed?: boolean
}

interface StepperProps {
  steps: Step[]
  currentStep: number
  onStepClick?: (step: number) => void
}

export function Stepper({ steps, currentStep, onStepClick }: StepperProps) {
  return (
    <div className="flex items-center justify-between w-full">
      {steps.map((step, idx) => (
        <div key={step.number} className="flex items-center flex-1">
          <button
            onClick={() => onStepClick?.(step.number)}
            className={`w-10 h-10 rounded-full border-2 font-bold flex items-center justify-center transition-all ${
              step.number === currentStep
                ? "border-primary bg-primary text-background"
                : step.completed
                  ? "border-primary bg-primary text-background"
                  : "border-border bg-surface text-muted"
            }`}
          >
            {step.completed ? "✓" : step.number}
          </button>
          <div className="flex flex-col gap-1 ml-3">
            <p className="text-xs uppercase font-bold text-muted">Step {step.number}</p>
            <p className="text-sm font-medium text-foreground">{step.label}</p>
          </div>

          {idx < steps.length - 1 && (
            <div className={`h-0.5 flex-1 mx-4 ${step.completed ? "bg-primary" : "bg-border"}`} />
          )}
        </div>
      ))}
    </div>
  )
}
