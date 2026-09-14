import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createSeedState } from "@/data/seed";
const origin = "http://127.0.0.1:5183/api/index.php";
let cookie = "",
  csrf = "";
let checks = 0;
async function request(action, method = "GET", body, token = csrf) {
  const response = await fetch(origin + "?action=" + action, {
    method,
    headers: { "Content-Type": "application/json", "X-CSRF-Token": token, Cookie: cookie },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  for (const value of response.headers.getSetCookie())
    if (value.startsWith("DAILYFLOWSESSID=")) cookie = value.split(";")[0];
  const data = await response.json();
  if (data.csrf) csrf = data.csrf;
  return { status: response.status, data };
}
function check(value, expected, label) {
  assert.equal(value, expected, label);
  console.log("PASS " + label);
  checks++;
}
let response = await request("session");
check(response.status, 200, "session endpoint");
check(response.data.authenticated, false, "anonymous session");
check((await request("state")).status, 401, "private data requires authentication");
check((await request("setup", "POST", {}, "")).status, 403, "CSRF token is mandatory");
const credentials = {
  email: "integration@example.test",
  password: "Integration-Only!2026",
  name: "Conta de teste",
  setupKey: readFileSync(".test-runtime/setup-key.txt", "utf8"),
};
response = await request("setup", "POST", credentials);
check(response.status, 201, "first account setup");
check(response.data.authenticated, true, "setup signs in securely");
check(
  (await request("setup", "POST", credentials)).status,
  409,
  "second public account is blocked",
);
response = await request("state");
check(response.data.revision, 0, "initial workspace has no data");
const state = createSeedState();
state.onboarded = true;
state.profile.name = "Conta de teste";
response = await request("state", "PUT", { state, revision: 0 });
check(response.data.revision, 1, "workspace saved in SQL");
state.notes[0].content = "Persistência real de página no MySQL — teste";
response = await request("state", "PUT", { state, revision: 1 });
check(response.data.revision, 2, "next save increments revision");
check(
  (await request("state", "PUT", { state, revision: 1 })).status,
  409,
  "stale device cannot overwrite newer changes",
);
check(
  (await request("state", "PUT", { state: { version: 1 }, revision: 2 })).status,
  422,
  "malformed workspace is rejected",
);
response = await request("state");
check(
  response.data.state.notes[0].content,
  state.notes[0].content,
  "stored note survives subsequent requests",
);
await request("logout", "POST", {});
check((await request("state")).status, 401, "logout removes data access");
await request("session");
check(
  (await request("login", "POST", { email: credentials.email, password: "incorrect" })).status,
  401,
  "wrong password rejected",
);
response = await request("login", "POST", credentials);
check(response.status, 200, "password login works");
response = await request("state");
check(response.data.revision, 2, "SQL workspace restored after a new login");
for (let i = 0; i < 10; i++)
  response = await request("login", "POST", { email: credentials.email, password: "incorrect" });
check(response.status, 429, "login attempts rate-limited");
console.log(`${checks} API checks passed against PHP and MariaDB.`);
