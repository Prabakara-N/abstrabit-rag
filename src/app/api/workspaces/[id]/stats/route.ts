import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: workspaceId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify workspace ownership
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('id')
    .eq('id', workspaceId)
    .eq('user_id', user.id)
    .single()

  if (!workspace) {
    return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
  }

  // Fetch all stats in parallel
  const [
    documentsResult,
    chunksResult,
    sessionsResult,
    toolCallsResult,
    tasksResult,
    recentDocumentsResult,
    recentSessionsResult,
    toolCallStatsResult,
  ] = await Promise.all([
    // Total documents
    supabase
      .from('documents')
      .select('id', { count: 'exact', head: true })
      .eq('workspace_id', workspaceId),

    // Total chunks (knowledge base size)
    supabase
      .from('chunks')
      .select('id', { count: 'exact', head: true })
      .eq('workspace_id', workspaceId),

    // Total chat sessions
    supabase
      .from('chat_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('workspace_id', workspaceId),

    // Total tool calls
    supabase
      .from('tool_calls')
      .select('id', { count: 'exact', head: true })
      .eq('workspace_id', workspaceId),

    // Total tasks created
    supabase
      .from('tasks')
      .select('id', { count: 'exact', head: true })
      .eq('workspace_id', workspaceId),

    // Recent documents (last 5)
    supabase
      .from('documents')
      .select('id, filename, created_at')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })
      .limit(5),

    // Recent chat sessions with first message preview
    supabase
      .from('chat_sessions')
      .select(`
        id,
        created_at,
        messages (
          content,
          role
        )
      `)
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })
      .limit(5),

    // Tool call breakdown by status
    supabase
      .from('tool_calls')
      .select('status')
      .eq('workspace_id', workspaceId),
  ])

  // Calculate tool call success/error counts
  const toolCallBreakdown = {
    success: 0,
    error: 0,
  }
  if (toolCallStatsResult.data) {
    for (const call of toolCallStatsResult.data) {
      if (call.status === 'success') toolCallBreakdown.success++
      else if (call.status === 'error') toolCallBreakdown.error++
    }
  }

  // Format recent sessions with preview
  const recentSessions = recentSessionsResult.data?.map(session => {
    const messages = session.messages as { content: string; role: string }[] | null
    const firstUserMessage = messages?.find(m => m.role === 'user')
    return {
      id: session.id,
      created_at: session.created_at,
      preview: firstUserMessage?.content?.slice(0, 60) || 'New conversation',
    }
  }) || []

  return NextResponse.json({
    stats: {
      documents: documentsResult.count || 0,
      chunks: chunksResult.count || 0,
      chatSessions: sessionsResult.count || 0,
      toolCalls: toolCallsResult.count || 0,
      tasks: tasksResult.count || 0,
      toolCallBreakdown,
    },
    recentDocuments: recentDocumentsResult.data || [],
    recentSessions,
  })
}
