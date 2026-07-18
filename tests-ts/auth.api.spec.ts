import { test, expect } from "@playwright/test";

test.describe("Auth", () => {
  test("valid credentials return a token", async ({ request }) => {
    const res = await request.post("/auth", {
      data: { username: "admin", password: "password123" },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.token).toBeTruthy();
  });

  test("invalid credentials are rejected with 401", async ({ request }) => {
    const res = await request.post("/auth", {
      data: { username: "admin", password: "wrong" },
    });
    expect(res.status()).toBe(401);
  });
});
