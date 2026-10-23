import test from "node:test";
import assert from "node:assert/strict";
import { createDemoApi, DEMO_STORAGE_KEY, makeToken } from "../src/demo/api.js";
const setup = () => {
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key) || null,
    setItem: (key, value) => values.set(key, value),
  };
  const api = createDemoApi(storage);
  const send = (path = "", method = "GET", body, signedIn = true) =>
    api.fetch(`/demo-api/v3/boards${path}`, {
      method,
      headers: signedIn ? { Authorization: `Bearer ${makeToken()}` } : {},
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
  return { api, send, storage };
};
test("demo credentials return a compatible token; invalid credentials fail locally", async () => {
  const { api } = setup();
  assert.equal(
    (
      await api.fetch("/demo-api/login", {
        method: "POST",
        body: JSON.stringify({ userName: "demo", password: "bad" }),
      })
    ).status,
    401
  );
  const data = await (
    await api.fetch("/demo-api/login", {
      method: "POST",
      body: JSON.stringify({ userName: "demo", password: "demo" }),
    })
  ).json();
  assert.ok(data.access_token);
  assert.ok(data.refresh_token);
  const claims = JSON.parse(atob(data.access_token.split(".")[1]));
  assert.equal(claims.oid, "demo-user");
});
test("boards are grouped into personal, write collaboration, and read collaboration", async () => {
  const { send } = setup();
  const boards = await (await send()).json();
  assert.equal(boards.personal_boards.length, 2);
  assert.equal(boards.collaborative_boards.length, 2);
  assert.equal(boards.collaborative_boards[0].accessRight, "WRITE");
  assert.equal(boards.collaborative_boards[1].accessRight, "READ");
});
test("anonymous users can read public boards but cannot view private boards or write", async () => {
  const { send } = setup();
  assert.equal(
    (await send("/demo-board", "GET", undefined, false)).status,
    401
  );
  assert.equal(
    (await send("/public-demo/tasks", "GET", undefined, false)).status,
    200
  );
  assert.equal(
    (await send("/public-demo/tasks", "POST", { title: "No" }, false)).status,
    401
  );
});
test("read collaborators cannot mutate and write collaborators cannot change ownership settings", async () => {
  const { send } = setup();
  assert.equal(
    (await send("/team-read/tasks", "POST", { title: "No", status: { id: 1 } }))
      .status,
    403
  );
  assert.equal(
    (
      await send("/team-write/tasks", "POST", {
        title: "Allowed",
        status: { id: 1 },
      })
    ).status,
    201
  );
  assert.equal(
    (await send("/team-write", "PATCH", { visibility: "PUBLIC" })).status,
    403
  );
});
test("task CRUD uses the original nested status and timestamp contract", async () => {
  const { send } = setup();
  const task = await (
    await send("/demo-board/tasks", "POST", {
      title: " New task ",
      description: null,
      assignees: null,
      status: { id: 2 },
    })
  ).json();
  assert.equal(task.title, "New task");
  assert.equal(task.status.name, "To Do");
  assert.ok(task.created_on);
  assert.equal(
    (
      await send(`/demo-board/tasks/${task.id}`, "PUT", {
        title: "Edited",
        status: { id: 3 },
      })
    ).status,
    200
  );
  assert.equal(
    (await (await send(`/demo-board/tasks/${task.id}`)).json()).status.name,
    "Doing"
  );
  assert.equal(
    (await send(`/demo-board/tasks/${task.id}`, "DELETE")).status,
    204
  );
  assert.equal((await send(`/demo-board/tasks/${task.id}`)).status, 404);
});
test("status deletion transfers only the current board tasks; protected statuses cannot be removed", async () => {
  const { send } = setup();
  assert.equal((await send("/demo-board/statuses/2", "DELETE")).status, 409);
  assert.equal((await send("/demo-board/statuses/2/3", "DELETE")).status, 204);
  const tasks = await (await send("/demo-board/tasks")).json();
  assert.equal(tasks[1].status.id, 3);
  const other = await (await send("/public-demo/tasks")).json();
  assert.equal(other[1].status.id, 2);
  assert.equal((await send("/demo-board/statuses/1", "DELETE")).status, 400);
  assert.equal(
    (await send("/demo-board/statuses/4", "PUT", { name: "Changed" })).status,
    400
  );
});
test("status creation rejects duplicate names and updates task status names consistently", async () => {
  const { send } = setup();
  assert.equal(
    (await send("/demo-board/statuses", "POST", { name: " to do " })).status,
    409
  );
  const created = await (
    await send("/demo-board/statuses", "POST", {
      name: "Review",
      description: null,
    })
  ).json();
  assert.equal(created.name, "Review");
  await send("/demo-board/statuses/3", "PUT", {
    name: "In progress",
    description: "Updated",
  });
  assert.equal(
    (await (await send("/demo-board/tasks/3")).json()).status.name,
    "In progress"
  );
});
test("collaborators can be added, updated, removed and can leave a shared board", async () => {
  const { send } = setup();
  const added = await (
    await send("/demo-board/collabs", "POST", {
      email: "test@example.com",
      accessRight: "READ",
    })
  ).json();
  assert.equal(added.email, "test@example.com");
  assert.equal(
    (
      await send("/demo-board/collabs", "POST", {
        email: "TEST@example.com",
        accessRight: "WRITE",
      })
    ).status,
    409
  );
  assert.equal(
    (
      await send(`/demo-board/collabs/${added.oid}`, "PATCH", {
        accessRight: "WRITE",
      })
    ).status,
    200
  );
  assert.equal(
    (await send(`/demo-board/collabs/${added.oid}`, "DELETE")).status,
    204
  );
  assert.equal(
    (await send("/team-write/collabs/demo-user", "DELETE")).status,
    204
  );
  assert.equal((await (await send()).json()).collaborative_boards.length, 1);
});
test("board deletion cascades only its own records and data survives adapter recreation", async () => {
  const { send, storage } = setup();
  const created = await (
    await send("", "POST", { name: "New board", visibility: "private" })
  ).json();
  assert.equal(created.visibility, "PRIVATE");
  assert.equal(
    (await (await send(`/${created.id}/statuses`)).json()).length,
    4
  );
  await send("/demo-board", "DELETE");
  const restored = createDemoApi(storage).snapshot();
  assert.equal(
    restored.boards.some((b) => b.id === "demo-board"),
    false
  );
  for (const key of ["statuses", "tasks", "collabs"])
    assert.equal(
      restored[key].some((item) => item.boardId === "demo-board"),
      false
    );
  assert.equal(
    restored.boards.some((b) => b.id === created.id),
    true
  );
  assert.ok(storage.getItem(DEMO_STORAGE_KEY));
});
test("corrupt or blocked storage recovers and unsupported URLs never fall through to the network", async () => {
  let warning = "";
  const broken = createDemoApi(
    { getItem: () => "{bad json", setItem: () => {} },
    (message) => {
      warning = message;
    }
  );
  assert.ok(warning);
  assert.equal(broken.snapshot().boards.length, 4);
  const blocked = createDemoApi(
    {
      getItem: () => null,
      setItem: () => {
        throw new Error("blocked");
      },
    },
    (message) => {
      warning = message;
    }
  );
  const response = await blocked.fetch("/demo-api/v3/boards", {
    method: "POST",
    headers: { Authorization: `Bearer ${makeToken()}` },
    body: JSON.stringify({ name: "Memory only" }),
  });
  assert.equal(response.status, 201);
  assert.ok(warning.includes("รีเฟรช"));
  assert.equal(
    (await blocked.fetch("https://example.com/not-an-api")).status,
    404
  );
});
