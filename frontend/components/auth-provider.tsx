"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from "react"
import { authApi, getAuthToken, removeAuthToken } from "@/lib/api"
import { useRouter } from "next/navigation"

interface User {
    id: string
    email: string
    first_name: string
    last_name: string
    [key: string]: any
}

interface AuthContextType {
    user: User | null
    loading: boolean
    login: (email: string, password: string) => Promise<{ error?: string; message?: string }>
    logout: () => void
    refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    const refreshUser = useCallback(async () => {
        const token = getAuthToken()
        if (!token) {
            setUser(null)
            setLoading(false)
            return
        }

        try {
            const response = await authApi.getProfile()
            if (response.data && response.data.user) {
                setUser(response.data.user)
            } else {
                // Token might be invalid
                removeAuthToken()
                setUser(null)
            }
        } catch (error) {
            console.error("Failed to fetch user profile:", error)
            setUser(null)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        refreshUser()
    }, [refreshUser])

    const login = async (email: string, password: string) => {
        try {
            const response = await authApi.login(email, password)
            if (response.data?.access_token) {
                await refreshUser()
                return { message: "Login successful" }
            }
            return { error: response.error || "Login failed", message: response.message }
        } catch (error) {
            return { error: "An unexpected error occurred" }
        }
    }

    const logout = () => {
        authApi.logout()
        setUser(null)
        router.push("/login")
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}
