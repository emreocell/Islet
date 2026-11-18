const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { loadLinks, saveLinks, clean } = require("../src/links");
const { lanAddress, safeName, freePath } = require("../src/phone-drop");

test("links keep only http(s) and name them after the host", () => {
  assert.deepStrictEqual(clean({ url: "https://www.github.com/x" }), { title: "github.com", url: "https://www.github.com/x" });
  assert.strictEqual(clean({ url: "javascript:alert(1)" }), null);
  assert.strictEqual(clean({ url: "file:///C:/x" }), null);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "links-"));
  saveLinks(dir, [{ url: "https://a.com" }, { url: "nope" }]);
  assert.deepStrictEqual(loadLinks(dir), [{ title: "a.com", url: "https://a.com/" }]);
});

test("phone drop picks a private LAN address and safe file names", () => {
  const ifaces = { lo: [{ family: "IPv4", internal: true, address: "127.0.0.1" }], vpn: [{ family: "IPv4", internal: false, address: "8.8.8.8" }], wifi: [{ family: "IPv4", internal: false, address: "192.168.1.20" }] };
  assert.strictEqual(lanAddress(ifaces), "192.168.1.20");
  assert.strictEqual(lanAddress({}), "");
  assert.strictEqual(safeName("../../evil.exe"), "evil.exe");
  assert.strictEqual(safeName('a<b>:"c".txt'), "a_b___c_.txt");
  assert.strictEqual(safeName(".."), "file");
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "drop-"));
  fs.writeFileSync(path.join(dir, "a.txt"), "");
  assert.strictEqual(path.basename(freePath(dir, "a.txt")), "a (2).txt");
});

test("links: a failed save throws and keeps the stored list", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "islet-links-"));
  saveLinks(dir, [{ url: "https://a.com" }]);
  fs.mkdirSync(path.join(dir, "links.json.tmp"));
  assert.throws(() => saveLinks(dir, [{ url: "https://b.com" }]));
  assert.deepStrictEqual(loadLinks(dir).map(l => l.url), ["https://a.com/"]);
});
