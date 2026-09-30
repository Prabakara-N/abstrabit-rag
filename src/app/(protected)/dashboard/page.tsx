'use client'

import { useWorkspace } from '@/components/workspace/workspace-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, MessageSquare, Activity, FolderOpen, CheckCircle, XCircle, Database, ListTodo, Clock, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface WorkspaceStats {
  stats: {
    documents: number
    chunks: number
    chatSessions: number
    toolCalls: number
    tasks: number
    toolCallBreakdown: {
      success: number
      error: number
    }
  }
  recentDocuments: Array<{
    id: string
    filename: string
    created_at: string
  }>
  recentSessions: Array<{
    id: string
    created_at: string
    preview: string
  }>
}

export default function DashboardPage() {
  const { activeWorkspace } = useWorkspace()
  const [stats, setStats] = useState<WorkspaceStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!activeWorkspace) {
      setLoading(false)
      return
    }

    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/workspaces/${activeWorkspace.id}/stats`)
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [activeWorkspace])

  if (!activeWorkspace) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <FolderOpen className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Workspace Selected</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Create a new workspace using the dropdown in the sidebar to get started.
        </p>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const successRate = stats?.stats.toolCalls
    ? Math.round((stats.stats.toolCallBreakdown.success / stats.stats.toolCalls) * 100)
    : 0

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome to {activeWorkspace.name}</h1>
        <p className="text-muted-foreground mt-1">
          Your AI-powered document assistant
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : stats?.stats.documents || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {loading ? '' : `${stats?.stats.chunks || 0} chunks indexed`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chat Sessions</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : stats?.stats.chatSessions || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Conversations with AI
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tool Calls</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : stats?.stats.toolCalls || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {!loading && stats?.stats.toolCalls ? (
                <span className={successRate >= 80 ? 'text-green-500' : successRate >= 50 ? 'text-yellow-500' : 'text-red-500'}>
                  {successRate}% success rate
                </span>
              ) : (
                'AI actions executed'
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Created</CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : stats?.stats.tasks || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Via AI tool calls
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions and Activity */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Link href="/documents">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center mb-2">
                <FileText className="h-6 w-6" />
              </div>
              <CardTitle>Documents</CardTitle>
              <CardDescription>Upload and manage your documents</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/chat">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-green-500/10 text-green-500 flex items-center justify-center mb-2">
                <MessageSquare className="h-6 w-6" />
              </div>
              <CardTitle>Chat</CardTitle>
              <CardDescription>Ask questions about your documents</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/logs">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center mb-2">
                <Activity className="h-6 w-6" />
              </div>
              <CardTitle>Tool Logs</CardTitle>
              <CardDescription>View AI tool call history</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Documents
            </CardTitle>
            <CardDescription>
              Latest uploads to your workspace
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground text-sm">Loading...</p>
            ) : stats?.recentDocuments.length ? (
              <ul className="space-y-3">
                {stats.recentDocuments.map(doc => (
                  <li key={doc.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm truncate">{doc.filename}</span>
                    </div>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {formatDate(doc.created_at)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm">
                No documents yet. <Link href="/documents" className="text-primary hover:underline">Upload your first document</Link>
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Chats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Recent Conversations
            </CardTitle>
            <CardDescription>
              Your latest chat sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground text-sm">Loading...</p>
            ) : stats?.recentSessions.length ? (
              <ul className="space-y-3">
                {stats.recentSessions.map(session => (
                  <li key={session.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm truncate">{session.preview}</span>
                    </div>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {formatDate(session.created_at)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm">
                No conversations yet. <Link href="/chat" className="text-primary hover:underline">Start your first chat</Link>
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tool Call Breakdown */}
      {stats && stats.stats.toolCalls > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Tool Call Performance
            </CardTitle>
            <CardDescription>
              Success and error breakdown of AI tool executions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm">
                  <span className="font-bold text-lg">{stats.stats.toolCallBreakdown.success}</span>
                  <span className="text-muted-foreground ml-1">successful</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                <span className="text-sm">
                  <span className="font-bold text-lg">{stats.stats.toolCallBreakdown.error}</span>
                  <span className="text-muted-foreground ml-1">failed</span>
                </span>
              </div>
              <div className="flex-1">
                <div className="h-3 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all"
                    style={{ width: `${successRate}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
