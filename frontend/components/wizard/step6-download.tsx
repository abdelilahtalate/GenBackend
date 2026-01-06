"use client"

import type { Feature, WizardState } from "@/types"
import { Card } from "@/components/card"
import { Button } from "@/components/button"
import { Download, Copy, Check } from "lucide-react"
import { useState } from "react"

interface Step6Props {
  projectInfo: WizardState["projectInfo"]
  features: Feature[]
}

import { projectsApi } from "@/lib/api"

export function Step6Download({ projectInfo, features }: Step6Props) {
  const [downloaded, setDownloaded] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleDownload = async () => {
    try {
      const blob = await projectsApi.download(projectInfo, features)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${projectInfo.name.toLowerCase().replace(/\s+/g, "-")}.zip`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      setDownloaded(true)
    } catch {
      alert("Download failed. Please try again.")
    }
  }

  const copyCode = () => {
    const code = `npm run build && npm run deploy`
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Download & Deploy</h2>
        <p className="text-muted">Your backend is ready to download and deploy</p>
      </div>

      {/* Summary */}
      <Card className="bg-surface-secondary border-primary/30">
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted">Project Name</p>
            <p className="text-lg font-semibold text-foreground">{projectInfo.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted">Environment</p>
            <p className="text-lg font-semibold text-foreground capitalize">{projectInfo.environment}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted">Selected Features</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {features.map((feature) => (
                <span key={feature.id} className="px-3 py-1 bg-primary/20 text-primary text-sm rounded-full">
                  {feature.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Download */}
      <Card className="space-y-4">
        <h3 className="font-semibold text-foreground">Download Project</h3>
        <p className="text-sm text-muted">
          Download your complete backend project with all configurations and dependencies included.
        </p>
        <Button onClick={handleDownload} size="lg" className="w-full">
          <Download className="w-5 h-5 mr-2" />
          {downloaded ? "Downloaded! Download Again" : "Download ZIP"}
        </Button>
      </Card>

      {/* Deployment Instructions */}
      <Card className="space-y-4">
        <h3 className="font-semibold text-foreground">Deployment Instructions</h3>

        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-muted mb-2">1. Extract and Install</p>
            <div className="bg-background p-3 rounded border border-border">
              <code className="text-xs text-foreground font-mono">unzip project.zip && cd project && npm install</code>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-muted mb-2">2. Configure Environment</p>
            <div className="bg-background p-3 rounded border border-border">
              <code className="text-xs text-foreground font-mono">cp .env.example .env.local</code>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-muted mb-2">3. Deploy</p>
            <div className="bg-background p-3 rounded border border-border flex items-center justify-between">
              <code className="text-xs text-foreground font-mono">npm run deploy</code>
              <button onClick={copyCode} className="ml-2 p-1 hover:bg-surface-secondary rounded">
                {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Next Steps */}
      <Card className="bg-success/10 border border-success">
        <div className="flex gap-4">
          <div className="text-2xl">✓</div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">You're all set!</h3>
            <p className="text-sm text-muted">
              Your backend is ready for deployment. Check the included documentation for detailed setup instructions.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
