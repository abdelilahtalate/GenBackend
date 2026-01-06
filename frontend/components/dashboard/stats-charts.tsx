"use client"

import { Card } from "@/components/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area } from "recharts"

interface StatsChartsProps {
    stats: {
        totalProjects: number
        completedProjects: number
        draftProjects: number
        deletedProjects?: number
        featuresByType: Record<string, number>
        apiUsageByDay?: { date: string, count: number }[]
        apiUsageByFeature?: Record<string, number>
    } | null
    isLoading: boolean
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export function StatsCharts({ stats, isLoading }: StatsChartsProps) {
    if (isLoading || !stats) {
        return (
            <div className="space-y-6 mb-8">
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="h-[300px] rounded-xl bg-surface animate-pulse border border-border" />
                    <div className="h-[300px] rounded-xl bg-surface animate-pulse border border-border" />
                </div>
                <div className="h-[400px] rounded-xl bg-surface animate-pulse border border-border" />
            </div>
        )
    }

    const featureDistData = Object.entries(stats.featuresByType || {}).map(([name, value]) => ({
        name,
        value
    }))

    const apiUsageFeatureData = Object.entries(stats.apiUsageByFeature || {}).map(([name, value]) => ({
        name,
        value
    }))

    const pieData = [
        { name: 'Draft', value: stats.draftProjects },
        { name: 'Completed', value: stats.completedProjects },
        { name: 'Deleted', value: stats.deletedProjects || 0 },
    ].filter(d => d.value > 0)

    return (
        <div className="space-y-6 mb-8">
            <div className="grid gap-6 md:grid-cols-2">
                {/* Feature Distribution */}
                <Card className="flex flex-col">
                    <div className="mb-4">
                        <h3 className="text-lg font-bold text-foreground">Feature Distribution</h3>
                        <p className="text-sm text-muted">Core capabilities across all projects</p>
                    </div>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={featureDistData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1a1b1e', border: '1px solid #333', borderRadius: '8px' }}
                                    cursor={{ fill: '#2a2b2e' }}
                                />
                                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Project Status */}
                <Card className="flex flex-col">
                    <div className="mb-4">
                        <h3 className="text-lg font-bold text-foreground">Project Status</h3>
                        <p className="text-sm text-muted">Overview of development progress</p>
                    </div>
                    <div className="h-[250px] w-full relative">
                        {pieData.length === 0 ? (
                            <div className="flex h-full items-center justify-center text-muted italic">
                                No projects data
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={
                                                entry.name === 'Completed' ? '#22c55e' :
                                                    entry.name === 'Deleted' ? '#6b7280' :
                                                        '#eab308'
                                            } />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1a1b1e', border: '1px solid #333', borderRadius: '8px' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] text-center pointer-events-none">
                            <div className="text-2xl font-bold">{stats.totalProjects}</div>
                            <div className="text-xs text-muted">Total</div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* API Usage History */}
            <Card className="flex flex-col">
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-foreground">External API Activity</h3>
                    <p className="text-sm text-muted">Requests made via API keys over the last 14 days</p>
                </div>
                <div className="h-[300px] w-full">
                    {stats.apiUsageByDay && stats.apiUsageByDay.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.apiUsageByDay}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    stroke="#888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(str) => {
                                        const date = new Date(str);
                                        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                                    }}
                                />
                                <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1a1b1e', border: '1px solid #333', borderRadius: '8px' }}
                                />
                                <Area type="monotone" dataKey="count" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCount)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex h-full items-center justify-center text-muted italic bg-surface-secondary rounded-lg border border-dashed border-border">
                            No external API activity recorded yet
                        </div>
                    )}
                </div>
            </Card>

            {/* API Usage by Feature */}
            <Card className="flex flex-col">
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-foreground">API Usage by Feature</h3>
                    <p className="text-sm text-muted">Which features are targeted by external requests</p>
                </div>
                <div className="h-[300px] w-full">
                    {apiUsageFeatureData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={apiUsageFeatureData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                                <XAxis type="number" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis dataKey="name" type="category" stroke="#888" fontSize={12} tickLine={false} axisLine={false} width={100} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1a1b1e', border: '1px solid #333', borderRadius: '8px' }}
                                    cursor={{ fill: '#2a2b2e' }}
                                />
                                <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex h-full items-center justify-center text-muted italic bg-surface-secondary rounded-lg border border-dashed border-border">
                            No data available for feature usage
                        </div>
                    )}
                </div>
            </Card>
        </div>
    )
}
