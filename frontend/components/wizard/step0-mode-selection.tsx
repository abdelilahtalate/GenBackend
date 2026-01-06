"use client"

import { Card } from "@/components/card"
import { MessageSquare, Settings2, Sparkles, ArrowRight } from "lucide-react"

interface Step0Props {
    onSelectMode: (mode: "normal" | "chat") => void
}

export function Step0ModeSelection({ onSelectMode }: Step0Props) {
    return (
        <div className="space-y-8 py-8">
            <div className="text-center space-y-4 max-w-2xl mx-auto">
                <h1 className="text-4xl font-bold text-foreground">How do you want to build?</h1>
                <p className="text-lg text-muted">
                    Choose the workflow that suits you best. You can always switch back to manual configuration later.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {/* Normal Mode */}
                <button
                    onClick={() => onSelectMode("normal")}
                    className="group relative p-8 text-left bg-surface border-2 border-border rounded-xl hover:border-primary/50 transition-all hover:shadow-lg"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight className="w-6 h-6 text-primary" />
                    </div>
                    <div className="w-12 h-12 bg-surface-secondary rounded-lg flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                        <Settings2 className="w-6 h-6 text-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Manual Mode</h3>
                    <p className="text-muted mb-6">
                        Step-by-step wizard to manually select features, configure database schemas, and setup authentication.
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2">✓ Full granular control</li>
                        <li className="flex items-center gap-2">✓ Standard step-by-step flow</li>
                        <li className="flex items-center gap-2">✓ Use AI assistance per feature</li>
                    </ul>
                </button>

                {/* Chat Mode */}
                <button
                    onClick={() => onSelectMode("chat")}
                    className="group relative p-8 text-left bg-surface border-2 border-primary/20 rounded-xl hover:border-primary transition-all hover:shadow-lg"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight className="w-6 h-6 text-primary" />
                    </div>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                        <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Chat Mode</h3>
                    <p className="text-muted mb-6">
                        Describe your idea in plain English and let AI generate the entire project structure for you instantly.
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2">✓ 10x faster setup</li>
                        <li className="flex items-center gap-2">✓ Natural language interface</li>
                        <li className="flex items-center gap-2">✓ Refine with follow-up chats</li>
                    </ul>
                </button>
            </div>
        </div>
    )
}
