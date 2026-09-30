import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const workspaceId = request.nextUrl.searchParams.get('workspaceId')
  if (!workspaceId) {
    return NextResponse.json({ error: 'Missing workspaceId' }, { status: 400 })
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

  // Get chat sessions with first message as preview
  const { data: sessions, error } = await supabase
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
    .limit(20)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Format sessions with preview
  const formattedSessions = sessions?.map(session => {
    const messages = session.messages as { content: string; role: string }[] | null
    const firstUserMessage = messages?.find(m => m.role === 'user')
    return {
      id: session.id,
      created_at: session.created_at,
      preview: firstUserMessage?.content?.slice(0, 50) || 'New conversation',
    }
  }) || []

  return NextResponse.json({ sessions: formattedSessions })
}
