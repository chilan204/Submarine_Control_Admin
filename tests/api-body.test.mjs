import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";
import { transformWithEsbuild } from "vite";

const source = await readFile(new URL("../src/app/lib/api.ts", import.meta.url), "utf8");
const { code } = await transformWithEsbuild(source, "api.ts", {
  format: "cjs", tsconfigRaw: {}, define: { "import.meta.env": '{"PROD":false}' },
});

function setup(response) {
  const module = { exports: {} };
  vm.runInNewContext(code, {
    module, exports: module.exports, Headers, FormData, AbortSignal, DOMException, SyntaxError, Event,
    sessionStorage: { getItem: () => "token", removeItem: () => {} },
    window: { dispatchEvent: () => {} }, fetch: async () => response,
  });
  return module.exports.apiFetch;
}

test("body timeout rejects rather than reporting mutation success", async () => {
  const apiFetch = setup({ ok: true, status: 200,
    headers: new Headers({ "content-type": "application/json" }),
    json: async () => { throw new DOMException("body timeout", "TimeoutError"); },
  });
  await assert.rejects(apiFetch("/api/roles", { method: "POST" }), error => error.status === 408);
});

test("malformed JSON rejects with an invalid-response error", async () => {
  const apiFetch = setup(new Response('{', { headers: { "content-type": "application/json" } }));
  await assert.rejects(apiFetch("/api/roles"), error => error.status === 502);
});

test("HTML success cannot masquerade as a JSON API success", async () => {
  const apiFetch = setup(new Response('<html/>', { headers: { "content-type": "text/html" } }));
  await assert.rejects(apiFetch("/api/roles"), error => error.status === 502);
});

test("null JSON is not a valid successful envelope", async () => {
  const apiFetch = setup(new Response('null', { headers: { "content-type": "application/json" } }));
  await assert.rejects(apiFetch("/api/roles"), error => error.status === 502);
});

test("204 remains valid for an endpoint without a response body", async () => {
  const apiFetch = setup(new Response(null, { status: 204 }));
  assert.equal(await apiFetch("/api/roles/1", { method: "DELETE" }), undefined);
});
