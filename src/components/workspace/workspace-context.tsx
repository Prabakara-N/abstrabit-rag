'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Workspace } from '@/types'

interface WorkspaceContextType {
  workspaces: Workspace[]
  activeWorkspace: Workspace | null
  setActiveWorkspace: (workspace: Workspace) => void
  createWorkspace: (name: string) => Promise<Workspace | null>
  deleteWorkspace: (id: string) => Promise<boolean>
  refreshWorkspaces: () => Promise<void>
  loading: boolean
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined)

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [activeWorkspace, setActiveWorkspaceState] = useState<Workspace | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const refreshWorkspaces = useCallback(async () => {
    const { data, error } = await supabase
      .from('workspaces')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching workspaces:', error)
      return
    }

    const workspaceList = (data || []) as Workspace[]
    setWorkspaces(workspaceList)

    // If no active workspace and there are workspaces, restore from localStorage or use first
    if (!activeWorkspace && workspaceList.length > 0) {
      const savedWorkspaceId = localStorage.getItem('activeWorkspaceId')
      const savedWorkspace = savedWorkspaceId
        ? workspaceList.find(w => w.id === savedWorkspaceId)
        : null

      if (savedWorkspace) {
        setActiveWorkspaceState(savedWorkspace)
      } else {
        setActiveWorkspaceState(workspaceList[0])
      }
    }
  }, [supabase, activeWorkspace])

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await refreshWorkspaces()
      setLoading(false)
    }
    init()
  }, [refreshWorkspaces])

  const setActiveWorkspace = (workspace: Workspace) => {
    setActiveWorkspaceState(workspace)
    // Persist to localStorage for session continuity
    localStorage.setItem('activeWorkspaceId', workspace.id)
  }

  const createWorkspace = async (name: string): Promise<Workspace | null> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('workspaces')
      .insert({ name, user_id: user.id } as { name: string; user_id: string })
      .select()
      .single()

    if (error) {
      console.error('Error creating workspace:', error)
      return null
    }

    const newWorkspace = data as Workspace
    await refreshWorkspaces()
    if (newWorkspace) {
      setActiveWorkspace(newWorkspace)
    }
    return newWorkspace
  }

  const deleteWorkspace = async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('workspaces')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting workspace:', error)
      return false
    }

    await refreshWorkspaces()

    // If we deleted the active workspace, switch to another
    if (activeWorkspace?.id === id) {
      const remaining = workspaces.filter(w => w.id !== id)
      if (remaining.length > 0) {
        setActiveWorkspace(remaining[0])
      } else {
        setActiveWorkspaceState(null)
      }
    }

    return true
  }

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        activeWorkspace,
        setActiveWorkspace,
        createWorkspace,
        deleteWorkspace,
        refreshWorkspaces,
        loading,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext)
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider')
  }
  return context
}
