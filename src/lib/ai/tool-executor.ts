import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Tool Executor - Centralized tool execution logic
 * Handles validation, execution, and logging for all AI tools
 */

// =============================================================================
// Tool Schemas
// =============================================================================

export const toolSchemas = {
  save_task: z.object({
    title: z.string().min(1).max(200),
    description: z.string().max(1000).optional(),
  }),
  send_notification: z.object({
    message: z.string().min(1).max(500),
  }),
} as const

export type ToolName = keyof typeof toolSchemas
export type ToolArgs<T extends ToolName> = z.infer<typeof toolSchemas[T]>

// =============================================================================
// Tool Result Types
// =============================================================================

export interface ToolResult {
  success: boolean
  data?: Record<string, unknown>
  error?: string
}

export interface ToolExecutionLog {
  toolName: string
  args: Record<string, unknown>
  result: ToolResult
  status: 'success' | 'error'
}

// =============================================================================
// Tool Implementations
// =============================================================================

async function executeSaveTask(
  args: ToolArgs<'save_task'>,
  workspaceId: string
): Promise<ToolResult> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      workspace_id: workspaceId,
      title: args.title,
      description: args.description || null,
      status: 'pending',
    })
    .select('id')
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  return {
    success: true,
    data: {
      taskId: data.id,
      message: `Task "${args.title}" saved successfully`,
    },
  }
}

async function executeSendNotification(
  args: ToolArgs<'send_notification'>
): Promise<ToolResult> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL

  if (!webhookUrl) {
    return {
      success: false,
      error: 'Discord webhook not configured',
    }
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: args.message,
        username: 'Abstrabit RAG',
      }),
    })

    if (!response.ok) {
      return {
        success: false,
        error: `Discord API error: ${response.status}`,
      }
    }

    return {
      success: true,
      data: { message: 'Notification sent successfully' },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send notification',
    }
  }
}

// =============================================================================
// Main Executor
// =============================================================================

/**
 * Execute a tool by name with validation
 */
export async function executeTool(
  toolName: string,
  rawArgs: Record<string, unknown>,
  workspaceId: string
): Promise<ToolExecutionLog> {
  // Check if tool exists
  if (!(toolName in toolSchemas)) {
    return {
      toolName,
      args: rawArgs,
      result: { success: false, error: `Unknown tool: ${toolName}` },
      status: 'error',
    }
  }

  const schema = toolSchemas[toolName as ToolName]

  // Validate arguments
  const parsed = schema.safeParse(rawArgs)
  if (!parsed.success) {
    return {
      toolName,
      args: rawArgs,
      result: {
        success: false,
        error: `Invalid arguments: ${parsed.error.message}`,
      },
      status: 'error',
    }
  }

  // Execute tool
  let result: ToolResult

  switch (toolName) {
    case 'save_task':
      result = await executeSaveTask(
        parsed.data as ToolArgs<'save_task'>,
        workspaceId
      )
      break
    case 'send_notification':
      result = await executeSendNotification(
        parsed.data as ToolArgs<'send_notification'>
      )
      break
    default:
      result = { success: false, error: `Unhandled tool: ${toolName}` }
  }

  return {
    toolName,
    args: rawArgs,
    result,
    status: result.success ? 'success' : 'error',
  }
}

/**
 * Log tool execution to database
 */
export async function logToolExecution(
  log: ToolExecutionLog,
  workspaceId: string,
  sessionId?: string
): Promise<void> {
  const supabase = createAdminClient()

  await supabase.from('tool_calls').insert({
    workspace_id: workspaceId,
    session_id: sessionId || null,
    tool_name: log.toolName,
    arguments: JSON.parse(JSON.stringify(log.args)),
    result: JSON.parse(JSON.stringify(log.result)),
    status: log.status as 'success' | 'error',
  })
}

/**
 * Execute tool and log result
 */
export async function executeAndLogTool(
  toolName: string,
  rawArgs: Record<string, unknown>,
  workspaceId: string,
  sessionId?: string
): Promise<ToolExecutionLog> {
  const log = await executeTool(toolName, rawArgs, workspaceId)
  await logToolExecution(log, workspaceId, sessionId)
  return log
}
