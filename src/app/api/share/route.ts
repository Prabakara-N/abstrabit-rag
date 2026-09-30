import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import crypto from 'crypto'

// Generate a short unique ID (similar to nanoid)
function generateShareKey(): string {
  return crypto.randomBytes(6).toString('base64url')
}

// Create a shared chat
export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { sessionId, title, messages } = body as {
    sessionId: string
    title?: string
    messages: Array<{
      role: 'user' | 'assistant'
      content: string
    }>
  }

  if (!sessionId || !messages || messages.length === 0) {
    return NextResponse.json(
      { error: 'Missing sessionId or messages' },
      { status: 400 }
    )
  }

  // Verify user owns the session
  const { data: session } = await supabase
    .from('chat_sessions')
    .select(`
      id,
      workspaces!inner (
        user_id
      )
    `)
    .eq('id', sessionId)
    .single()

  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  const workspace = session.workspaces as { user_id: string } | null
  if (workspace?.user_id !== user.id) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  // Generate a short unique share key
  const shareKey = generateShareKey()

  // Create shared chat
  const adminSupabase = createAdminClient()
  const { data: sharedChat, error } = await adminSupabase
    .from('shared_chats')
    .insert({
      session_id: sessionId,
      share_key: shareKey,
      title: title || messages.find(m => m.role === 'user')?.content.slice(0, 50) || 'Shared Chat',
      messages: messages,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating shared chat:', error)
    return NextResponse.json(
      { error: 'Failed to create shared chat' },
      { status: 500 }
    )
  }

  const shareUrl = `${request.nextUrl.origin}/share/${shareKey}`

  return NextResponse.json({
    shareKey,
    shareUrl,
    id: sharedChat.id,
  })
}
