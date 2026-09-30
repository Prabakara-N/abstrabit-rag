import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get session with messages
  const { data: session, error } = await supabase
    .from('chat_sessions')
    .select(`
      id,
      workspace_id,
      workspaces!inner (
        user_id
      ),
      messages (
        role,
        content,
        citations,
        created_at
      )
    `)
    .eq('id', id)
    .single()

  if (error || !session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  // Verify user owns the workspace
  const workspace = session.workspaces as { user_id: string } | null
  if (workspace?.user_id !== user.id) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  // Format messages
  const messages = (session.messages as Array<{
    role: 'user' | 'assistant'
    content: string
    citations: unknown
    created_at: string
  }> | null)?.sort((a, b) =>
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  ).map(m => ({
    role: m.role,
    content: m.content,
    citations: m.citations || undefined,
  })) || []

  return NextResponse.json({ messages })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify session exists and user owns the workspace
  const { data: session, error: fetchError } = await supabase
    .from('chat_sessions')
    .select(`
      id,
      workspaces!inner (
        user_id
      )
    `)
    .eq('id', id)
    .single()

  if (fetchError || !session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  const workspace = session.workspaces as { user_id: string } | null
  if (workspace?.user_id !== user.id) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  // Delete session using admin client to bypass RLS
  // (messages cascade delete via foreign key)
  const adminSupabase = createAdminClient()
  const { error: deleteError } = await adminSupabase
    .from('chat_sessions')
    .delete()
    .eq('id', id)

  if (deleteError) {
    console.error('Delete error:', deleteError)
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
