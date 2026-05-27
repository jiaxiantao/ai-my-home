export class AdminAuthError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "AdminAuthError";
  }
}

export function getAdminSecretFromRequest(request: Request) {
  return request.headers.get("x-admin-secret");
}

export function assertAdminSecret(secret: string | null | undefined) {
  const expectedSecret = process.env.ADMIN_SECRET;

  if (!expectedSecret) {
    throw new AdminAuthError("ADMIN_SECRET is not configured");
  }

  if (!secret || secret !== expectedSecret) {
    throw new AdminAuthError("Invalid admin secret");
  }
}
