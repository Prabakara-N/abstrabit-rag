'use client'

import { useEffect, useState, useMemo } from 'react'
import { Activity, CheckCircle, XCircle, Loader2, RefreshCw, Filter } from 'lucide-react'
import { useWorkspace } from '@/components/workspace/workspace-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ToolCall } from '@/types'

export default function LogsPage() {
  const { activeWorkspace } = useWorkspace()
  const [logs, setLogs] = useState<ToolCall[]>([])
  const [loading, setLoading] = useState(false)
  const [toolFilter, setToolFilter] = useState<string>('all')

  const fetchLogs = async () => {
    if (!activeWorkspace) return

    setLoading(true)
    try {
      const response = await fetch(`/api/logs?workspaceId=${activeWorkspace.id}`)
      const data = await response.json()

      if (response.ok) {
        setLogs(data.logs)
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [activeWorkspace])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  // Get unique tool names for filter
  const toolNames = useMemo(() => {
    const names = new Set(logs.map(log => log.tool_name))
    return Array.from(names).sort()
  }, [logs])

  // Filter logs based on selected tool
  const filteredLogs = useMemo(() => {
    if (toolFilter === 'all') return logs
    return logs.filter(log => log.tool_name === toolFilter)
  }, [logs, toolFilter])

  if (!activeWorkspace) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <Activity className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Workspace Selected</h2>
        <p className="text-muted-foreground text-center">
          Select a workspace to view tool call logs
        </p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Tool Logs</h1>
          <p className="text-muted-foreground mt-1">
            View AI tool call history in {activeWorkspace.name}
          </p>
        </div>
        <Button variant="outline" onClick={fetchLogs} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Tool Calls
              </CardTitle>
              <CardDescription>
                {toolFilter === 'all'
                  ? `Last 50 tool calls made by the AI assistant`
                  : `Showing ${filteredLogs.length} ${toolFilter} calls`}
              </CardDescription>
            </div>
            {toolNames.length > 0 && (
              <Select value={toolFilter} onValueChange={setToolFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by tool" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tools</SelectItem>
                  {toolNames.map(name => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading && logs.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No tool calls yet. Start a chat and ask the AI to save a task or send a notification.
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No {toolFilter} calls found.
            </div>
          ) : (
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="border rounded-lg p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                          {log.tool_name}
                        </Badge>
                        {log.status === 'success' ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(log.created_at)}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Arguments:</p>
                      <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                        {JSON.stringify(log.arguments, null, 2)}
                      </pre>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Result:</p>
                      <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                        {JSON.stringify(log.result, null, 2)}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
