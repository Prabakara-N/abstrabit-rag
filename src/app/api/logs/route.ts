import { NextRequest } from 'next/server'
import {
  requireWorkspaceAccess,
  isWorkspaceAuthError,
} from '@/lib/api/auth'
import {
  successResponse,
  badRequestError,
  serverError,
} from '@/lib/api/responses'

/**
 * GET /api/logs - Get tool call logs for a workspace
 */
export async function GET(request: NextRequest) {
  const workspaceId = request.nextUrl.searchParams.get('workspaceId')

  if (!workspaceId) {
    return badRequestError('Missing workspaceId')
  }

  // Verify auth and workspace access
  const authResult = await requireWorkspaceAccess(workspaceId)
  if (isWorkspaceAuthError(authResult)) {
    return authResult
  }

  const { supabase } = authResult

  // Get tool calls for workspace
  const { data: logs, error } = await supabase
    .from('tool_calls')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    return serverError(error.message)
  }

  return successResponse({ logs })
}
