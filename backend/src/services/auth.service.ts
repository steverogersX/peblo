import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { AppError } from "../lib/AppError";
import httpStatus from "http-status";
import { env } from "../config/env";

const JWT_SECRET = env.JWT_SECRET;
const JWT_EXPIRES_IN = "7d";

export interface JwtPayload {
  userId: string;
  email: string;
}

export async function signup(name: string, email: string, password: string) {
  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0) {
    throw new AppError("Email already in use", httpStatus.CONFLICT);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const [user] = await db
    .insert(users)
    .values({ name, email, passwordHash })
    .returning({ id: users.id, name: users.name, email: users.email, createdAt: users.createdAt });

  const token = jwt.sign({ userId: user.id, email: user.email } satisfies JwtPayload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

  return { user, token };
}

export async function login(email: string, password: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user) {
    throw new AppError("Invalid email or password", httpStatus.UNAUTHORIZED);
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new AppError("Invalid email or password", httpStatus.UNAUTHORIZED);
  }

  const token = jwt.sign({ userId: user.id, email: user.email } satisfies JwtPayload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

  const { passwordHash: _, ...safeUser } = user;
  return { user: safeUser, token };
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

export async function getMe(userId: string) {
  const [user] = await db
    .select({ id: users.id, name: users.name, email: users.email, createdAt: users.createdAt })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) throw new AppError("User not found", httpStatus.NOT_FOUND);
  return user;
}

export async function deleteUser(userId: string): Promise<void> {
  const [row] = await db.delete(users).where(eq(users.id, userId)).returning({ id: users.id });
  if (!row) throw new AppError("User not found", httpStatus.NOT_FOUND);
}
