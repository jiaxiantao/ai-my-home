import { expect, test } from "@playwright/test";

const adminUsername = process.env.ADMIN_USERNAME ?? "admin";
const adminPassword = process.env.ADMIN_PASSWORD ?? "123456";

test.describe("Auth guard", () => {
  test("guest cannot write notes", async ({ request }) => {
    const response = await request.post("/api/notes", {
      data: {
        title: "unauthorized-note",
        contentMarkdown: "unauthorized",
        tags: [],
      },
    });

    expect(response.status()).toBe(401);
  });

  test("admin can write status probes after login", async ({ request }) => {
    const loginResponse = await request.post("/api/auth/login", {
      data: {
        username: adminUsername,
        password: adminPassword,
      },
    });
    expect(loginResponse.status()).toBe(200);

    const createResponse = await request.post("/api/status/probes", {
      data: {
        probeKey: "e2e-auth",
        environment: "local",
        p50Ms: 111,
        p95Ms: 222,
        avgSteps: 2,
        avgToolCalls: 1,
        errorRate: 0,
        ok: true,
        detail: "e2e",
      },
    });
    expect(createResponse.status()).toBe(201);

    const deleteResponse = await request.delete("/api/status/probes?probeKey=e2e-auth");
    expect(deleteResponse.status()).toBe(200);
  });
});
