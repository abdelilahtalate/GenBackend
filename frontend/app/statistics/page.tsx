"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { projectsApi } from "@/lib/api"
import { StatsOverview } from "@/components/dashboard/stats-overview"
import { StatsCharts } from "@/components/dashboard/stats-charts"
import { Loader2 } from "lucide-react"

export default function StatisticsPage() {
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await projectsApi.stats()
                if (response.data) {
                    setStats(response.data)
                } else if (response.error) {
                    setError(response.error)
                }
            } catch (err) {
                setError("Failed to fetch statistics")
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [])

    return (
        <div className="flex h-screen bg-background">
            <Sidebar />

            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="border-b border-border p-6">
                    <h1 className="text-3xl font-bold text-foreground">Statistics</h1>
                    <p className="text-muted mt-1">Detailed analysis of your backend projects and activity</p>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6">
                    {error ? (
                        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
                            <p className="text-destructive font-medium">{error}</p>
                        </div>
                    ) : (
                        <div className="max-w-6xl mx-auto">
                            <StatsOverview stats={stats} isLoading={loading} />
                            <StatsCharts stats={stats} isLoading={loading} />
                        </div>
                    )}

                    {loading && !stats && (
                        <div className="flex flex-col items-center justify-center h-64">
                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                            <p className="text-muted mt-4">Loading stats...</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
