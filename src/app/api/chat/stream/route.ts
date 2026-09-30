import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { chatStream } from '@/lib/ai/chat-stream'
import type { ChatMessage } from '@/lib/ai/chat'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const body = await request.json()
  const { workspaceId, sessionId, message, history } = body as {
    workspaceId: string
    sessionId?: string
    message: string
    history?: ChatMessage[]
  }

  if (!workspaceId || !message) {
    return new Response(JSON.stringify({ error: 'Missing workspaceId or message' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Verify workspace belongs to user
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('id')
    .eq('id', workspaceId)
    .eq('user_id', user.id)
    .single()

  if (!workspace) {
    return new Response(JSON.stringify({ error: 'Workspace not found or access denied' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const adminSupabase = createAdminClient()

  // Create or use existing session
  let activeSessionId = sessionId

  if (!activeSessionId) {
    const { data: session, error } = await adminSupabase
      .from('chat_sessions')
      .insert({ workspace_id: workspaceId } as { workspace_id: string })
      .select()
      .single()

    if (error || !session) {
      return new Response(JSON.stringify({ error: 'Failed to create chat session' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    activeSessionId = (session as { id: string }).id
  }

  // Create a TransformStream for SSE
  const encoder = new TextEncoder()
  const stream = new TransformStream()
  const writer = stream.writable.getWriter()

  // Helper to send SSE events
  const sendEvent = async (event: string, data: unknown) => {
    await writer.write(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`))
  }

  // Start streaming in the background
  ;(async () => {
    try {
      // Send session ID first
      await sendEvent('session', { sessionId: activeSessionId })

      await chatStream(
        workspaceId,
        activeSessionId,
        message,
        history || [],
        {
          onToken: async (token) => {
            await sendEvent('token', { token })
          },
          onToolCall: async (toolCall) => {
            await sendEvent('tool', toolCall)
          },
          onComplete: async (data) => {
            await sendEvent('complete', data)
            await writer.close()
          },
          onError: async (error) => {
            await sendEvent('error', { message: error.message })
            await writer.close()
          },
        }
      )
    } catch (error) {
      await sendEvent('error', { message: error instanceof Error ? error.message : 'Unknown error' })
      await writer.close()
    }
  })()

  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
