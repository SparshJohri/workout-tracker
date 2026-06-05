import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("Please define JWT_SECRET in .env.local");
}

const secret = new TextEncoder().encode(JWT_SECRET);

export type AuthPayload = {
  username: string;
};

export async function createAuthToken(payload: AuthPayload) {
  return await new SignJWT({
    username: payload.username,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyAuthToken(token: string): Promise<AuthPayload> {
  const { payload } = await jwtVerify(token, secret);

  if (typeof payload.username !== "string") {
    throw new Error("Invalid auth token");
  }

  return {
    username: payload.username,
  };
}
