import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";
import { transformWithEsbuild } from "vite";

const source = await readFile(new URL("../src/app/components/admin/role-management/priority.ts", import.meta.url), "utf8");
const { code } = await transformWithEsbuild(source, "priority.ts", { format: "cjs", tsconfigRaw: {} });
const module = { exports: {} };
vm.runInNewContext(code, { module, exports: module.exports });
const { countHighestPriorityRoles } = module.exports;

test("highest priority follows the server's largest-value rule including ties", () => {
  const roles = [1, 8, 8, 3].map((priority, id) => ({ id: String(id), code: `ROLE_${id}`, priority }));
  assert.equal(countHighestPriorityRoles(roles), 2);
  assert.equal(countHighestPriorityRoles([]), 0);
});
