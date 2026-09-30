'use client'

import { useState } from 'react'
import { Check, ChevronsUpDown, Plus, Trash2 } from 'lucide-react'
import { useWorkspace } from './workspace-context'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { toast } from 'sonner'

export function WorkspaceSwitcher() {
  const { workspaces, activeWorkspace, setActiveWorkspace, createWorkspace, deleteWorkspace, loading } = useWorkspace()
  const { isMobile } = useSidebar()
  const confirm = useConfirm()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newWorkspaceName, setNewWorkspaceName] = useState('')
  const [creating, setCreating] = useState(false)

  const handleCreate = async () => {
    if (!newWorkspaceName.trim()) return

    setCreating(true)
    const workspace = await createWorkspace(newWorkspaceName.trim())
    setCreating(false)

    if (workspace) {
      toast.success('Workspace created')
      setCreateDialogOpen(false)
      setNewWorkspaceName('')
    } else {
      toast.error('Failed to create workspace')
    }
  }

  const handleDelete = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation()

    const confirmed = await confirm({
      title: 'Delete Workspace',
      description: `Are you sure you want to delete "${name}"? This will permanently delete all documents, chat history, and tasks in this workspace.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive',
    })

    if (!confirmed) return

    const success = await deleteWorkspace(id)
    if (success) {
      toast.success('Workspace deleted')
    } else {
      toast.error('Failed to delete workspace')
    }
  }

  if (loading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <div className="flex items-center gap-2 rounded-lg p-2">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-muted animate-pulse" />
            <div className="flex flex-col gap-1">
              <span className="h-4 w-20 bg-muted animate-pulse rounded" />
              <span className="h-3 w-14 bg-muted animate-pulse rounded" />
            </div>
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger
              className="w-full flex items-center gap-2 rounded-lg p-2 text-left text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  {activeWorkspace?.name?.charAt(0)?.toUpperCase() || 'W'}
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {activeWorkspace?.name || 'Select workspace'}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {workspaces.length} workspace{workspaces.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              align="start"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              {workspaces.map((workspace) => (
                <DropdownMenuItem
                  key={workspace.id}
                  onClick={() => setActiveWorkspace(workspace)}
                  className="gap-2 p-2"
                >
                  <div className="flex size-6 items-center justify-center rounded-sm border bg-background">
                    {workspace.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="flex-1">{workspace.name}</span>
                  {workspace.id === activeWorkspace?.id && (
                    <Check className="size-4" />
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={(e) => handleDelete(e, workspace.id, workspace.name)}
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </DropdownMenuItem>
              ))}
              {workspaces.length === 0 && (
                <DropdownMenuItem disabled className="text-muted-foreground">
                  No workspaces yet
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setCreateDialogOpen(true)} className="gap-2 p-2">
                <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                  <Plus className="size-4" />
                </div>
                <span className="font-medium text-muted-foreground">New Workspace</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Workspace</DialogTitle>
            <DialogDescription>
              Create a new workspace to organize your documents and chats.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Workspace Name</Label>
              <Input
                id="name"
                placeholder="My Workspace"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={creating || !newWorkspaceName.trim()}>
              {creating ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
