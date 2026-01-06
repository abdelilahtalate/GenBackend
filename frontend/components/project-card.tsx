"use client"

import { Card } from "./card"
import { ArrowRight, Trash2 } from "lucide-react"
import Link from "next/link"
import { Button } from "./button"
import { useState } from "react"

interface ProjectCardProps {
  id: string
  name: string
  description: string
  status: "draft" | "completed" | "deployed" | "deleted"
  featureCount: number
  updatedAt: string
  onDelete?: (id: string) => void
}

export function ProjectCard({ id, name, description, status, featureCount, updatedAt, onDelete }: ProjectCardProps) {
  const [showConfirm, setShowConfirm] = useState(false)

  const statusColors = {
    draft: "bg-yellow-500/20 text-warning",
    completed: "bg-success/20 text-success",
    deployed: "bg-primary/20 text-primary",
    deleted: "bg-destructive/20 text-destructive",
  }

  const handleDelete = (e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    if (showConfirm) {
      onDelete?.(id)
      setShowConfirm(false)
    } else {
      setShowConfirm(true)
    }
  }

  const handleCancel = (e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    setShowConfirm(false)
  }

  return (
    <div className="relative">
      <Link href={`/project/${id}`}>
        <Card interactive className="flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-foreground text-lg">{name}</h3>
              <p className="text-sm text-muted mt-1 line-clamp-2">{description}</p>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${statusColors[status]}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="text-sm text-muted">
              {featureCount} features • Updated {updatedAt}
            </div>
            <div className="flex items-center gap-2">
              {onDelete && status !== 'deleted' && (
                <Button
                  variant={showConfirm ? "destructive" : "ghost"}
                  size="sm"
                  onClick={handleDelete}
                  className="h-8 w-8 p-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
              {!showConfirm && <ArrowRight className="w-4 h-4 text-primary" />}
            </div>
          </div>

          {showConfirm && (
            <div className="absolute inset-0 bg-background/95 backdrop-blur-sm rounded-lg flex items-center justify-center p-4">
              <div className="text-center space-y-4">
                <p className="text-sm font-medium">Delete this project?</p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" size="sm" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button variant="destructive" size="sm" onClick={handleDelete}>
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>
      </Link>
    </div>
  )
}
