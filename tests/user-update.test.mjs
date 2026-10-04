import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";
import { transformWithEsbuild } from "vite";

const source = await readFile(new URL("../src/app/components/admin/user-management/user-update.ts", import.meta.url), "utf8");
const { code } = await transformWithEsbuild(source, "user-update.ts", { format: "cjs", tsconfigRaw: {} });
const module = { exports: {} };
vm.runInNewContext(code, { module, exports: module.exports });
const { buildUserUpdate } = module.exports;

test("edit sends the version captured when opening the form", () => {
  const openedUser = { id: "7", version: 4, roleCode: "ADMIN" };
  const currentServerUser = { ...openedUser, version: 5, roleCode: "OFFICER_1" };
  const payload = buildUserUpdate(openedUser, { name: "Updated name", roleCode: "ADMIN" });
  assert.equal(payload.version, 4);
  assert.notEqual(payload.version, currentServerUser.version);
});

test("blank password is omitted without dropping version zero", () => {
  const payload = buildUserUpdate({ version: 0 }, { name: "Officer", password: "  " });
  assert.equal(payload.version, 0);
  assert.equal(Object.hasOwn(payload, "password"), false);
});

test("explicit password reset retains the original version", () => {
  const payload = buildUserUpdate({ version: 3 }, { password: "new-password" });
  assert.equal(payload.version, 3);
  assert.equal(payload.password, "new-password");
});
