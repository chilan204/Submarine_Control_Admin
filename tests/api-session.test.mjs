import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";
import { transformWithEsbuild } from "vite";

const source = await readFile(new URL("../src/app/lib/api.ts", import.meta.url), "utf8");
const { code } = await transformWithEsbuild(source, "api.ts", {
  format: "cjs",
  tsconfigRaw: {},
  define: { "import.meta.env": '{"PROD":false}' },
});

function setup() {
  const storage = new Map([["token", "session-a"], ["user", "user-a"]]);
  const events = [];
  let finish;
  let sentAuthorization;
  const module = { exports: {} };
  vm.runInNewContext(code, {
    module, exports: module.exports, Headers, FormData, AbortSignal, DOMException, Event,
    sessionStorage: {
      getItem: key => storage.get(key) ?? null,
      removeItem: key => storage.delete(key),
    },
    window: { dispatchEvent: event => events.push(event.type) },
    fetch: (_url, options) => {
      sentAuthorization = options.headers.get("Authorization");
      return new Promise(resolve => { finish = resolve; });
    },
  });
  return {
    api: module.exports, storage, events,
    respond: status => finish(new Response('{}', {
      status, headers: { "content-type": "application/json" },
    })),
    authorization: () => sentAuthorization,
  };
}

for (const status of [401, 403]) {
  test(`late ${status} from session A preserves session B`, async () => {
    const fixture = setup();
    const pending = fixture.api.apiFetch("/api/user");
    assert.equal(fixture.authorization(), "Bearer session-a");
    fixture.storage.set("token", "session-b");
    fixture.storage.set("user", "user-b");
    fixture.respond(status);
    await assert.rejects(pending, error => error.status === status);
    assert.equal(fixture.storage.get("token"), "session-b");
    assert.equal(fixture.storage.get("user"), "user-b");
    assert.deepEqual(fixture.events, []);
  });

  test(`${status} still expires its own current session`, async () => {
    const fixture = setup();
    const pending = fixture.api.apiFetch("/api/user");
    fixture.respond(status);
    await assert.rejects(pending, error => error.status === status);
    assert.equal(fixture.storage.has("token"), false);
    assert.equal(fixture.storage.has("user"), false);
    assert.deepEqual(fixture.events, ["auth:expired"]);
  });
}

test("delayed logout cleanup cannot expire a new login", () => {
  const fixture = setup();
  fixture.storage.set("token", "session-b");
  fixture.api.expireSession("session-a");
  assert.equal(fixture.storage.get("token"), "session-b");
  assert.deepEqual(fixture.events, []);
});

test("explicit unconditional expiry still clears local authentication", () => {
  const fixture = setup();
  fixture.api.expireSession();
  assert.equal(fixture.storage.has("token"), false);
  assert.deepEqual(fixture.events, ["auth:expired"]);
});
