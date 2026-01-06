"use client"

import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/button"
import { Card } from "@/components/card"
import { ArrowLeft, Settings, Download, Code2, CheckCircle, Clock, Save, Loader2, Edit2, RefreshCw, Check, Copy } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { projectsApi, featuresApi } from "@/lib/api"
import { Input } from "@/components/input"
import { ExternalAPITesting } from "@/components/dashboard/external-api-testing"
import { ChevronDown, ChevronUp } from "lucide-react"

export default function ProjectDetailPage() {
  const params = useParams()
  const projectId = params.id as string

  const [project, setProject] = useState<any>(null)
  const [features, setFeatures] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [editedName, setEditedName] = useState("")
  const [editedDescription, setEditedDescription] = useState("")
  const [expandedFeatureId, setExpandedFeatureId] = useState<string | null>(null)
  const [apiKeyCopied, setApiKeyCopied] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const [projRes, featRes] = await Promise.all([
          projectsApi.get(projectId),
          featuresApi.list(projectId),
        ])

        if (projRes.data?.project) {
          setProject(projRes.data.project)
          setEditedName(projRes.data.project.name)
          setEditedDescription(projRes.data.project.description)
        } else if (projRes.error) {
          setError(projRes.error)
        }

        if (featRes.data?.features) {
          setFeatures(featRes.data.features)
        }
      } catch (err) {
        setError("Failed to load project details")
      } finally {
        setLoading(false)
      }
    }

    if (projectId) {
      fetchProjectData()
    }
  }, [projectId])

  const handleSave = async () => {
    setSaveLoading(true)
    try {
      const response = await projectsApi.update(projectId, {
        name: editedName,
        description: editedDescription,
      })
      if (response.data?.project) {
        setProject(response.data.project)
        setIsEditing(false)
      } else if (response.error) {
        alert(response.error)
      }
    } catch (err) {
      alert("Failed to save project changes")
    } finally {
      setSaveLoading(false)
    }
  }

  const handleRegenerateKey = async () => {
    if (!confirm("Are you sure? Any existing external integrations using the current key will stop working.")) return

    setIsRegenerating(true)
    try {
      const response = await projectsApi.regenerateKey(projectId)
      if (response.data?.api_key) {
        setProject({ ...project, api_key: response.data.api_key })
        alert("API key regenerated successfully")
      } else {
        alert(response.error || "Failed to regenerate API key")
      }
    } catch (err) {
      alert("Failed to regenerate API key")
    } finally {
      setIsRegenerating(false)
    }
  }

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(project.api_key)
    setApiKeyCopied(true)
    setTimeout(() => setApiKeyCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
            <p className="text-muted mt-4">Loading project details...</p>
          </div>
        </main>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-destructive/10 border border-destructive/20 rounded-xl p-8 text-center">
            <h2 className="text-xl font-bold text-destructive mb-2">Error</h2>
            <p className="text-muted mb-6">{error || "Project not found"}</p>
            <Link href="/dashboard">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-border p-6">
          <Link href="/dashboard" className="flex items-center gap-2 text-primary hover:underline mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <div className="flex items-start justify-between">
            <div className="flex-1 max-w-2xl">
              {isEditing ? (
                <div className="space-y-4">
                  <Input
                    label="Project Name"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="text-2xl font-bold"
                  />
                  <Input
                    label="Description"
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    multiline
                    rows={2}
                  />
                </div>
              ) : (
                <>
                  <h1 className="text-3xl font-bold text-foreground">{project.name}</h1>
                  <p className="text-muted mt-1">{project.description}</p>
                </>
              )}
            </div>
            <div className="flex gap-2 shrink-0 ml-4">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={() => setIsEditing(false)} disabled={saveLoading}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={saveLoading}>
                    {saveLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Save
                  </Button>
                </>
              ) : (
                <>
                  <Link href={`/wizard?projectId=${projectId}`}>
                    <Button variant="outline" size="lg">
                      <Code2 className="w-4 h-4 mr-2" />
                      Open in Editor
                    </Button>
                  </Link>
                  <Button variant="outline" size="lg" onClick={() => setIsEditing(true)}>
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Details
                  </Button>
                  <Button size="lg" onClick={async () => {
                    try {
                      const blob = await projectsApi.download(project, features)
                      const url = window.URL.createObjectURL(blob)
                      const a = document.createElement("a")
                      a.href = url
                      a.download = `${project.name.toLowerCase().replace(/\s+/g, "-")}-backend.zip`
                      document.body.appendChild(a)
                      a.click()
                      window.URL.revokeObjectURL(url)
                      document.body.removeChild(a)
                    } catch (error) {
                      console.error("Download failed:", error)
                      alert("Failed to download project")
                    }
                  }}>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl space-y-6">
            {/* Project Stats */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="space-y-2">
                <p className="text-sm font-medium text-muted">API Endpoints</p>
                <p className="text-3xl font-bold text-primary">{features.length * 5 || project.stats?.apiEndpoints || 0}</p>
              </Card>
              <Card className="space-y-2">
                <p className="text-sm font-medium text-muted">Status</p>
                <p className="text-3xl font-bold text-primary capitalize">{project.status}</p>
              </Card>
              <Card className="space-y-2">
                <p className="text-sm font-medium text-muted">Created</p>
                <p className="text-3xl font-bold text-primary">
                  {new Date(project.created_at).toLocaleDateString()}
                </p>
              </Card>
            </div>

            {/* Features Status */}
            <Card className="space-y-4">
              <h2 className="text-xl font-bold text-foreground">Feature Status</h2>

              <div className="space-y-6">
                {features.length === 0 ? (
                  <p className="text-muted italic">No features configured yet.</p>
                ) : (
                  (() => {
                    // Group features by type
                    const grouped = features.reduce((acc: any, feature: any) => {
                      const type = feature.feature_type?.toUpperCase() || (feature.name === 'Auth' ? 'AUTH' : 'CUSTOM')
                      if (!acc[type]) acc[type] = []
                      acc[type].push(feature)
                      return acc
                    }, {})

                    // Define order: CRUD, AUTH, FUNCTIONS, others
                    const order = ['CRUD', 'AUTH', 'FUNCTIONS', 'ANALYTICS']
                    const sortedKeys = Object.keys(grouped).sort((a, b) => {
                      const ia = order.indexOf(a)
                      const ib = order.indexOf(b)
                      if (ia !== -1 && ib !== -1) return ia - ib
                      if (ia !== -1) return -1
                      if (ib !== -1) return 1
                      return a.localeCompare(b)
                    })

                    return sortedKeys.map((type) => (
                      <div key={type} className="space-y-2">
                        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider border-b border-border pb-1 mb-2">
                          {type}
                        </h3>
                        <div className="space-y-3 pl-2">
                          {grouped[type].map((feature: any) => (
                            <div key={feature.id} className="border border-border/50 rounded-lg overflow-hidden bg-surface/50">
                              <div
                                className="flex items-center justify-between p-3 cursor-pointer hover:bg-surface transition-colors"
                                onClick={() => setExpandedFeatureId(expandedFeatureId === feature.id ? null : feature.id)}
                              >
                                <div className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                  <p className="font-medium text-foreground">{feature.name}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-xs text-success flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" /> Configured
                                  </span>
                                  {expandedFeatureId === feature.id ? <ChevronUp className="w-4 h-4 text-muted" /> : <ChevronDown className="w-4 h-4 text-muted" />}
                                </div>
                              </div>

                              {expandedFeatureId === feature.id && (
                                <div className="p-4 border-t border-border/50 bg-background/50">
                                  <ExternalAPITesting
                                    projectId={projectId}
                                    featureId={feature.id}
                                    apiKey={project.api_key}
                                  />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  })()
                )}
              </div>
            </Card>

            {/* Documentation */}
            <Card className="space-y-4">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Code2 className="w-5 h-5" />
                Documentation
              </h2>

              <div className="space-y-3">
                <Link
                  href="#"
                  className="flex items-center justify-between p-3 bg-surface rounded-lg border border-border hover:border-primary transition-colors"
                >
                  <span className="text-sm font-medium text-foreground">API Reference</span>
                  <ArrowLeft className="w-4 h-4 text-muted rotate-180" />
                </Link>
                <Link
                  href="#"
                  className="flex items-center justify-between p-3 bg-surface rounded-lg border border-border hover:border-primary transition-colors"
                >
                  <span className="text-sm font-medium text-foreground">Integration Guide</span>
                  <ArrowLeft className="w-4 h-4 text-muted rotate-180" />
                </Link>
                <Link
                  href="#"
                  className="flex items-center justify-between p-3 bg-surface rounded-lg border border-border hover:border-primary transition-colors"
                >
                  <span className="text-sm font-medium text-foreground">Deployment Instructions</span>
                  <ArrowLeft className="w-4 h-4 text-muted rotate-180" />
                </Link>
              </div>
            </Card>

            {/* API Key */}
            <Card className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">API Credentials</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground hover:text-primary"
                  onClick={handleRegenerateKey}
                  disabled={isRegenerating}
                >
                  {isRegenerating ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <RefreshCw className="w-3 h-3 mr-1" />}
                  Regenerate Key
                </Button>
              </div>
              <div className="p-4 bg-surface rounded-lg border border-border">
                <p className="text-sm font-medium text-muted mb-2">Project API Key</p>
                <div className="flex items-center gap-4">
                  <code className="flex-1 bg-background p-2.5 rounded-xl border border-border text-xs truncate font-mono text-primary">
                    {project.api_key}
                  </code>
                  <Button variant="outline" size="sm" onClick={handleCopyApiKey} className="min-w-[80px]">
                    {apiKeyCopied ? (
                      <><Check size={14} className="mr-1.5 text-success" /> Copied</>
                    ) : (
                      <><Copy size={14} className="mr-1.5" /> Copy</>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
