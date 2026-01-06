"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/button"
import { Card } from "@/components/card"
import { Input } from "@/components/input"
import { Copy, Eye, EyeOff, Trash2, Plus } from "lucide-react"

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState([
    {
      id: "key_1",
      name: "Production API Key",
      key: "sk_live_4eC39HqLyjWDarhtLK1L7",
      createdAt: "2024-01-15",
      lastUsed: "2 hours ago",
    },
    {
      id: "key_2",
      name: "Development Key",
      key: "sk_test_4eC39HqLyjWDarhtLK1L7",
      createdAt: "2024-01-10",
      lastUsed: "30 minutes ago",
    },
  ])

  const [showNewKeyForm, setShowNewKeyForm] = useState(false)
  const [newKeyName, setNewKeyName] = useState("")
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set())

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) return

    // API placeholder
    const newKey = {
      id: `key_${Date.now()}`,
      name: newKeyName,
      key: "sk_" + Math.random().toString(36).substr(2, 30),
      createdAt: new Date().toISOString().split("T")[0],
      lastUsed: "Just now",
    }

    setApiKeys([...apiKeys, newKey])
    setNewKeyName("")
    setShowNewKeyForm(false)
  }

  const handleDeleteKey = (id: string) => {
    if (confirm("Are you sure you want to delete this API key?")) {
      setApiKeys(apiKeys.filter((k) => k.id !== id))
    }
  }

  const toggleKeyVisibility = (id: string) => {
    const newVisible = new Set(visibleKeys)
    if (newVisible.has(id)) {
      newVisible.delete(id)
    } else {
      newVisible.add(id)
    }
    setVisibleKeys(newVisible)
  }

  const copyKey = (key: string, id: string) => {
    navigator.clipboard.writeText(key)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-border p-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">API Keys</h1>
            <p className="text-muted mt-1">Manage your API credentials</p>
          </div>
          <Button onClick={() => setShowNewKeyForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Key
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl">
            {showNewKeyForm && (
              <Card className="mb-6 space-y-4 border-primary/30 bg-surface-secondary">
                <h2 className="text-lg font-bold text-foreground">Create New API Key</h2>

                <Input
                  label="Key Name"
                  placeholder="Production API Key"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                />

                <div className="flex gap-3">
                  <Button onClick={handleCreateKey} disabled={!newKeyName.trim()}>
                    Create Key
                  </Button>
                  <Button variant="outline" onClick={() => setShowNewKeyForm(false)}>
                    Cancel
                  </Button>
                </div>
              </Card>
            )}

            <div className="space-y-4">
              {apiKeys.map((apiKey) => (
                <Card key={apiKey.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-foreground">{apiKey.name}</h3>
                      <p className="text-xs text-muted mt-1">Created {apiKey.createdAt}</p>
                    </div>
                    <span className="text-xs px-2 py-1 bg-success/20 text-success rounded">Active</span>
                  </div>

                  <div className="bg-background rounded-lg border border-border p-3 mb-4 flex items-center gap-3">
                    <code className="text-xs text-muted font-mono flex-1">
                      {visibleKeys.has(apiKey.id) ? apiKey.key : apiKey.key.slice(0, 7) + "..." + apiKey.key.slice(-7)}
                    </code>
                    <button
                      onClick={() => toggleKeyVisibility(apiKey.id)}
                      className="p-1 hover:bg-surface-secondary rounded transition-colors"
                    >
                      {visibleKeys.has(apiKey.id) ? (
                        <EyeOff className="w-4 h-4 text-muted" />
                      ) : (
                        <Eye className="w-4 h-4 text-muted" />
                      )}
                    </button>
                    <button
                      onClick={() => copyKey(apiKey.key, apiKey.id)}
                      className="p-1 hover:bg-surface-secondary rounded transition-colors"
                    >
                      <Copy className="w-4 h-4 text-muted" />
                    </button>
                    {copiedId === apiKey.id && <span className="text-xs text-success">Copied!</span>}
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted mb-4">
                    <span>Last used {apiKey.lastUsed}</span>
                  </div>

                  <button
                    onClick={() => handleDeleteKey(apiKey.id)}
                    className="flex items-center gap-2 px-3 py-2 text-error hover:bg-error/10 rounded-lg text-sm transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Key
                  </button>
                </Card>
              ))}
            </div>

            {apiKeys.length === 0 && (
              <Card className="text-center py-12">
                <p className="text-muted mb-4">No API keys yet</p>
                <Button onClick={() => setShowNewKeyForm(true)}>Create Your First Key</Button>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
