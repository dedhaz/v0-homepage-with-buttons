import { randomInt, scryptSync, timingSafeEqual } from "node:crypto"

export type UserRole = "admin" | "user"

interface RegisteredUser {
  id: number
  email: string
  passwordHash: string
  fullName: string
  role: UserRole
  createdAt: string
  verifiedAt: string
}

interface PendingRegistration {
  email: string
  passwordHash: string
  fullName: string
  code: string
  createdAt: string
  expiresAt: string
}

const CODE_TTL_MS = 10 * 60 * 1000
const SALT = "register-flow-v1"

const state = globalThis as typeof globalThis & {
  __authStore?: {
    users: RegisteredUser[]
    pending: PendingRegistration[]
  }
}

if (!state.__authStore) {
  state.__authStore = {
    users: [],
    pending: [],
  }
}

const store = state.__authStore

function hashPassword(password: string) {
  return scryptSync(password, SALT, 32).toString("hex")
}

function secureEquals(a: string, b: string) {
  const aBuffer = Buffer.from(a)
  const bBuffer = Buffer.from(b)
  if (aBuffer.length !== bBuffer.length) return false
  return timingSafeEqual(aBuffer, bBuffer)
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function generateCode() {
  return randomInt(100000, 1000000).toString()
}

export function startRegistration(payload: {
  email: string
  password: string
  fullName: string
}) {
  const normalizedEmail = normalizeEmail(payload.email)

  const hasExistingUser = store.users.some((user) => normalizeEmail(user.email) === normalizedEmail)
  if (hasExistingUser) {
    return { ok: false as const, error: "Пользователь с таким e-mail уже существует." }
  }

  store.pending = store.pending.filter((item) => normalizeEmail(item.email) !== normalizedEmail)

  const code = generateCode()
  const now = new Date()

  store.pending.push({
    email: payload.email.trim(),
    passwordHash: hashPassword(payload.password),
    fullName: payload.fullName.trim(),
    code,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + CODE_TTL_MS).toISOString(),
  })

  return { ok: true as const, demoCode: process.env.NODE_ENV === "production" ? undefined : code }
}

export function verifyRegistrationCode(payload: { email: string; code: string }) {
  const normalizedEmail = normalizeEmail(payload.email)
  const pendingUser = store.pending.find((item) => normalizeEmail(item.email) === normalizedEmail)

  if (!pendingUser) {
    return { ok: false as const, error: "Заявка на регистрацию не найдена." }
  }

  if (new Date(pendingUser.expiresAt).getTime() < Date.now()) {
    store.pending = store.pending.filter((item) => normalizeEmail(item.email) !== normalizedEmail)
    return {
      ok: false as const,
      error: "Срок действия кода истек. Отправьте форму регистрации заново.",
    }
  }

  if (!secureEquals(pendingUser.code, payload.code.trim())) {
    return { ok: false as const, error: "Неверный код подтверждения." }
  }

  const nextId = store.users.length === 0 ? 1 : Math.max(...store.users.map((user) => user.id)) + 1

  const createdUser: RegisteredUser = {
    id: nextId,
    email: pendingUser.email,
    passwordHash: pendingUser.passwordHash,
    fullName: pendingUser.fullName,
    role: "user",
    createdAt: pendingUser.createdAt,
    verifiedAt: new Date().toISOString(),
  }

  store.users.push(createdUser)
  store.pending = store.pending.filter((item) => normalizeEmail(item.email) !== normalizedEmail)

  return {
    ok: true as const,
    user: {
      id: createdUser.id,
      role: createdUser.role,
    },
  }
}
