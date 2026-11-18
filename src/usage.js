// How full a Claude Code session's context window is, from the newest assistant entry of its
// transcript (entries are newest first). The last turn's prompt size is the context in use:
// fresh input + cache reads + cache writes.
function contextOf(entries) {
  for (const e of entries || []) {
    const u = e?.type === "assistant" && e.message?.usage;
    if (!u) continue;
    const num = v => (Number.isFinite(v) ? v : 0);
    const tokens = num(u.input_tokens) + num(u.cache_read_input_tokens) + num(u.cache_creation_input_tokens);
    if (!tokens) continue;
    const model = String(e.message.model || "");
    // a transcript doesn't say which window the session has; past 200k it can only be the 1M one
    const limit = tokens > 200000 || /1m/i.test(model) ? 1000000 : 200000;
    return { tokens, limit, pct: Math.min(100, Math.round((tokens / limit) * 100)), model };
  }
  return null;
}
function short(n) { return n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${Math.round(n / 1e3)}k` : String(n); }
module.exports = { contextOf, short };
