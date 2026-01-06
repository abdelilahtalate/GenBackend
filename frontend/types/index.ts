// Project Types
export interface Project {
  id: string
  name: string
  description: string
  createdAt: string
  updatedAt: string
  status: "draft" | "completed" | "deployed"
  features: Feature[]
  environment?: "development" | "staging" | "production"
}

export interface Feature {
  id: string
  name: "CRUD" | "Auth" | "Functions" | "Analytics" | "AI Endpoints" | "File Management" | "RBAC" | "Background Tasks"
  feature_type?: string // Matches backend type (e.g., 'crud', 'auth')
  mode: "manual" | "ai" | "mixed"
  status: "pending" | "configured" | "tested"
  config?: Record<string, any>
  configuration?: Record<string, any> // Backend alias
}

export interface WizardState {
  step: number
  projectId?: string
  projectInfo: {
    name: string
    description: string
    environment: string
  }
  selectedFeatures: Feature[]
  testResults?: Record<string, any>
}

export interface ApiTestRequest {
  method: "GET" | "POST" | "PUT" | "DELETE"
  endpoint: string
  headers?: Record<string, string>
  body?: Record<string, any>
}

export interface ApiTestResponse {
  status: number
  statusText: string
  data: any
  duration: number
}
