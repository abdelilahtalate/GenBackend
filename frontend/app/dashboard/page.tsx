"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/button"
import { ProjectCard } from "@/components/project-card"
import { EmptyState } from "@/components/empty-state"
import { Plus, FolderOpen, Loader2 } from "lucide-react"
import Link from "next/link"
import { projectsApi } from "@/lib/api"
import { formatDistanceToNow } from "date-fns"

export default function DashboardPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, statsRes] = await Promise.all([
          projectsApi.list(),
          projectsApi.stats()
        ])

        if (projRes.data && projRes.data.projects) {
          setProjects(projRes.data.projects)
        } else if (projRes.error) {
          setError(projRes.error)
        }

        if (statsRes.data) {
          setStats(statsRes.data)
        }
      } catch (err) {
        setError("Failed to fetch dashboard data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const formatUpdateDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString)) + " ago"
    } catch (e) {
      return "recently"
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await projectsApi.delete(id)
      if (response.error) {
        alert("Failed to delete project: " + response.error)
      } else {
        // Refresh the project list
        const projRes = await projectsApi.list()
        if (projRes.data && projRes.data.projects) {
          setProjects(projRes.data.projects)
        }
        // Refresh stats
        const statsRes = await projectsApi.stats()
        if (statsRes.data) {
          setStats(statsRes.data)
        }
      }
    } catch (err) {
      alert("Failed to delete project")
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-border p-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Projects</h1>
            <p className="text-muted mt-1">Manage your backend projects</p>
          </div>
          <Link href="/wizard">
            <Button size="lg">
              <Plus className="w-5 h-5 mr-2" />
              New Project
            </Button>
          </Link>
        </div>

        {/* Content */}
        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-muted mt-4">Loading your projects...</p>
            </div>
          ) : error ? (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
              <p className="text-destructive font-medium">{error}</p>
              <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          ) : projects.length === 0 ? (
            <EmptyState
              icon={<FolderOpen />}
              title="No projects yet"
              description="Create your first backend project and start building"
              action={{
                label: "Create Project",
                onClick: () => (window.location.href = "/wizard"),
              }}
            />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  id={project.id.toString()}
                  name={project.name}
                  description={project.description}
                  status={project.status as any}
                  featureCount={project.featureCount || 0}
                  updatedAt={formatUpdateDate(project.updated_at)}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
