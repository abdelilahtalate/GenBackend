"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/button"
import { Input } from "@/components/input"
import { Card } from "@/components/card"
import { Bell, Lock, Palette, Database } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { authApi } from "@/lib/api"
import { useEffect } from "react"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general")
  const [isSaving, setIsSaving] = useState(false)
  const { refreshUser } = useAuth()

  const handleSave = async (data: any) => {
    setIsSaving(true)
    try {
      const response = await authApi.updateProfile({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email
      })
      if (!response.error) {
        await refreshUser()
        alert("Profile updated successfully")
      } else {
        alert(response.error)
      }
    } catch (error) {
      alert("Error saving profile")
    } finally {
      setIsSaving(false)
    }
  }

  const tabs = [
    {
      id: "general",
      label: "General",
      icon: Palette,
      content: <GeneralSettings onSave={handleSave} saving={isSaving} />,
    },
    { id: "security", label: "Security", icon: Lock, content: <SecuritySettings /> },
    { id: "notifications", label: "Notifications", icon: Bell, content: <NotificationSettings /> },
    { id: "integrations", label: "Integrations", icon: Database, content: <IntegrationSettings /> },
  ]

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-border p-6">
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted mt-1">Manage your account and preferences</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl">
            <div className="flex gap-6">
              {/* Sidebar Navigation */}
              <nav className="w-48 space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${activeTab === tab.id ? "bg-primary text-background" : "text-muted hover:bg-surface-secondary"
                      }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>

              {/* Content */}
              <div className="flex-1">{tabs.find((t) => t.id === activeTab)?.content}</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function GeneralSettings({ onSave, saving }: { onSave: (data: any) => void; saving: boolean }) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    company: "Acme Corp",
    bio: "Backend developer and API enthusiast",
  })

  // Update form data if user data changes
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || ""
      }))
    }
  }, [user])

  return (
    <div className="space-y-6">
      <Card className="space-y-6">
        <h2 className="text-xl font-bold text-foreground">Profile Information</h2>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First Name"
            value={formData.first_name}
            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
          />

          <Input
            label="Last Name"
            value={formData.last_name}
            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
          />
        </div>

        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />

        <Input
          label="Company"
          value={formData.company}
          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
        />

        <Input
          label="Bio"
          multiline
          rows={4}
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
        />

        <Button onClick={() => onSave(formData)} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </Card>

      <Card className="space-y-4 bg-surface-secondary border-primary/30">
        <h3 className="font-semibold text-foreground">Account ID</h3>
        <p className="text-sm text-muted font-mono">usr_1a2b3c4d5e6f7g8h</p>
      </Card>
    </div>
  )
}

function SecuritySettings() {
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match")
      return
    }

    // API placeholder
    try {
      await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      setShowPasswordForm(false)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      alert("Password changed successfully")
    } catch {
      alert("Error changing password")
    }
  }

  return (
    <div className="space-y-6">
      <Card className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">Password</h2>
        <p className="text-sm text-muted">Change your password to keep your account secure</p>

        {!showPasswordForm ? (
          <Button variant="outline" onClick={() => setShowPasswordForm(true)}>
            Change Password
          </Button>
        ) : (
          <>
            <Input
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <Input
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <Input
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <div className="flex gap-3">
              <Button onClick={handleChangePassword}>Update Password</Button>
              <Button variant="outline" onClick={() => setShowPasswordForm(false)}>
                Cancel
              </Button>
            </div>
          </>
        )}
      </Card>

      <Card className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">Two-Factor Authentication</h2>
        <p className="text-sm text-muted">Add an extra layer of security to your account</p>
        <Button variant="outline">Enable 2FA</Button>
      </Card>

      <Card className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">Active Sessions</h2>
        <p className="text-sm text-muted">Manage your active login sessions</p>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-surface rounded-lg border border-border">
            <div>
              <p className="text-sm font-medium text-foreground">Current Session</p>
              <p className="text-xs text-muted">Chrome on macOS • Last active now</p>
            </div>
            <span className="text-xs px-2 py-1 bg-success/20 text-success rounded">Active</span>
          </div>
        </div>

        <Button variant="outline">Sign Out All Devices</Button>
      </Card>
    </div>
  )
}

function NotificationSettings() {
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    projectUpdates: true,
    deploymentAlerts: true,
    weeklyDigest: false,
  })

  const togglePreference = (key: keyof typeof preferences) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="space-y-6">
      <Card className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">Email Preferences</h2>

        {Object.entries(preferences).map(([key, value]) => (
          <div
            key={key}
            className="flex items-center justify-between p-3 bg-surface-secondary rounded-lg border border-border"
          >
            <div>
              <p className="text-sm font-medium text-foreground capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</p>
              <p className="text-xs text-muted mt-1">
                {key === "emailNotifications" && "Receive notifications about your account"}
                {key === "projectUpdates" && "Get updates on your project changes"}
                {key === "deploymentAlerts" && "Alerts when deployments succeed or fail"}
                {key === "weeklyDigest" && "Weekly summary of your activities"}
              </p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={value}
                onChange={() => togglePreference(key as keyof typeof preferences)}
                className="w-4 h-4 rounded border-border"
              />
            </label>
          </div>
        ))}

        <Button>Save Preferences</Button>
      </Card>
    </div>
  )
}

function IntegrationSettings() {
  const [integrations] = useState([
    { name: "GitHub", connected: true, description: "Auto-deploy from your repositories" },
    { name: "GitLab", connected: false, description: "Integrate with GitLab pipelines" },
    { name: "Slack", connected: true, description: "Receive notifications in Slack" },
    { name: "Datadog", connected: false, description: "Monitor your deployments" },
  ])

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-xl font-bold text-foreground mb-6">Connected Services</h2>

        <div className="space-y-3">
          {integrations.map((integration) => (
            <div
              key={integration.name}
              className="flex items-center justify-between p-4 bg-surface rounded-lg border border-border"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{integration.name}</p>
                <p className="text-xs text-muted mt-1">{integration.description}</p>
              </div>
              <div className="flex items-center gap-3">
                {integration.connected && (
                  <span className="text-xs px-2 py-1 bg-success/20 text-success rounded">Connected</span>
                )}
                <Button variant={integration.connected ? "outline" : "secondary"} size="sm">
                  {integration.connected ? "Disconnect" : "Connect"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
