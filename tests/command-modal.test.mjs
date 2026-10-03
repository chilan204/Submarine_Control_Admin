import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";
import { transformWithEsbuild } from "vite";

const source = await readFile(new URL("../src/app/components/admin/command-config/CommandModal.tsx", import.meta.url), "utf8");
const { code } = await transformWithEsbuild(source, "CommandModal.tsx", {
  format: "cjs", tsconfigRaw: { compilerOptions: { jsx: "react-jsx" } },
});

function setup(onSave) {
  const module = { exports: {} };
  const states = [];
  const jsx = (type, props) => ({ type, props });
  vm.runInNewContext(code, {
    module, exports: module.exports,
    require: name => {
      if (name === "react") return {
        useState: initial => [initial, value => states.push(value)],
        useRef: initial => ({ current: initial }),
      };
      if (name === "react/jsx-runtime") return { jsx, jsxs: jsx };
      if (name === "motion/react") return { motion: { div: "div" } };
      if (name === "lucide-react") return { X: "icon" };
      throw new Error(`Unexpected import ${name}`);
    },
  });
  let closed = 0;
  const tree = module.exports.CommandModal({ mode: "edit", cmd: {
    keyword: "tiến", action: "MOVE", direction: "FORWARD", hasValue: false, active: true,
  }, onSave, onClose: () => { closed++; } });
  function collect(node) {
    if (!node || typeof node !== "object") return [];
    return [node, ...[node.props?.children].flat().flatMap(collect)];
  }
  const buttons = collect(tree).filter(node => node.type === "button");
  return { submit: buttons.at(-1).props.onClick, close: buttons[0].props.onClick,
    closed: () => closed, states };
}

test("rapid save clicks run one mutation and cannot close the pending form", async () => {
  let resolve;
  let calls = 0;
  const fixture = setup(() => { calls++; return new Promise(done => { resolve = done; }); });
  const first = fixture.submit();
  await fixture.submit();
  fixture.close();
  assert.equal(calls, 1);
  assert.equal(fixture.closed(), 0);
  resolve();
  await first;
  fixture.close();
  assert.equal(fixture.closed(), 1);
});

test("failed save releases the synchronous submission guard", async () => {
  let calls = 0;
  const fixture = setup(async () => { calls++; throw new Error("unavailable"); });
  await fixture.submit();
  await fixture.submit();
  assert.equal(calls, 2);
  assert.ok(fixture.states.some(value => typeof value === "string" && value.includes("Không thể lưu")));
});
