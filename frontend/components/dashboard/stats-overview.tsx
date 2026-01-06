import { Card } from "@/components/card"
import { Folder, Database, Zap, Layers, CheckCircle, FileText, FlaskConical } from "lucide-react"

interface StatsOverviewProps {
    stats: {
        totalProjects: number
        completedProjects: number
        draftProjects: number
        deletedProjects?: number
        totalFeatures: number
        totalApis: number
        totalTests?: number
        totalExternalTests?: number
    } | null
    isLoading: boolean
}

export function StatsOverview({ stats, isLoading }: StatsOverviewProps) {
    if (isLoading || !stats) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-24 rounded-xl bg-surface animate-pulse border border-border" />
                ))}
            </div>
        )
    }

    const statItems = [
        {
            label: "Total Projects",
            value: stats.totalProjects,
            icon: <Folder className="w-4 h-4 text-primary" />,
            subtext: `${stats.completedProjects} Completed, ${stats.draftProjects} Draft${stats.deletedProjects ? `, ${stats.deletedProjects} Deleted` : ''}`,
        },
        {
            label: "API Endpoints",
            value: stats.totalApis,
            icon: <Database className="w-4 h-4 text-info" />,
            subtext: "Generated Endpoints",
        },
        {
            label: "Features Built",
            value: stats.totalFeatures,
            icon: <Layers className="w-4 h-4 text-warning" />,
            subtext: "Across all projects",
        },
        {
            label: "Internal Tests",
            value: stats.totalTests || 0,
            icon: <FlaskConical className="w-4 h-4 text-success" />,
            subtext: "Wizard sessions",
        },
        {
            label: "External API Usage",
            value: stats.totalExternalTests || 0,
            icon: <Zap className="w-4 h-4 text-warning" />,
            subtext: "Made via API Keys",
        },
    ]

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {statItems.map((item, index) => (
                <Card key={index} className="flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-muted">{item.label}</span>
                        <div className="p-2 bg-surface-secondary rounded-lg border border-border">
                            {item.icon}
                        </div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-foreground">{item.value}</div>
                        <p className="text-xs text-muted mt-1">{item.subtext}</p>
                    </div>
                </Card>
            ))}
        </div>
    )
}
