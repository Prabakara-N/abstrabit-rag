import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import { Bot, User, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface SharedMessage {
  role: 'user' | 'assistant'
  content: string
}

interface SharedChat {
  id: string
  share_key: string
  title: string | null
  messages: SharedMessage[]
  view_count: number
  created_at: string
}

export default async function SharedChatPage({
  params,
}: {
  params: Promise<{ key: string }>
}) {
  const { key } = await params
  const supabase = createAdminClient()

  // Get the shared chat
  const { data, error } = await supabase
    .from('shared_chats')
    .select('*')
    .eq('share_key', key)
    .single()

  if (error || !data) {
    notFound()
  }

  const sharedChat = data as unknown as SharedChat

  // Increment view count
  await supabase
    .from('shared_chats')
    .update({ view_count: (sharedChat.view_count || 0) + 1 })
    .eq('id', sharedChat.id)

  const messages = sharedChat.messages as SharedMessage[]

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b py-4 px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">{sharedChat.title || 'Shared Chat'}</h1>
            <p className="text-sm text-muted-foreground">
              Shared from Abstrabit RAG
            </p>
          </div>
          <Link href="/">
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              Try Abstrabit RAG
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto py-8 px-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Conversation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div
                  className={`rounded-lg p-4 max-w-[80%] ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <User className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>
            This conversation was shared using{' '}
            <Link href="/" className="text-primary hover:underline">
              Abstrabit RAG
            </Link>
          </p>
          <p className="mt-1">
            Views: {(sharedChat.view_count || 0) + 1}
          </p>
        </div>
      </main>
    </div>
  )
}
