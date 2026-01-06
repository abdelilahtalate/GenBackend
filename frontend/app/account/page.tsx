"use client"

import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/button"
import { Card } from "@/components/card"
import { useState } from "react"
import { useAuth } from "@/components/auth-provider"

export default function AccountPage() {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState("free")

  const email = user?.email || "loading..."

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-border p-6">
          <h1 className="text-3xl font-bold text-foreground">Account</h1>
          <p className="text-muted mt-1">Manage your account and billing</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-2xl space-y-6">
            {/* Billing Information */}
            <Card className="space-y-4">
              <h2 className="text-xl font-bold text-foreground">Billing Information</h2>

              <div className="bg-surface p-4 rounded-lg border border-border space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted">Subscription Plan</p>
                  <p className="text-lg font-semibold text-foreground capitalize">{subscription}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted">Billing Email</p>
                  <p className="text-lg font-semibold text-foreground">{email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted">Next Billing Date</p>
                  <p className="text-lg font-semibold text-foreground">February 15, 2025</p>
                </div>
              </div>

              <Button>Manage Subscription</Button>
            </Card>

            {/* Payment Method */}
            <Card className="space-y-4">
              <h2 className="text-xl font-bold text-foreground">Payment Method</h2>

              <div className="bg-surface p-4 rounded-lg border border-border">
                <p className="text-sm font-medium text-muted mb-2">Credit Card</p>
                <p className="text-lg text-foreground font-mono">•••• •••• •••• 4242</p>
                <p className="text-xs text-muted mt-1">Expires 12/2026</p>
              </div>

              <Button variant="outline">Update Payment Method</Button>
            </Card>

            {/* Invoices */}
            <Card className="space-y-4">
              <h2 className="text-xl font-bold text-foreground">Invoices</h2>

              <div className="space-y-2">
                {[
                  { date: "January 15, 2025", amount: "$99", status: "Paid" },
                  { date: "December 15, 2024", amount: "$99", status: "Paid" },
                  { date: "November 15, 2024", amount: "$99", status: "Paid" },
                ].map((invoice, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-surface rounded-lg border border-border"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{invoice.date}</p>
                      <p className="text-xs text-muted">{invoice.amount}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs px-2 py-1 bg-success/20 text-success rounded">{invoice.status}</span>
                      <Button variant="ghost" size="sm">
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Delete Account */}
            <Card className="space-y-4 border-error/30 bg-error/5">
              <h2 className="text-xl font-bold text-error">Danger Zone</h2>
              <p className="text-sm text-muted">
                Deleting your account is permanent and cannot be undone. All your projects and data will be lost.
              </p>
              <Button variant="ghost">Delete Account</Button>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
