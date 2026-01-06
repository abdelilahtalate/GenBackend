"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Settings, Key, User, ChevronDown, BarChart3, LogOut } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/components/auth-provider"

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(true)

  const isActive = (path: string) => pathname.startsWith(path)

  const handleLogout = () => {
    logout()
  }

  // Helper to get initials for avatar
  const getInitials = () => {
    if (!user) return "U"
    const first = user.first_name?.charAt(0) || ""
    const last = user.last_name?.charAt(0) || ""
    return (first + last).toUpperCase() || user.email.charAt(0).toUpperCase()
  }

  const menuItems = [
    { href: "/dashboard", label: "Projects", icon: LayoutDashboard },
    { href: "/statistics", label: "Statistics", icon: BarChart3 },
    { href: "/api-keys", label: "API Keys", icon: Key },
    { href: "/settings", label: "Settings", icon: Settings },
    { href: "/account", label: "Account", icon: User },
  ]

  return (
    <aside
      className={`bg-surface border-r border-border transition-all duration-300 ${isOpen ? "w-64" : "w-20"
        } flex flex-col h-screen sticky top-0`}
    >
      {/* Logo */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        {isOpen && <span className="font-bold text-lg">BackendGen</span>}
        <button onClick={() => setIsOpen(!isOpen)} className="p-1 hover:bg-surface-secondary rounded transition-colors">
          <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? "rotate-0" : "-rotate-90"}`} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive(item.href) ? "bg-primary text-background" : "text-muted hover:bg-surface-secondary"
              }`}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {isOpen && <span className="text-sm font-medium">{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-border space-y-2">
        <button
          className={`w-full flex items-center gap-3 p-3 rounded-lg hover:bg-surface-secondary transition-colors ${!isOpen && "justify-center"
            }`}
        >
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-background font-bold flex-shrink-0 text-xs">
            {getInitials()}
          </div>
          {isOpen && (
            <div className="text-left flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user ? `${user.first_name} ${user.last_name}` : "Loading..."}
              </p>
              <p className="text-xs text-muted truncate">{user?.email || "..."}</p>
            </div>
          )}
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors ${!isOpen && "justify-center"
            }`}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {isOpen && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  )
}
