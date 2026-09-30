import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { chat, type ChatMessage } from '@/lib/ai/chat'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { workspaceId, sessionId, message, history } = body as {
    workspaceId: string
    sessionId?: string
    message: string
    history?: ChatMessage[]
  }

  if (!workspaceId || !message) {
    return NextResponse.json(
      { error: 'Missing workspaceId or message' },
      { status: 400 }
    )
  }

  // Verify workspace belongs to user
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('id')
    .eq('id', workspaceId)
    .eq('user_id', user.id)
    .single()

  if (!workspace) {
    return NextResponse.json(
      { error: 'Workspace not found or access denied' },
      { status: 403 }
    )
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
      return NextResponse.json(
        { error: 'Failed to create chat session' },
        { status: 500 }
      )
    }

    activeSessionId = (session as { id: string }).id
  }

  try {
    const response = await chat(
      workspaceId,
      activeSessionId,
      message,
      history || []
    )

    return NextResponse.json({
      sessionId: activeSessionId,
      ...response,
    })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    )
  }
}

// Get chat history for a session
export async function GET(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sessionId = request.nextUrl.searchParams.get('sessionId')
  if (!sessionId) {
    return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })
  }

  // Get messages (RLS will ensure user can only access their own)
  const { data: messages, error } = await supabase
    .from('messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ messages })
}
