import test from "node:test";
import assert from "node:assert/strict";
import { createSeedState } from "@/data/seed";
import { ServerAdapter } from "@/services/server-persistence";

test("server saves are serialized with the latest acknowledged revision", async () => {
  const state = createSeedState();
  const revisions: number[] = [];
  const originalFetch = globalThis.fetch;
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: { baseURI: "https://example.test/organizador/" },
  });
  globalThis.fetch = async (input, init) => {
    assert.equal(new URL(String(input)).pathname, "/organizador/api/index.php");
    if (init?.method === "PUT") {
      const body = JSON.parse(String(init.body));
      revisions.push(body.revision);
      return Response.json({ revision: body.revision + 1 });
    }
    return Response.json({ state, revision: 7 });
  };
  try {
    const adapter = new ServerAdapter();
    await adapter.load();
    await Promise.all([adapter.save(state), adapter.save({ ...state, onboarded: true })]);
    assert.deepEqual(revisions, [7, 8]);
  } finally {
    globalThis.fetch = originalFetch;
    Reflect.deleteProperty(globalThis, "document");
  }
});
test("a conflict blocks later writes instead of silently overwriting another device", async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: { baseURI: "https://example.test/" },
  });
  globalThis.fetch = async () => {
    calls++;
    return Response.json({ error: "Conflito" }, { status: 409 });
  };
  try {
    const adapter = new ServerAdapter();
    const state = createSeedState();
    await assert.rejects(adapter.save(state), /Conflito/);
    await assert.rejects(adapter.save(state), /outro dispositivo/);
    assert.equal(calls, 1);
  } finally {
    globalThis.fetch = originalFetch;
    Reflect.deleteProperty(globalThis, "document");
  }
});
