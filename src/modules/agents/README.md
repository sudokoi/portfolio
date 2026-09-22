# Agent access

Owns the public stateless `/mcp` handler with `get_profile`, `search`, `fetch` and `get_resume`. Reads the deployment snapshot and shares bounded text-search semantics with browser search. No model calls, private content or mutations.

The lightweight browser WebMCP adapter lives in `shared/components/WebMcpBridge.tsx`; it never imports this server/SDK module. Connection instructions are at `/agents`.
