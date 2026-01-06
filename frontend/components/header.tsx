import Link from "next/link"
import { Menu } from "lucide-react"

export function Header() {
  return (
    <header className="border-b border-border bg-surface sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-background font-bold">▲</div>
          <span className="font-bold text-lg hidden sm:inline">BackendGen</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-muted hover:text-foreground">
            Home
          </Link>
          <Link href="/dashboard" className="text-muted hover:text-foreground">
            Dashboard
          </Link>
          <Link href="/docs" className="text-muted hover:text-foreground">
            Docs
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/login" className="text-muted hover:text-foreground text-sm">
            Sign In
          </Link>
          <Link
            href="/signup"
            className="bg-primary text-background px-4 py-2 rounded-full font-medium text-sm hover:bg-primary-dark"
          >
            Get Started
          </Link>
          <button className="md:hidden p-2 hover:bg-surface-secondary rounded">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  )
}
