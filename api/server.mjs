// Zero-dependency in-memory Bookstore REST API - the system under test.
// Deterministic: state resets on start, so every stack (Playwright, REST
// Assured, Postman/newman) runs against the same known fixtures.
import { createServer } from "node:http";

const PORT = Number(process.env.PORT) || 3000;
const TOKEN = "token-123";
const CREDS = { username: "admin", password: "password123" };

let nextId = 3;
let books = [];

function seed() {
  nextId = 3;
  books = [
    { id: 1, title: "Clean Code", author: "Robert C. Martin", price: 32.5 },
    {
      id: 2,
      title: "The Pragmatic Programmer",
      author: "Hunt and Thomas",
      price: 39.99,
    },
  ];
}
seed();

const send = (res, status, body) => {
  const payload = body === undefined ? "" : JSON.stringify(body);
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(payload);
};

const readBody = (req) =>
  new Promise((resolve) => {
    let data = "";
    req.on("data", (c) => (data += c));
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        resolve(null); // signals malformed JSON
      }
    });
  });

const isAuthed = (req) => req.headers["authorization"] === `Bearer ${TOKEN}`;

function validBook(b) {
  return (
    b &&
    typeof b.title === "string" &&
    b.title.trim() !== "" &&
    typeof b.author === "string" &&
    b.author.trim() !== "" &&
    typeof b.price === "number" &&
    b.price >= 0
  );
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const parts = url.pathname.split("/").filter(Boolean); // e.g. ["books","1"]
  const method = req.method;

  // Health + reset (reset is a test affordance)
  if (method === "GET" && url.pathname === "/health")
    return send(res, 200, { status: "ok" });
  if (method === "POST" && url.pathname === "/reset") {
    seed();
    return send(res, 200, { reset: true });
  }

  // Auth
  if (method === "POST" && url.pathname === "/auth") {
    const body = await readBody(req);
    if (
      body &&
      body.username === CREDS.username &&
      body.password === CREDS.password
    ) {
      return send(res, 200, { token: TOKEN });
    }
    return send(res, 401, { error: "invalid credentials" });
  }

  // /books collection
  if (parts[0] === "books" && parts.length === 1) {
    if (method === "GET") return send(res, 200, books);
    if (method === "POST") {
      if (!isAuthed(req)) return send(res, 401, { error: "unauthorized" });
      const body = await readBody(req);
      if (!validBook(body))
        return send(res, 400, { error: "invalid book payload" });
      const book = {
        id: nextId++,
        title: body.title,
        author: body.author,
        price: body.price,
      };
      books.push(book);
      return send(res, 201, book);
    }
    return send(res, 405, { error: "method not allowed" });
  }

  // /books/:id item
  if (parts[0] === "books" && parts.length === 2) {
    const id = Number(parts[1]);
    const idx = books.findIndex((b) => b.id === id);
    if (method === "GET") {
      return idx === -1
        ? send(res, 404, { error: "not found" })
        : send(res, 200, books[idx]);
    }
    if (method === "PUT") {
      if (!isAuthed(req)) return send(res, 401, { error: "unauthorized" });
      if (idx === -1) return send(res, 404, { error: "not found" });
      const body = await readBody(req);
      if (!validBook(body))
        return send(res, 400, { error: "invalid book payload" });
      books[idx] = {
        id,
        title: body.title,
        author: body.author,
        price: body.price,
      };
      return send(res, 200, books[idx]);
    }
    if (method === "DELETE") {
      if (!isAuthed(req)) return send(res, 401, { error: "unauthorized" });
      if (idx === -1) return send(res, 404, { error: "not found" });
      books.splice(idx, 1);
      return send(res, 204);
    }
    return send(res, 405, { error: "method not allowed" });
  }

  return send(res, 404, { error: "not found" });
});

server.listen(PORT, () =>
  console.log(`bookstore API on http://localhost:${PORT}`),
);
