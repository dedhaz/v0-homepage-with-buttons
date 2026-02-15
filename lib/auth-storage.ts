export type UserRole = "admin" | "user"

export interface RegisteredUser {
  id: number
  email: string
  password: string
  fullName: string
  role: UserRole
  createdAt: string
  verifiedAt: string
}

interface PendingRegistration {
  email: string
  password: string
  fullName: string
  code: string
  createdAt: string
  expiresAt: string
}

const USERS_KEY = "app_users"
const PENDING_KEY = "app_pending_registrations"
const CODE_TTL_MS = 10 * 60 * 1000

function isBrowser() {
  return typeof window !== "undefined"
}

function loadUsers(): RegisteredUser[] {
  if (!isBrowser()) return []

  const raw = window.localStorage.getItem(USERS_KEY)
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as RegisteredUser[]) : []
  } catch {
    return []
  }
}

function saveUsers(users: RegisteredUser[]) {
  if (!isBrowser()) return
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function loadPending(): PendingRegistration[] {
  if (!isBrowser()) return []

  const raw = window.localStorage.getItem(PENDING_KEY)
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as PendingRegistration[]) : []
  } catch {
    return []
  }
}

function savePending(items: PendingRegistration[]) {
  if (!isBrowser()) return
  window.localStorage.setItem(PENDING_KEY, JSON.stringify(items))
}

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export function startRegistration(payload: {
  email: string
  password: string
  fullName: string
}) {
  const users = loadUsers()
  const hasExistingAccount = users.some(
    (user) => user.email.toLowerCase() === payload.email.toLowerCase(),
  )

  if (hasExistingAccount) {
    return { ok: false as const, error: "Пользователь с таким e-mail уже существует." }
  }

  const pending = loadPending().filter(
    (item) => item.email.toLowerCase() !== payload.email.toLowerCase(),
  )

  const code = generateCode()
  const now = new Date()

  pending.push({
    email: payload.email,
    password: payload.password,
    fullName: payload.fullName,
    code,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + CODE_TTL_MS).toISOString(),
  })

  savePending(pending)

  return { ok: true as const, code }
}

export function verifyRegistrationCode(email: string, code: string) {
  const pending = loadPending()
  const match = pending.find(
    (item) => item.email.toLowerCase() === email.toLowerCase(),
  )

  if (!match) {
    return { ok: false as const, error: "Заявка на регистрацию не найдена." }
  }

  if (new Date(match.expiresAt).getTime() < Date.now()) {
    savePending(pending.filter((item) => item.email.toLowerCase() !== email.toLowerCase()))
    return {
      ok: false as const,
      error: "Срок действия кода истек. Отправьте форму регистрации заново.",
    }
  }

  if (match.code !== code) {
    return { ok: false as const, error: "Неверный код подтверждения." }
  }

  const users = loadUsers()
  const nextId = users.length === 0 ? 1 : Math.max(...users.map((user) => user.id)) + 1

  const newUser: RegisteredUser = {
    id: nextId,
    email: match.email,
    password: match.password,
    fullName: match.fullName,
    role: "user",
    createdAt: match.createdAt,
    verifiedAt: new Date().toISOString(),
  }

  saveUsers([...users, newUser])
  savePending(pending.filter((item) => item.email.toLowerCase() !== email.toLowerCase()))

  return { ok: true as const, user: newUser }
}
