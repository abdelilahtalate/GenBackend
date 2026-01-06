"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { Card } from "@/components/card"
import { Button } from "@/components/button"
import { Play, Send, Sparkles, AlertCircle, Check, Loader2, ArrowRight, Folder, FileCode, FileJson, ShieldCheck, Database, Activity, Code, X, ChevronRight, ChevronDown, FileText } from "lucide-react"
import { aiApi, projectsApi, featuresApi } from "@/lib/api"
import type { Feature } from "@/types"
import { Step5Testing } from "./step5-testing"

interface StepChatWorkspaceProps {
    onComplete: () => void
    projectInfo: any
    features: Feature[]
    projectId?: string
    updateState: (updates: any) => void
}

interface Message {
    role: "user" | "assistant"
    content: string | React.ReactNode
}

interface FileEntry {
    name: string
    path: string
    type: 'file' | 'folder'
    icon: React.ReactNode
    content?: string
    children?: FileEntry[]
}

export function StepChatWorkspace({ onComplete, projectInfo, features, projectId, updateState }: StepChatWorkspaceProps) {
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "Hi! Describe the backend you want to build. For example: 'I want a bookstore backend with Books, Authors, and Login.'" }
    ])
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)
    const [activeTab, setActiveTab] = useState<"preview" | "test">("preview")
    const [selectedFile, setSelectedFile] = useState<FileEntry | null>(null)
    const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({ "app": true, "app/models": true, "app/routes": true })
    const [projectFiles, setProjectFiles] = useState<Record<string, string>>({})
    const [previewLoading, setPreviewLoading] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editContent, setEditContent] = useState("")
    const [saving, setSaving] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    // Fetch dynamic project files from backend
    useEffect(() => {
        const fetchPreview = async () => {
            if (features.length === 0) return

            setPreviewLoading(true)
            try {
                const res = await projectsApi.preview({ projectInfo, features })
                if (res.data?.success) {
                    setProjectFiles(res.data.files)
                }
            } catch (err) {
                console.error("Failed to fetch preview:", err)
            } finally {
                setPreviewLoading(false)
            }
        }

        fetchPreview()
    }, [features, projectInfo])

    // Convert flat file list to hierarchy
    const fileTree = useMemo(() => {
        const root: FileEntry[] = []

        const getIcon = (name: string, isFolder: boolean) => {
            if (isFolder) return <Folder className="w-4 h-4 text-blue-400" />
            if (name.endsWith('.py')) return <FileCode className="w-4 h-4 text-green-400" />
            if (name.endsWith('.json') || name.endsWith('.txt')) return <FileJson className="w-4 h-4 text-yellow-400" />
            return <FileText className="w-4 h-4 text-gray-400" />
        }

        Object.entries(projectFiles).forEach(([path, content]) => {
            const parts = path.split('/')
            let currentLevel = root

            parts.forEach((part, i) => {
                const isLast = i === parts.length - 1
                const currentPath = parts.slice(0, i + 1).join('/')

                let existing = currentLevel.find(e => e.name === part)

                if (!existing) {
                    existing = {
                        name: part,
                        path: currentPath,
                        type: isLast ? 'file' : 'folder',
                        icon: getIcon(part, !isLast),
                        content: isLast ? content : undefined,
                        children: isLast ? undefined : []
                    }
                    currentLevel.push(existing)
                    // Sort: folders first, then files
                    currentLevel.sort((a, b) => {
                        if (a.type === b.type) return a.name.localeCompare(b.name)
                        return a.type === 'folder' ? -1 : 1
                    })
                }

                if (!isLast) {
                    currentLevel = existing.children!
                }
            })
        })

        return root
    }, [projectFiles])

    // Toggle folder expansion
    const toggleFolder = (path: string) => {
        setOpenFolders(prev => ({ ...prev, [path]: !prev[path] }))
    }

    // Scroll to bottom of chat
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const handleSaveCode = async () => {
        if (!selectedFile || !projectId) return
        setSaving(true)
        try {
            // 1. Update local state
            const updatedFiles = { ...projectFiles, [selectedFile.path]: editContent }
            setProjectFiles(updatedFiles)
            setIsEditing(false)

            // 2. Sync back to backend features so Live Test works
            const res = await projectsApi.syncFromFiles(projectId, { files: updatedFiles })

            if (res.data?.success) {
                // 3. Refresh features list so Step5Testing has new code
                const finalFeaturesRes = await featuresApi.list(projectId)
                const finalFeatures = finalFeaturesRes.data?.features || []

                updateState({
                    selectedFeatures: finalFeatures
                })

                setMessages(prev => [...prev, {
                    role: "assistant",
                    content: `Synced changes to ${selectedFile.name} with project features. You can now test the updated logic in Live Test!`
                }])
            } else {
                setMessages(prev => [...prev, { role: "assistant", content: `Saved ${selectedFile.name} locally, but sync failed: ${res.error}` }])
            }
        } catch (err: any) {
            console.error("Save failed:", err)
            setMessages(prev => [...prev, { role: "assistant", content: `Failed to save changes: ${err.message}` }])
        } finally {
            setSaving(false)
        }
    }
    const handleSendMessage = async () => {
        if (!input.trim() || loading) return

        const userMsg = input
        setMessages(prev => [...prev, { role: "user", content: userMsg }])
        setInput("")
        setLoading(true)

        try {
            const currentContext = features.length > 0 ? {
                project_info: projectInfo,
                features: features.map(f => ({
                    name: f.name,
                    type: f.feature_type,
                    config: f.configuration || f.config || {}
                }))
            } : null

            const { data, error } = await aiApi.generatePlan(userMsg, currentContext)

            if (!data || !data.plan) {
                setMessages(prev => [...prev, { role: "assistant", content: data?.error || "AI failed to generate a project plan. Please try a different prompt." }])
                return
            }

            const plan = data.plan
            let currentProjectId = projectId

            // Create or Update Project
            if (!currentProjectId && plan.project_info) {
                const pRes = await projectsApi.create({
                    name: plan.project_info.name,
                    description: plan.project_info.description,
                    generation_mode: "chat"
                })
                if (pRes.data?.project?.id) {
                    currentProjectId = pRes.data.project.id.toString()
                }
            } else if (currentProjectId && plan.project_info) {
                await projectsApi.update(currentProjectId, plan.project_info)
            }

            // Sync Features (Create, Update, or Delete)
            if (currentProjectId && plan.features) {
                const existingRes = await featuresApi.list(currentProjectId)
                const existingFeatures = existingRes.data?.features || []
                const planFeatureNames = plan.features.map((f: any) => f.name)

                // 1. Update or Create features from plan
                for (const f of plan.features) {
                    let existing = existingFeatures.find((ef: any) => ef.name === f.name)
                    const isAuth = f.type?.toUpperCase() === 'AUTH' || f.type?.toUpperCase() === 'AUTHENTICATION'

                    // Singleton logic for AUTH: Merge by type if name changed
                    if (!existing && isAuth) {
                        existing = existingFeatures.find((ef: any) =>
                            ef.feature_type?.toUpperCase() === 'AUTH' ||
                            ef.feature_type?.toUpperCase() === 'AUTHENTICATION' ||
                            ef.name?.toUpperCase() === 'AUTH'
                        )
                    }

                    const featureData = {
                        project_id: currentProjectId,
                        name: f.name,
                        feature_type: f.type || 'CRUD',
                        configuration: f.config || f.configuration || {},
                        config: f.config || f.configuration || {},
                        generation_mode: 'ai',
                        schema_definition: {}
                    }

                    if (existing) {
                        await featuresApi.update(existing.id, {
                            name: f.name, // Allow renaming
                            configuration: f.config || f.configuration || {},
                            feature_type: f.type || existing.feature_type
                        })
                    } else {
                        await featuresApi.create(featureData)
                    }
                }

                // 2. Cleanup: Remove features that are no longer in the plan
                // We only do this if the plan is intended to be exhaustive (which it is for Chat mode)
                const featuresToDelete = existingFeatures.filter((ef: any) =>
                    !planFeatureNames.includes(ef.name) &&
                    // Don't delete if it was just renamed (handled by singleton logic)
                    !((ef.feature_type?.toUpperCase() === 'AUTH' || ef.feature_type?.toUpperCase() === 'AUTHENTICATION') &&
                        plan.features.some((pf: any) => pf.type?.toUpperCase() === 'AUTH' || pf.type?.toUpperCase() === 'AUTHENTICATION'))
                )

                for (const f of featuresToDelete) {
                    await featuresApi.delete(f.id)
                }
            }

            // Update State
            const finalFeaturesRes = await featuresApi.list(currentProjectId!)
            const finalFeatures = finalFeaturesRes.data?.features || []

            updateState({
                projectId: currentProjectId,
                projectInfo: plan.project_info,
                selectedFeatures: finalFeatures
            })

            const summary = (
                <div className="space-y-2">
                    <p>I've updated your project! Look at the repository to see the generated code. I've added:</p>
                    <ul className="list-disc list-inside space-y-1 opacity-90">
                        {plan.features.map((f: any, idx: number) => (
                            <li key={idx}>
                                <span className="font-semibold">{f.name}</span> ({f.type})
                            </li>
                        ))}
                    </ul>
                </div>
            )

            setMessages(prev => [...prev, { role: "assistant", content: summary }])

            if (finalFeatures.length > 0) {
                setActiveTab("preview")
            }

        } catch (err: any) {
            setMessages(prev => [...prev, { role: "assistant", content: `Something went wrong: ${err.message}` }])
        } finally {
            setLoading(false)
        }
    }

    const renderFileTree = (entries: FileEntry[], level = 0) => {
        return entries.map(entry => (
            <div key={entry.path}>
                <div
                    className={`flex items-center gap-2 py-1 px-2 hover:bg-white/5 rounded cursor-pointer transition-colors ${selectedFile?.path === entry.path ? 'bg-white/10' : ''}`}
                    style={{ paddingLeft: `${level * 12 + 8}px` }}
                    onClick={() => {
                        if (entry.type === 'folder') toggleFolder(entry.path)
                        else setSelectedFile(entry)
                    }}
                >
                    {entry.type === 'folder' ? (
                        openFolders[entry.path] ? <ChevronDown className="w-3 h-3 opacity-40" /> : <ChevronRight className="w-3 h-3 opacity-40" />
                    ) : <span className="w-3" />}

                    {entry.icon}
                    <span className={`text-xs truncate ${entry.type === 'folder' ? 'font-semibold text-white/80' : 'text-white/60'}`}>{entry.name}</span>
                </div>

                {entry.type === 'folder' && openFolders[entry.path] && entry.children && (
                    <div>{renderFileTree(entry.children, level + 1)}</div>
                )}
            </div>
        ))
    }

    return (
        <div className="flex h-full gap-6">
            {/* Left Panel: Chat */}
            <div className="w-1/3 flex flex-col bg-surface border border-border rounded-xl overflow-hidden shadow-sm h-[600px]">
                <div className="p-4 border-b border-border bg-surface-secondary/30">
                    <h3 className="font-semibold flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        AI Architect
                    </h3>
                </div>

                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((m, i) => (
                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-lg p-3 text-sm ${m.role === 'user'
                                ? 'bg-primary text-background'
                                : 'bg-surface-secondary border border-border text-foreground'
                                }`}>
                                {m.content}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-surface-secondary border border-border rounded-lg p-3 text-sm flex items-center gap-2">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Planning project...
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-border bg-background">
                    <div className="flex gap-2">
                        <textarea
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                            placeholder="Describe your backend..."
                            className="flex-1 resize-none bg-surface border border-border rounded-lg p-2 text-sm focus:outline-none focus:border-primary h-20"
                        />
                        <Button onClick={handleSendMessage} disabled={loading || !input.trim()} className="h-auto">
                            <Send className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Right Panel: Preview & Test */}
            <div className="flex-1 flex flex-col bg-background/50 border border-border rounded-xl overflow-hidden h-[600px]">
                <div className="flex items-center justify-between border-b border-border p-2 bg-surface">
                    <div className="flex gap-1">
                        <button
                            onClick={() => setActiveTab('preview')}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'preview' ? 'bg-surface-secondary text-foreground' : 'text-muted hover:text-foreground'}`}
                        >
                            Repository
                        </button>
                        <button
                            onClick={() => setActiveTab('test')}
                            disabled={!projectId}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'test' ? 'bg-surface-secondary text-foreground' : 'text-muted hover:text-foreground disabled:opacity-50'}`}
                        >
                            Live Test
                        </button>
                    </div>
                    {projectId && (
                        <Button size="sm" onClick={onComplete} className="mr-2 h-8">
                            <ArrowRight className="w-4 h-4 mr-2" /> Download Project
                        </Button>
                    )}
                </div>

                <div className="flex-1 overflow-hidden flex bg-[#0d1117]">
                    {activeTab === 'preview' ? (
                        <>
                            {/* File Tree */}
                            <div className="w-60 border-r border-white/10 overflow-y-auto py-2">
                                {previewLoading ? (
                                    <div className="flex items-center justify-center h-full opacity-20">
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                    </div>
                                ) : features.length === 0 ? (
                                    <div className="px-4 py-10 text-center opacity-20">
                                        <Code className="w-8 h-8 mx-auto mb-2" />
                                        <p className="text-[10px] font-mono">Empty repo. <br /> Describe features to start.</p>
                                    </div>
                                ) : (
                                    renderFileTree(fileTree)
                                )}
                            </div>

                            {/* File Content */}
                            <div className="flex-1 overflow-hidden flex flex-col">
                                {selectedFile ? (
                                    <>
                                        <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/5">
                                            <div className="flex items-center gap-2">
                                                {selectedFile.icon}
                                                <span className="text-xs font-mono text-white/70">{selectedFile.path}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {isEditing ? (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => setIsEditing(false)}
                                                            className="h-7 text-[10px] text-white/50 hover:text-white"
                                                        >
                                                            Cancel
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            onClick={handleSaveCode}
                                                            loading={saving}
                                                            className="h-7 text-[10px] bg-green-600 hover:bg-green-700 text-white border-0"
                                                        >
                                                            Save
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => {
                                                            setIsEditing(true)
                                                            setEditContent(projectFiles[selectedFile.path] || selectedFile.content || "")
                                                        }}
                                                        className="h-7 text-[10px] text-white/50 hover:text-white"
                                                    >
                                                        Edit
                                                    </Button>
                                                )}
                                                <button onClick={() => { setSelectedFile(null); setIsEditing(false); }} className="hover:text-white p-1">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex-1 overflow-auto font-mono text-xs leading-relaxed text-[#c9d1d9] scrollbar-thin scrollbar-thumb-white/10 bg-[#0d1117]">
                                            {isEditing ? (
                                                <textarea
                                                    value={editContent}
                                                    onChange={(e) => setEditContent(e.target.value)}
                                                    className="w-full h-full p-4 bg-transparent outline-none resize-none border-none text-[#c9d1d9] selection:bg-primary/30"
                                                    spellCheck={false}
                                                    autoFocus
                                                />
                                            ) : (
                                                <pre className="p-4">{projectFiles[selectedFile.path] || selectedFile.content}</pre>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center opacity-20 text-center p-6">
                                        <FileCode className="w-12 h-12 mb-4" />
                                        <p className="text-sm font-mono">Select a file to preview its generated code</p>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 bg-background overflow-auto h-full p-4">
                            {projectId ? (
                                <Step5Testing features={features} projectId={projectId} />
                            ) : (
                                <div className="flex items-center justify-center h-full text-muted">
                                    Launch a feature to start testing.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
