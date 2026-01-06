import { Header } from "@/components/header"
import { Button } from "@/components/button"
import { Card } from "@/components/card"
import { ArrowRight, Code2, Zap, Shield, Sparkles } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
              Generate Production Backends in Minutes
            </h1>
            <p className="text-lg text-muted leading-relaxed">
              Stop writing boilerplate. Build complete backend systems with AI assistance, manual configuration, or a
              mix of both. Deploy instantly.
            </p>
            <div className="flex gap-4 flex-wrap">
              <Link href="/signup">
                <Button size="lg">
                  Get Started <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Button variant="outline" size="lg">
                Watch Demo
              </Button>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted pt-4">
              <Shield className="w-4 h-4 text-primary" />
              <span>Production-ready • No setup required</span>
            </div>
          </div>

          <div className="relative h-96 bg-gradient-to-br from-surface to-surface-secondary rounded-2xl border border-border p-8 flex items-center justify-center">
            <div className="absolute inset-0 overflow-hidden rounded-2xl">
              <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
            </div>
            <Code2 className="w-32 h-32 text-primary opacity-20" />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-border">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">Powerful Features</h2>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            Everything you need to build, test, and deploy sophisticated backends
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <div className="flex items-start gap-4">
              <Sparkles className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-foreground text-lg mb-2">AI-Powered Generation</h3>
                <p className="text-muted">
                  Describe your backend requirements in natural language. Our AI generates complete, ready-to-use code.
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-start gap-4">
              <Zap className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-foreground text-lg mb-2">Instant Testing</h3>
                <p className="text-muted">
                  Test your APIs in real-time with built-in testing tools, sample data, and response validation.
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-start gap-4">
              <Shield className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-foreground text-lg mb-2">Secure by Default</h3>
                <p className="text-muted">
                  Built-in authentication, RBAC, and Row Level Security. Deploy with confidence.
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-start gap-4">
              <Code2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-foreground text-lg mb-2">Full Control</h3>
                <p className="text-muted">
                  Switch between AI, manual, or mixed mode. Edit generated code directly or customize any aspect.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-border">
        <div className="bg-surface border border-border rounded-2xl p-12 text-center space-y-8">
          <h2 className="text-4xl font-bold text-foreground">Ready to Build Smarter?</h2>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            Join thousands of developers who are building production backends 10x faster
          </p>
          <Link href="/signup">
            <Button size="lg">Start Building Now</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-surface mt-20">
        <div className="max-w-7xl mx-auto px-6 py-12 text-center text-muted text-sm">
          <p>© 2025 BackendGen. Built with care for developers.</p>
        </div>
      </footer>
    </div>
  )
}
