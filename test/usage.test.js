const test = require("node:test");
const assert = require("node:assert");
const { contextOf, short } = require("../src/usage");
const asst = (usage, model = "claude-sonnet-5-5") => ({ type: "assistant", message: { model, usage } });

test("context is the newest assistant turn's prompt size", () => {
  const c = contextOf([{ type: "user" }, asst({ input_tokens: 10, cache_read_input_tokens: 90000, cache_creation_input_tokens: 10000, output_tokens: 5 }), asst({ input_tokens: 1 })]);
  assert.deepStrictEqual([c.tokens, c.limit, c.pct], [100010, 200000, 50]);
});
test("past 200k tokens the window must be the 1M one", () => {
  assert.strictEqual(contextOf([asst({ input_tokens: 400000 })]).pct, 40);
});
test("no usage means no meter", () => {
  assert.strictEqual(contextOf([]), null);
  assert.strictEqual(contextOf(null), null);
  assert.strictEqual(contextOf([asst({}), { type: "user" }]), null);
});
test("short token counts", () => {
  assert.deepStrictEqual([short(950), short(64000), short(1250000)], ["950", "64k", "1.3M"]);
});
