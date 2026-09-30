import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Json } from '@/types/database'

// Tool schemas for validation
export const saveTaskSchema = z.object({
  title: z.string().min(1).max(200).describe('The task title'),
  description: z.string().max(1000).optional().describe('Optional task description'),
})

export const sendNotificationSchema = z.object({
  message: z.string().min(1).max(500).describe('The notification message to send'),
})

export type SaveTaskArgs = z.infer<typeof saveTaskSchema>
export type SendNotificationArgs = z.infer<typeof sendNotificationSchema>

// Tool definitions for new Gemini SDK
export const toolDefinitions = [
  {
    name: 'save_task',
    description: 'Save a task to the workspace task list. Use this when the user asks to create, save, or remember a task or to-do item.',
    parameters: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'The task title (max 200 characters)',
        },
        description: {
          type: 'string',
          description: 'Optional task description (max 1000 characters)',
        },
      },
      required: ['title'],
    },
  },
  {
    name: 'send_notification',
    description: 'Send a notification message to Discord. Use this when the user asks to send a notification, alert, or message.',
    parameters: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          description: 'The message to send (max 500 characters)',
        },
      },
      required: ['message'],
    },
  },
]

// Tool execution functions
export async function executeSaveTask(
  workspaceId: string,
  args: SaveTaskArgs
): Promise<{ success: boolean; taskId?: string; error?: string }> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      workspace_id: workspaceId,
      title: args.title,
      description: args.description || null,
      status: 'pending',
    })
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, taskId: data?.id }
}

export async function executeSendNotification(
  args: SendNotificationArgs
): Promise<{ success: boolean; error?: string }> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL

  if (!webhookUrl) {
    return { success: false, error: 'Discord webhook not configured' }
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: args.message,
      }),
    })

    if (!response.ok) {
      return { success: false, error: 'Failed to send notification' }
    }

    return { success: true }
  } catch {
    return { success: false, error: 'Network error sending notification' }
  }
}

// Log tool call
export async function logToolCall(
  workspaceId: string,
  sessionId: string | null,
  toolName: string,
  args: Record<string, unknown>,
  result: Record<string, unknown>,
  status: 'success' | 'error'
) {
  const supabase = createAdminClient()

  await supabase.from('tool_calls').insert({
    workspace_id: workspaceId,
    session_id: sessionId,
    tool_name: toolName,
    arguments: args as unknown as Json,
    result: result as unknown as Json,
    status,
  })
}
