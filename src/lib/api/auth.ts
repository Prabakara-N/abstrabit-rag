import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { unauthorizedError, forbiddenError, notFoundError } from './responses'
import type { User } from '@supabase/supabase-js'

/**
 * Authentication and authorization utilities for API routes
 * Centralizes common auth patterns to reduce boilerplate
 */

// =============================================================================
// Types
// =============================================================================

export interface AuthResult {
  user: User
  supabase: Awaited<ReturnType<typeof createClient>>
}

export interface WorkspaceAuthResult extends AuthResult {
  workspaceId: string
}

// =============================================================================
// Authentication Helpers
// =============================================================================

/**
 * Verify user is authenticated
 * Returns user and supabase client, or throws unauthorized error
 */
export async function requireAuth(): Promise<AuthResult | Response> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return unauthorizedError()
  }

  return { user, supabase }
}

/**
 * Verify user is authenticated and owns the specified workspace
 * Returns user, supabase client, and workspaceId, or throws error
 */
export async function requireWorkspaceAccess(
  workspaceId: string | null | undefined
): Promise<WorkspaceAuthResult | Response> {
  if (!workspaceId) {
    return unauthorizedError('Workspace ID is required')
  }

  const authResult = await requireAuth()
  if (authResult instanceof Response) {
    return authResult
  }

  const { user, supabase } = authResult

  // Verify user owns this workspace
  const { data: workspace, error } = await supabase
    .from('workspaces')
    .select('id')
    .eq('id', workspaceId)
    .eq('user_id', user.id)
    .single()

  if (error || !workspace) {
    return forbiddenError('Access denied to this workspace')
  }

  return { user, supabase, workspaceId }
}

/**
 * Verify user owns a resource via its workspace relationship
 * Useful for nested resources (documents, sessions, etc.)
 */
export async function requireResourceAccess(
  table: 'documents' | 'chat_sessions' | 'tasks',
  resourceId: string
): Promise<WorkspaceAuthResult | Response> {
  const authResult = await requireAuth()
  if (authResult instanceof Response) {
    return authResult
  }

  const { user, supabase } = authResult

  // Get resource with workspace ownership check
  const { data: resource, error } = await supabase
    .from(table)
    .select(`
      id,
      workspace_id,
      workspaces!inner (
        user_id
      )
    `)
    .eq('id', resourceId)
    .single()

  if (error || !resource) {
    return notFoundError(`${table.slice(0, -1)} not found`)
  }

  const workspace = resource.workspaces as { user_id: string } | null
  if (workspace?.user_id !== user.id) {
    return forbiddenError('Access denied')
  }

  return { user, supabase, workspaceId: resource.workspace_id }
}

/**
 * Get admin client for operations that need to bypass RLS
 * Only use after verifying user authorization!
 */
export function getAdminClient() {
  return createAdminClient()
}

// =============================================================================
// Type Guards
// =============================================================================

/**
 * Check if auth result is an error response
 */
export function isAuthError(result: AuthResult | Response): result is Response {
  return result instanceof Response
}

export function isWorkspaceAuthError(
  result: WorkspaceAuthResult | Response
): result is Response {
  return result instanceof Response
}
