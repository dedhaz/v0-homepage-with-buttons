import { promises as fs } from "node:fs"
import path from "node:path"

const LOG_FILE = path.join(process.cwd(), "logs", "app.log")

async function write(level: "INFO" | "ERROR", message: string, meta?: Record<string, unknown>) {
  const timestamp = new Date().toISOString()
  const payload = meta ? ` ${JSON.stringify(meta)}` : ""
  const line = `[${timestamp}] [${level}] ${message}${payload}\n`

  await fs.mkdir(path.dirname(LOG_FILE), { recursive: true })
  await fs.appendFile(LOG_FILE, line, "utf8")
}

export async function logInfo(message: string, meta?: Record<string, unknown>) {
  try {
    await write("INFO", message, meta)
  } catch {
    // no-op
  }
}

export async function logError(message: string, meta?: Record<string, unknown>) {
  try {
    await write("ERROR", message, meta)
  } catch {
    // no-op
  }
}
