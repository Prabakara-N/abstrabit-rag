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

  // Get documents for workspace
  const { data: documents, error } = await supabase
    .from('documents')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ documents })
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const documentId = request.nextUrl.searchParams.get('documentId')
  if (!documentId) {
    return NextResponse.json({ error: 'Missing documentId' }, { status: 400 })
  }

  // Verify document belongs to user's workspace by checking workspaces table
  const { data: document } = await supabase
    .from('documents')
    .select('id, workspace_id')
    .eq('id', documentId)
    .single()

  if (!document) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  }

  // Verify workspace belongs to user
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('id')
    .eq('id', (document as { workspace_id: string }).workspace_id)
    .eq('user_id', user.id)
    .single()

  if (!workspace) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  // Delete document (chunks will be cascade deleted)
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', documentId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
