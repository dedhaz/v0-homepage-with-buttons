import { createHmac, randomInt, randomUUID, scryptSync, timingSafeEqual } from "node:crypto"
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise"
import { cookies } from "next/headers"
import { ensureAuthTables, pool } from "@/lib/server/db"

const CODE_TTL_MINUTES = 10
const COOKIE_NAME = "auth_session"

export type UserRole = "user" | "admin"

function hashPassword(password: string) {
  return scryptSync(password, process.env.PASSWORD_SALT ?? "warehouse-auth-v1", 32).toString("hex")
}

function hashCode(code: string) {
  return createHmac("sha256", process.env.CODE_SECRET ?? "verification-secret").update(code).digest("hex")
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)
  if (leftBuffer.length !== rightBuffer.length) return false
  return timingSafeEqual(leftBuffer, rightBuffer)
}

function getSessionSecret() {
  return process.env.SESSION_SECRET ?? "dev-insecure-session-secret"
}

function signSession(payload: { uid: number; role: UserRole; jti: string; exp: number }) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url")
  const signature = createHmac("sha256", getSessionSecret()).update(body).digest("base64url")
  return `${body}.${signature}`
}

function verifySession(token: string) {
  const [body, signature] = token.split(".")
  if (!body || !signature) return null

  const expected = createHmac("sha256", getSessionSecret()).update(body).digest("base64url")
  if (!safeEqual(expected, signature)) return null

  const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as {
    uid: number
    role: UserRole
    exp: number
  }

  if (payload.exp < Math.floor(Date.now() / 1000)) return null
  return payload
}

export async function startRegistration(payload: { email: string; password: string; fullName: string }) {
  await ensureAuthTables()

  const email = normalizeEmail(payload.email)
  const fullName = payload.fullName.trim()
  const passwordHash = hashPassword(payload.password)

  const [existingRows] = await pool.execute<(RowDataPacket & { id: number; emailVerified: number })[]>(
    "SELECT id, email_verified AS emailVerified FROM users WHERE email = ? LIMIT 1",
    [email],
  )

  let userId: number

  if (existingRows.length > 0) {
    const user = existingRows[0]
    if (user.emailVerified === 1) {
      return { ok: false as const, error: "Пользователь с таким e-mail уже зарегистрирован." }
    }

    await pool.execute("UPDATE users SET password_hash = ?, full_name = ? WHERE id = ?", [
      passwordHash,
      fullName,
      user.id,
    ])
    userId = user.id
  } else {
    const [insertResult] = await pool.execute<ResultSetHeader>(
      "INSERT INTO users (email, password_hash, full_name, role, email_verified) VALUES (?, ?, ?, 'user', 0)",
      [email, passwordHash, fullName],
    )
    userId = insertResult.insertId
  }

  await pool.execute("DELETE FROM email_verification_codes WHERE user_id = ?", [userId])

  const code = randomInt(100000, 1000000).toString()
  const codeHash = hashCode(code)

  await pool.execute(
    "INSERT INTO email_verification_codes (user_id, code_hash, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE))",
    [userId, codeHash, CODE_TTL_MINUTES],
  )

  return {
    ok: true as const,
    demoCode: code,
  }
}

export async function verifyRegistrationCode(payload: { email: string; code: string }) {
  await ensureAuthTables()

  const email = normalizeEmail(payload.email)

  const [rows] = await pool.execute<
    (RowDataPacket & { id: number; role: UserRole; codeHash: string })[]
  >(
    `SELECT u.id, u.role, evc.code_hash AS codeHash
     FROM users u
     JOIN email_verification_codes evc ON evc.user_id = u.id
     WHERE u.email = ? AND evc.consumed_at IS NULL AND evc.expires_at > NOW()
     ORDER BY evc.id DESC
     LIMIT 1`,
    [email],
  )

  const row = rows[0]
  if (!row) {
    return { ok: false as const, error: "Код не найден или истёк. Запросите новый код." }
  }

  if (!safeEqual(row.codeHash, hashCode(payload.code.trim()))) {
    return { ok: false as const, error: "Неверный код подтверждения." }
  }

  await pool.execute("UPDATE users SET email_verified = 1 WHERE id = ?", [row.id])
  await pool.execute(
    "UPDATE email_verification_codes SET consumed_at = NOW() WHERE user_id = ? AND consumed_at IS NULL",
    [row.id],
  )

  return { ok: true as const, user: { id: row.id, role: row.role } }
}

export async function loginWithPassword(payload: { email: string; password: string }) {
  await ensureAuthTables()

  const [rows] = await pool.execute<
    (RowDataPacket & {
      id: number
      email: string
      fullName: string
      role: UserRole
      passwordHash: string
      emailVerified: number
    })[]
  >(
    "SELECT id, email, full_name AS fullName, role, password_hash AS passwordHash, email_verified AS emailVerified FROM users WHERE email = ? LIMIT 1",
    [normalizeEmail(payload.email)],
  )

  const user = rows[0]
  if (!user || !safeEqual(user.passwordHash, hashPassword(payload.password))) {
    return { ok: false as const, error: "Неверный e-mail или пароль." }
  }

  if (user.emailVerified !== 1) {
    return { ok: false as const, error: "Подтвердите e-mail перед входом." }
  }

  const token = signSession({
    uid: user.id,
    role: user.role,
    jti: randomUUID(),
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
  })

  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })

  return {
    ok: true as const,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    },
  }
}

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null

  const payload = verifySession(token)
  if (!payload) return null

  await ensureAuthTables()

  const [rows] = await pool.execute<(RowDataPacket & { id: number; email: string; fullName: string; role: UserRole })[]>(
    "SELECT id, email, full_name AS fullName, role FROM users WHERE id = ? LIMIT 1",
    [payload.uid],
  )

  return rows[0] ?? null
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}
