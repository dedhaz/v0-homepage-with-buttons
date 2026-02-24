import mysql, { type Pool } from "mysql2/promise"

const DB_HOST = process.env.DB_HOST ?? "127.0.0.1"
const DB_PORT = Number(process.env.DB_PORT ?? 3306)
const DB_NAME = process.env.DB_NAME ?? "git"
const DB_USER = process.env.DB_USER ?? "git"
const DB_PASSWORD = process.env.DB_PASSWORD ?? "iA5eY6fB8x"

const state = globalThis as typeof globalThis & {
  __dbPool?: Pool
  __dbInitialized?: Promise<void>
}

export const pool =
  state.__dbPool ??
  mysql.createPool({
    host: DB_HOST,
    port: DB_PORT,
    database: DB_NAME,
    user: DB_USER,
    password: DB_PASSWORD,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: "utf8mb4",
  })

if (!state.__dbPool) {
  state.__dbPool = pool
}

export async function ensureAuthTables() {
  if (!state.__dbInitialized) {
    state.__dbInitialized = (async () => {
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS users (
          id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
          email VARCHAR(255) NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          full_name VARCHAR(255) NOT NULL,
          role ENUM('user','manager','admin') NOT NULL DEFAULT 'user',
          email_verified TINYINT(1) NOT NULL DEFAULT 0,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (id),
          UNIQUE KEY users_email_unique (email)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `)

      await pool.execute(`
        ALTER TABLE users
        MODIFY COLUMN role ENUM('user','manager','admin') NOT NULL DEFAULT 'user'
      `).catch(() => null)

      await pool.execute(`
        CREATE TABLE IF NOT EXISTS email_verification_codes (
          id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
          user_id BIGINT UNSIGNED NOT NULL,
          code_hash VARCHAR(255) NOT NULL,
          expires_at DATETIME NOT NULL,
          consumed_at DATETIME NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (id),
          KEY verification_user_idx (user_id),
          CONSTRAINT verification_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `)
    })().catch((error) => {
      state.__dbInitialized = undefined
      throw error
    })
  }

  await state.__dbInitialized
}
