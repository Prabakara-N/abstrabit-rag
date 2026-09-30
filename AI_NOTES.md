# AI Implementation Notes

## AI Tools & Models Used

**Primary Tool:** Claude Code CLI (Claude Opus 4.5)

- Used for architecture planning, code generation, debugging, and iterative development
- Approximately 80% of code was AI-generated, 20% was manual refinement and decision-making

**Work Split:**
| Task | AI Contribution | My Contribution |
|------|-----------------|-----------------|
| Database schema design | Generated initial SQL | Refined RLS policies, added hybrid search |
| React components | Generated boilerplate + UI | Styled, fixed layout issues, UX decisions |
| API routes | Generated CRUD logic | Added streaming, error handling |
| RAG pipeline | Generated chunking/retrieval | Chose chunking strategy, tuned thresholds |
| Tool calling | Generated Gemini integration | Designed tool schemas, validation logic |
| Debugging | Suggested fixes | Verified fixes, caught AI mistakes |

**AI Context Files:**

- `~/.claude/rules/*.md` - Personal coding standards (immutability, error handling, testing)
- `~/.claude/agents/` - Specialized agents for planning, code review, TDD
- Plan file with detailed implementation phases

---

## Key Decisions I Made (Not AI-Suggested)

### 1. Shared Chunks Table with Denormalized workspace_id

**Decision:** Store all chunks in a single table with `workspace_id` column, rather than separate tables per workspace or a join-based approach.

**Why I chose this:**

- The assessment specifically required proving isolation in a _shared_ vector store
- Denormalizing `workspace_id` into chunks avoids expensive JOIN during vector search
- The workspace filter is applied INSIDE the `match_chunks` RPC, not as a post-filter
- Single IVFFlat index serves all workspaces efficiently

**What AI suggested instead:** AI initially proposed joining through `documents` table for workspace filtering. I overrode this because it would be slower and not demonstrate true shared-store isolation.

### 2. Hybrid Search with Reciprocal Rank Fusion (RRF)

**Decision:** Implement both vector similarity AND keyword full-text search, combined via RRF.

**Why I chose this:**

- Pure vector search misses exact keyword matches (e.g., product codes, names)
- RRF doesn't require score normalization between methods
- PostgreSQL's built-in tsvector/GIN made keyword search easy to add
- Configurable weighting (70% vector, 30% keyword) allows tuning

**Implementation detail:** Created a stored function `match_chunks_hybrid` that does both searches in one query and fuses ranks.

### 3. Admin Client for Deletions (RLS Workaround)

**Decision:** Use the Supabase service role key for delete operations after verifying ownership with the user's session.

**Why I chose this:**

- RLS DELETE policies were silently failing (rows "deleted" in UI but persisted)
- Verified the issue was RLS policy complexity, not code logic
- Service role bypasses RLS, so I first verify ownership with the user's authenticated client, THEN delete with admin client
- This is a pragmatic production pattern when RLS policies are complex

---

## Hardest Bug / Wrong Turn from AI

### The Bug: Gemini SDK Embedding Response Type Mismatch

**What happened:**
AI generated embedding code using `response.embedding.values` based on what it "knew" about the Gemini SDK. This worked at runtime but threw TypeScript errors:

```typescript
// AI-generated code that caused TypeScript error:
if (response.embedding?.values) {
  // TS Error: Property 'embedding' does not exist
  return response.embedding.values;
}
```

**How I noticed:**
TypeScript compilation failed. The SDK types declared `embeddings` (plural, an array), but the runtime response sometimes had `embedding` (singular). AI kept "fixing" it by swapping between the two, creating a whack-a-mole situation.

**Root cause:**
The `@google/genai` SDK has inconsistent typing - the TypeScript types say `embeddings: EmbeddingContent[]` but the actual API response for single-content calls returns `embedding: EmbeddingContent`. This is a real SDK quirk.

**How I fixed it:**

```typescript
// My fix: Check the typed property first, then fall back with type assertion
if (response.embeddings?.[0]?.values) {
  return response.embeddings[0].values;
}
// Fallback for runtime variations (SDK type mismatch)
const anyResponse = response as unknown as { embedding?: { values: number[] } };
if (anyResponse.embedding?.values) {
  return anyResponse.embedding.values;
}
```

**Lesson learned:**
AI-generated code that works at runtime can still have type errors if the SDK's types don't match reality. Don't blindly trust AI fixes for type errors - read the actual SDK source or test both paths.

---

## What I'd Improve With More Time

1. **Re-ranking:** Add a cross-encoder model to re-rank retrieved chunks before sending to LLM
2. **Conversation Memory:** Persist chat context across sessions for follow-up questions
3. **Streaming Debug View:** Show which chunks are being retrieved in real-time during response generation
4. **Rate Limiting:** Add per-user rate limits on API routes to prevent abuse
5. **E2E Tests:** Playwright tests for critical flows (upload → chat → tool call)
6. **Multi-modal:** Process images embedded in documents

---

## Prompt Excerpt (Trickiest Part)

When implementing hybrid search, the AI initially generated a broken RRF implementation. Here's how I guided it:

**My prompt:**

> "The hybrid search isn't working. I think the issue is the RRF formula. Can you explain what RRF does and regenerate the function? The formula should be: score = sum(1 / (k + rank)) where k is typically 60."

**AI's response included:**

```sql
-- RRF score: combines rankings from both methods
(1.0 - keyword_weight) * COALESCE(1.0 / (rrf_k + v.vector_rank), 0) +
keyword_weight * COALESCE(1.0 / (rrf_k + k.keyword_rank), 0) AS combined_score
```

This was correct, but the AI had initially used raw similarity scores instead of ranks. The key insight was that RRF works on _rankings_ (1st, 2nd, 3rd...), not raw scores - which I had to explicitly point out.

---

## Verification Checklist

- [x] Auth: Sign up, log in, log out works
- [x] Workspaces: Create, switch, delete works
- [x] Upload: TXT files chunked and embedded
- [x] Idempotent: Re-upload shows "already exists"
- [x] RAG: Questions answered with citations
- [x] Isolation: Workspace A data not visible from B
- [x] "I don't know": Honest response for unknown topics
- [x] Tools: save_task and send_notification work
- [x] Logs: Tool calls logged with arguments and results
- [x] Streaming: Token-by-token response display
- [x] Hybrid Search: Vector + keyword fusion working
