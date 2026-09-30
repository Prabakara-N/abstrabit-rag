-- Shared chats table for public URL sharing
CREATE TABLE shared_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE NOT NULL,
  share_key TEXT UNIQUE NOT NULL,  -- Short unique key for URL
  title TEXT,
  messages JSONB NOT NULL,  -- Snapshot of messages at share time
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMPTZ,  -- Optional expiration
  view_count INT DEFAULT 0
);

-- Index for fast lookup by share key
CREATE INDEX shared_chats_share_key_idx ON shared_chats(share_key);

-- No RLS needed - shared chats are public by design
-- But we only allow authenticated users to create them
