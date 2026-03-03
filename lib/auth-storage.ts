export interface StartRegistrationPayload {
  email: string
  password: string
  fullName: string
}

export interface StartRegistrationResult {
  ok: boolean
  error?: string
  demoCode?: string
}

export interface VerifyRegistrationPayload {
  email: string
  code: string
}

export interface VerifyRegistrationResult {
  ok: boolean
  error?: string
  user?: {
    id: number
    role: "user" | "manager" | "admin"
  }
}

export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResult {
  ok: boolean
  error?: string
  user?: {
    id: number
    email: string
    fullName: string
    role: "user" | "manager" | "admin"
  }
}

async function parseJsonSafe<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T
  } catch {
    return null
  }
}

export async function startRegistration(payload: StartRegistrationPayload): Promise<StartRegistrationResult> {
  const response = await fetch("/api/register/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  const result = await parseJsonSafe<StartRegistrationResult>(response)

  if (!response.ok) {
    return {
      ok: false,
      error: result?.error ?? "Не удалось отправить заявку на регистрацию.",
    }
  }

  return result ?? { ok: false, error: "Пустой ответ сервера." }
}

export async function verifyRegistrationCode(
  payload: VerifyRegistrationPayload,
): Promise<VerifyRegistrationResult> {
  const response = await fetch("/api/register/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  const result = await parseJsonSafe<VerifyRegistrationResult>(response)

  if (!response.ok) {
    return {
      ok: false,
      error: result?.error ?? "Не удалось подтвердить код.",
    }
  }

  return result ?? { ok: false, error: "Пустой ответ сервера." }
}

export async function login(payload: LoginPayload): Promise<LoginResult> {
  const response = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  const result = await parseJsonSafe<LoginResult>(response)

  if (!response.ok) {
    return {
      ok: false,
      error: result?.error ?? "Не удалось выполнить вход.",
    }
  }

  return result ?? { ok: false, error: "Пустой ответ сервера." }
}
