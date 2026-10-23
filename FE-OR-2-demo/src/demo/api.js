// Local adapter for the original frontend's fetch/Response contract.
// This module never calls window.fetch or contacts an API server.
export const DEMO_STORAGE_KEY = "itbkk-fe-or2-demo-v1";
export const DEMO_TOKEN_KEY = "itbkk-demo-jwtToken";
export const DEMO_REFRESH_KEY = "itbkk-demo-refreshToken";
export const DEMO_USER = {
  oid: "demo-user",
  name: "Demo User",
  email: "demo@example.com",
};
const clone = (value) => JSON.parse(JSON.stringify(value));
const defaults = () => [
  {
    id: 1,
    name: "No Status",
    description: "A task that has not been assigned a status.",
  },
  { id: 2, name: "To Do", description: "A task that is ready to start." },
  { id: 3, name: "Doing", description: "A task currently in progress." },
  { id: 4, name: "Done", description: "A completed task." },
];
export function seedData() {
  const teamOwner = {
    oid: "team-owner",
    name: "Project Team",
    email: "team@example.com",
  };
  const now = new Date().toISOString();
  const boards = [
    {
      id: "demo-board",
      name: "Demo User's Personal Board",
      visibility: "PRIVATE",
      owner: { ...DEMO_USER },
    },
    {
      id: "public-demo",
      name: "Public Demo Board",
      visibility: "PUBLIC",
      owner: { ...DEMO_USER },
    },
    {
      id: "team-write",
      name: "Team Project (WRITE)",
      visibility: "PRIVATE",
      owner: teamOwner,
    },
    {
      id: "team-read",
      name: "Team Reference (READ)",
      visibility: "PUBLIC",
      owner: teamOwner,
    },
  ];
  const examples = [
    [
      "ทดลองดูรายละเอียดงาน",
      "คลิกชื่องานเพื่อดูรายละเอียด และใช้ปุ่ม Edit เพื่อแก้ไขข้อมูล",
      "Demo User",
      1,
    ],
    [
      "ออกแบบหน้าเว็บไซต์",
      "ตัวอย่างงานที่พร้อมเริ่ม สามารถแก้ไขชื่อ รายละเอียด ผู้รับผิดชอบ และสถานะได้",
      "Natthamon",
      2,
    ],
    [
      "พัฒนา Frontend",
      "ข้อมูลใน demo นี้บันทึกในเบราว์เซอร์ ไม่ต้องใช้ Backend หรือ Database",
      "Ratikorn",
      3,
    ],
    ["เตรียมข้อมูลตัวอย่าง", "งานตัวอย่างที่ทำเสร็จแล้ว", "Anawat", 4],
  ];
  let taskId = 0;
  return {
    version: 1,
    boards,
    statuses: boards.flatMap((b) =>
      defaults().map((s) => ({ ...s, boardId: b.id }))
    ),
    tasks: boards.flatMap((b) =>
      examples.map((t) => ({
        id: ++taskId,
        boardId: b.id,
        title: t[0],
        description: t[1],
        assignees: t[2],
        statusId: t[3],
        created_on: now,
        updated_on: now,
      }))
    ),
    collabs: [
      {
        id: 1,
        boardId: "demo-board",
        oid: "demo-colleague",
        name: "Demo Colleague",
        email: "colleague@example.com",
        accessRight: "READ",
      },
      { id: 2, boardId: "team-write", ...DEMO_USER, accessRight: "WRITE" },
      { id: 3, boardId: "team-read", ...DEMO_USER, accessRight: "READ" },
    ],
    nextTaskId: taskId + 1,
    nextCollabId: 4,
    nextBoardId: 1,
  };
}
function validData(v) {
  return (
    v?.version === 1 &&
    Array.isArray(v.boards) &&
    Array.isArray(v.statuses) &&
    Array.isArray(v.tasks) &&
    Array.isArray(v.collabs) &&
    v.boards.every(
      (b) =>
        b &&
        typeof b.id === "string" &&
        typeof b.name === "string" &&
        typeof b.owner?.oid === "string" &&
        ["PRIVATE", "PUBLIC"].includes(b.visibility)
    ) &&
    v.statuses.every(
      (s) =>
        s &&
        Number.isInteger(s.id) &&
        typeof s.name === "string" &&
        (s.description === null || typeof s.description === "string") &&
        v.boards.some((b) => b.id === s.boardId)
    ) &&
    v.boards.every(
      (b) =>
        v.statuses.some((s) => s.boardId === b.id && s.name === "No Status") &&
        v.statuses.some((s) => s.boardId === b.id && s.name === "Done")
    ) &&
    v.tasks.every(
      (t) =>
        t &&
        Number.isInteger(t.id) &&
        typeof t.title === "string" &&
        v.statuses.some((s) => s.boardId === t.boardId && s.id === t.statusId)
    ) &&
    v.collabs.every(
      (c) =>
        c &&
        typeof c.oid === "string" &&
        typeof c.name === "string" &&
        typeof c.email === "string" &&
        ["READ", "WRITE"].includes(c.accessRight) &&
        v.boards.some((b) => b.id === c.boardId)
    ) &&
    ["nextTaskId", "nextCollabId", "nextBoardId"].every(
      (key) => Number.isInteger(v[key]) && v[key] > 0
    )
  );
}
const reply = (value, status = 200) =>
  new Response(status === 204 ? null : JSON.stringify(value), {
    status,
    headers: { "Content-Type": "application/json" },
  });
const failure = (status, message) => reply({ status, message }, status);
export function makeToken(refresh = false) {
  const encode = (value) =>
    btoa(JSON.stringify(value))
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
  return `${encode({ alg: "none", typ: "JWT" })}.${encode({
    ...DEMO_USER,
    sub: "demo",
    exp: Math.floor(Date.now() / 1000) + (refresh ? 604800 : 86400),
    demo: true,
    refresh,
  })}.demo`;
}
function identity(options) {
  try {
    const raw = new Headers(options.headers)
      .get("Authorization")
      ?.replace(/^Bearer\s+/i, "");
    const payload = JSON.parse(
      atob(raw.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
    );
    return payload.demo === true &&
      payload.oid === DEMO_USER.oid &&
      payload.exp > Date.now() / 1000
      ? DEMO_USER
      : null;
  } catch {
    return null;
  }
}
export function createDemoApi(storage, onWarning = () => {}) {
  let state = seedData();
  try {
    const saved = storage?.getItem(DEMO_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!validData(parsed)) throw new Error("Invalid demo data");
      state = parsed;
    }
  } catch {
    onWarning("อ่านข้อมูลจำลองไม่ได้ จึงเปิดข้อมูลตัวอย่างเริ่มต้น");
  }
  const persist = () => {
    try {
      storage.setItem(DEMO_STORAGE_KEY, JSON.stringify(state));
    } catch {
      onWarning(
        "เบราว์เซอร์บันทึกข้อมูลไม่ได้ ข้อมูลรอบนี้จะหายเมื่อรีเฟรชหน้า"
      );
    }
  };
  const boardResult = (board, user) => ({
    ...board,
    accessRight:
      board.owner.oid === user?.oid
        ? "WRITE"
        : state.collabs.find(
            (c) => c.boardId === board.id && c.oid === user?.oid
          )?.accessRight || null,
  });
  const statusResult = (s) => ({
    id: s.id,
    name: s.name,
    description: s.description,
  });
  const taskResult = (t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    assignees: t.assignees,
    status: statusResult(
      state.statuses.find((s) => s.boardId === t.boardId && s.id === t.statusId)
    ),
    created_on: t.created_on,
    updated_on: t.updated_on,
  });
  const commit = (result, code = 200) => {
    persist();
    return reply(result, code);
  };
  async function fetchLocal(input, options = {}) {
    let body;
    try {
      body = options.body ? JSON.parse(options.body) : {};
    } catch {
      return failure(400, "Invalid request data.");
    }
    const url = new URL(String(input), "http://demo.local");
    const method = (options.method || "GET").toUpperCase();
    const user = identity(options);
    if (url.pathname === "/demo-api/login" && method === "POST") {
      if (body.userName !== "demo" || body.password !== "demo")
        return failure(401, "Use demo / demo to sign in to this simulation.");
      return reply({
        access_token: makeToken(),
        refresh_token: makeToken(true),
      });
    }
    if (url.pathname === "/demo-api/refresh" && method === "POST")
      return user
        ? reply({ access_token: makeToken(), refresh_token: makeToken(true) })
        : failure(401, "Please sign in again.");
    const match = url.pathname.match(
      /^\/demo-api\/v3\/boards(?:\/([^/]+))?(?:\/(tasks|statuses|collabs))?(?:\/([^/]+))?(?:\/([^/]+))?\/?$/
    );
    if (!match) return failure(404, "Demo endpoint not found.");
    const [, boardId, resource, itemId, targetId] = match;
    if (!boardId) {
      if (!user) return failure(401, "Please sign in.");
      if (method === "GET")
        return reply({
          personal_boards: state.boards
            .filter((b) => b.owner.oid === user.oid)
            .map((b) => boardResult(b, user)),
          collaborative_boards: state.boards
            .filter(
              (b) =>
                b.owner.oid !== user.oid &&
                state.collabs.some(
                  (c) => c.boardId === b.id && c.oid === user.oid
                )
            )
            .map((b) => boardResult(b, user)),
        });
      if (method === "POST") {
        const name = typeof body.name === "string" ? body.name.trim() : "";
        if (!name || name.length > 120)
          return failure(400, "Board name must contain 1–120 characters.");
        const board = {
          id: `local-${state.nextBoardId++}`,
          name,
          visibility:
            String(body.visibility).toUpperCase() === "PUBLIC"
              ? "PUBLIC"
              : "PRIVATE",
          owner: { ...user },
        };
        state.boards.push(board);
        state.statuses.push(
          ...defaults().map((s) => ({ ...s, boardId: board.id }))
        );
        return commit(boardResult(board, user), 201);
      }
      return failure(405, "Method not supported.");
    }
    const board = state.boards.find((b) => b.id === boardId);
    if (!board) return failure(404, "Board not found.");
    const owner = user?.oid === board.owner.oid;
    const collaborator = state.collabs.find(
      (c) => c.boardId === boardId && c.oid === user?.oid
    );
    if (board.visibility === "PRIVATE" && !owner && !collaborator)
      return failure(user ? 403 : 401, "This board is private.");
    if (method !== "GET") {
      if (!user) return failure(401, "Please sign in.");
      const leaving =
        resource === "collabs" && method === "DELETE" && itemId === user.oid;
      const allowed =
        resource === "collabs"
          ? owner || leaving
          : resource
          ? owner || collaborator?.accessRight === "WRITE"
          : owner;
      if (!allowed)
        return failure(
          403,
          "You do not have permission to perform this action."
        );
    }
    if (!resource) {
      if (method === "GET") return reply(boardResult(board, user));
      if (method === "PATCH") {
        if (!["PUBLIC", "PRIVATE"].includes(body.visibility))
          return failure(400, "Invalid board visibility.");
        board.visibility = body.visibility;
        return commit(boardResult(board, user));
      }
      if (method === "DELETE") {
        state.boards = state.boards.filter((b) => b.id !== boardId);
        for (const key of ["tasks", "statuses", "collabs"])
          state[key] = state[key].filter((item) => item.boardId !== boardId);
        return commit(null, 204);
      }
    }
    if (resource === "tasks") {
      const task = state.tasks.find(
        (t) => t.boardId === boardId && t.id === Number(itemId)
      );
      if (itemId && !task) return failure(404, "Task not found.");
      if (method === "GET")
        return reply(
          itemId
            ? taskResult(task)
            : state.tasks.filter((t) => t.boardId === boardId).map(taskResult)
        );
      if ((!itemId && method === "POST") || (itemId && method === "PUT")) {
        const title = typeof body.title === "string" ? body.title.trim() : "";
        const description =
          typeof body.description === "string"
            ? body.description.trim() || null
            : null;
        const assignees =
          typeof body.assignees === "string"
            ? body.assignees.trim() || null
            : null;
        if (
          !title ||
          title.length > 100 ||
          description?.length > 500 ||
          assignees?.length > 30
        )
          return failure(
            400,
            "Check the task title, description, and assignees lengths."
          );
        const status = state.statuses.find(
          (s) => s.boardId === boardId && s.id === Number(body.status?.id)
        );
        if (!status) return failure(400, "Task status not found.");
        const changes = {
          title,
          description,
          assignees,
          statusId: status.id,
          updated_on: new Date().toISOString(),
        };
        if (task) Object.assign(task, changes);
        else
          state.tasks.push({
            ...changes,
            id: state.nextTaskId++,
            boardId,
            created_on: changes.updated_on,
          });
        return commit(taskResult(task || state.tasks.at(-1)), task ? 200 : 201);
      }
      if (method === "DELETE" && task) {
        state.tasks = state.tasks.filter((t) => t !== task);
        return commit(null, 204);
      }
    }
    if (resource === "statuses") {
      const status = state.statuses.find(
        (s) => s.boardId === boardId && s.id === Number(itemId)
      );
      if (itemId && !status) return failure(404, "Status not found.");
      if (method === "GET")
        return reply(
          itemId
            ? statusResult(status)
            : state.statuses
                .filter((s) => s.boardId === boardId)
                .map(statusResult)
        );
      if (itemId && ["No Status", "Done"].includes(status.name))
        return failure(400, "No Status and Done are protected statuses.");
      if ((!itemId && method === "POST") || (itemId && method === "PUT")) {
        const name = typeof body.name === "string" ? body.name.trim() : "";
        const description =
          typeof body.description === "string"
            ? body.description.trim() || null
            : null;
        if (!name || name.length > 50 || description?.length > 200)
          return failure(400, "Check the status name and description lengths.");
        if (
          state.statuses.some(
            (s) =>
              s.boardId === boardId &&
              s.id !== status?.id &&
              s.name.toLowerCase() === name.toLowerCase()
          )
        )
          return failure(409, "Status name must be unique.");
        if (status) Object.assign(status, { name, description });
        else
          state.statuses.push({
            id:
              Math.max(
                0,
                ...state.statuses
                  .filter((s) => s.boardId === boardId)
                  .map((s) => s.id)
              ) + 1,
            name,
            description,
            boardId,
          });
        return commit(
          statusResult(status || state.statuses.at(-1)),
          status ? 200 : 201
        );
      }
      if (method === "DELETE" && status) {
        const tasks = state.tasks.filter(
          (t) => t.boardId === boardId && t.statusId === status.id
        );
        const target = state.statuses.find(
          (s) =>
            s.boardId === boardId &&
            s.id === Number(targetId) &&
            s.id !== status.id
        );
        if (targetId && !target)
          return failure(400, "Transfer status not found.");
        if (tasks.length && !target)
          return failure(409, "Transfer tasks before deleting this status.");
        tasks.forEach((t) => {
          t.statusId = target.id;
          t.updated_on = new Date().toISOString();
        });
        state.statuses = state.statuses.filter((s) => s !== status);
        return commit(null, 204);
      }
    }
    if (resource === "collabs") {
      const collab = state.collabs.find(
        (c) => c.boardId === boardId && c.oid === itemId
      );
      const result = (c) => ({
        id: c.id,
        oid: c.oid,
        name: c.name,
        email: c.email,
        accessRight: c.accessRight,
      });
      if (method === "GET")
        return reply(
          state.collabs.filter((c) => c.boardId === boardId).map(result)
        );
      if (!itemId && method === "POST") {
        const email =
          typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
        if (
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
          !["READ", "WRITE"].includes(body.accessRight)
        )
          return failure(400, "Enter a valid email and access right.");
        if (
          email === board.owner.email.toLowerCase() ||
          state.collabs.some(
            (c) => c.boardId === boardId && c.email.toLowerCase() === email
          )
        )
          return failure(409, "The user is already a board collaborator.");
        // All valid addresses represent local fictional users. No email is sent.
        const known = [
          ...state.boards.map((b) => b.owner),
          ...state.collabs,
        ].find((u) => u.email.toLowerCase() === email);
        const added = {
          id: state.nextCollabId++,
          boardId,
          oid: known?.oid || `local-user-${state.nextCollabId}`,
          name: known?.name || email.split("@")[0],
          email,
          accessRight: body.accessRight,
        };
        state.collabs.push(added);
        return commit(result(added), 201);
      }
      if (!collab) return failure(404, "Collaborator not found.");
      if (method === "PATCH") {
        if (!["READ", "WRITE"].includes(body.accessRight))
          return failure(400, "Invalid access right.");
        collab.accessRight = body.accessRight;
        return commit(result(collab));
      }
      if (method === "DELETE") {
        state.collabs = state.collabs.filter((c) => c !== collab);
        return commit(null, 204);
      }
    }
    return failure(405, "Method not supported.");
  }
  return {
    fetch: fetchLocal,
    reset() {
      state = seedData();
      persist();
    },
    snapshot: () => clone(state),
  };
}
let api;
let warning = "";
export const getDemoWarning = () => warning;
function getApi() {
  if (!api)
    api = createDemoApi(
      {
        getItem: (key) => globalThis.localStorage.getItem(key),
        setItem: (key, value) => globalThis.localStorage.setItem(key, value),
      },
      (message) => {
        warning = message;
        if (typeof window !== "undefined")
          window.dispatchEvent(
            new CustomEvent("demo-storage-warning", { detail: message })
          );
      }
    );
  return api;
}
export const demoFetch = (url, options) => getApi().fetch(url, options);
export const resetDemo = () => getApi().reset();
