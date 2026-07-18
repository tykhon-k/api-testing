import { test, expect, type APIRequestContext } from "@playwright/test";
import { bookViolations } from "../src/schemas";

async function authToken(request: APIRequestContext): Promise<string> {
  const res = await request.post("/auth", {
    data: { username: "admin", password: "password123" },
  });
  return (await res.json()).token;
}

test.beforeEach(async ({ request }) => {
  await request.post("/reset"); // deterministic fixtures per test
});

test.describe("Books - read", () => {
  test("lists the seeded books and each matches the contract", async ({
    request,
  }) => {
    const res = await request.get("/books");
    expect(res.status()).toBe(200);
    const books = await res.json();
    expect(books).toHaveLength(2);
    for (const book of books) {
      expect(bookViolations(book)).toEqual([]);
    }
  });

  test("returns 404 for an unknown id", async ({ request }) => {
    const res = await request.get("/books/999");
    expect(res.status()).toBe(404);
  });
});

test.describe("Books - write (requires auth)", () => {
  test("creates a book with a valid token", async ({ request }) => {
    const token = await authToken(request);
    const res = await request.post("/books", {
      headers: { Authorization: `Bearer ${token}` },
      data: { title: "Refactoring", author: "Martin Fowler", price: 44.95 },
    });
    expect(res.status()).toBe(201);
    const created = await res.json();
    expect(bookViolations(created)).toEqual([]);
    expect(created.id).toBeGreaterThan(0);

    const check = await request.get(`/books/${created.id}`);
    expect(check.status()).toBe(200);
    expect((await check.json()).title).toBe("Refactoring");
  });

  test("rejects creation without a token (401)", async ({ request }) => {
    const res = await request.post("/books", {
      data: { title: "No Auth", author: "Nobody", price: 1 },
    });
    expect(res.status()).toBe(401);
  });

  test("rejects an invalid payload with 400", async ({ request }) => {
    const token = await authToken(request);
    const res = await request.post("/books", {
      headers: { Authorization: `Bearer ${token}` },
      data: { title: "", author: "X", price: -5 },
    });
    expect(res.status()).toBe(400);
  });

  test("updates then deletes a book", async ({ request }) => {
    const token = await authToken(request);
    const auth = { Authorization: `Bearer ${token}` };

    const update = await request.put("/books/1", {
      headers: auth,
      data: {
        title: "Clean Code (2nd ed.)",
        author: "Robert C. Martin",
        price: 35,
      },
    });
    expect(update.status()).toBe(200);
    expect((await update.json()).title).toBe("Clean Code (2nd ed.)");

    const del = await request.delete("/books/1", { headers: auth });
    expect(del.status()).toBe(204);

    const gone = await request.get("/books/1");
    expect(gone.status()).toBe(404);
  });
});
