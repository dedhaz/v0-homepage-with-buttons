import type { ResultSetHeader, RowDataPacket } from "mysql2/promise"
import { ensureAuthTables, pool } from "@/lib/server/db"

const TABLES = {
  clients: "admin_clients",
  suppliers: "admin_suppliers",
  products: "admin_products",
  deals: "admin_deals",
  deliveries: "admin_deliveries",
  finances: "admin_finances",
} as const

export type AdminEntity = keyof typeof TABLES

const state = globalThis as typeof globalThis & {
  __adminTablesInit?: Promise<void>
}

async function ensureAdminTables() {
  await ensureAuthTables()

  if (!state.__adminTablesInit) {
    state.__adminTablesInit = (async () => {
      for (const tableName of Object.values(TABLES)) {
        await pool.execute(`
          CREATE TABLE IF NOT EXISTS ${tableName} (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            data_json JSON NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `)
      }
    })().catch((error) => {
      state.__adminTablesInit = undefined
      throw error
    })
  }

  await state.__adminTablesInit
}

function getTable(entity: AdminEntity) {
  return TABLES[entity]
}

export async function listAdminRecords<T>(entity: AdminEntity): Promise<T[]> {
  await ensureAdminTables()
  const table = getTable(entity)

  const [rows] = await pool.execute<(RowDataPacket & { id: number; data: unknown; createdAt: string })[]>(
    `SELECT id, data_json as data, DATE_FORMAT(created_at, '%Y-%m-%d') as createdAt FROM ${table} ORDER BY id DESC`,
  )

  return rows.map((row) => ({
    id: row.id,
    createdAt: row.createdAt,
    ...(typeof row.data === "string" ? JSON.parse(row.data) : (row.data as object)),
  })) as T[]
}

export async function createAdminRecord<T extends object>(entity: AdminEntity, data: T) {
  await ensureAdminTables()
  const table = getTable(entity)

  const [result] = await pool.execute<ResultSetHeader>(`INSERT INTO ${table} (data_json) VALUES (?)`, [
    JSON.stringify(data),
  ])

  return result.insertId
}

export async function updateAdminRecord<T extends object>(entity: AdminEntity, id: number, data: T) {
  await ensureAdminTables()
  const table = getTable(entity)

  await pool.execute(`UPDATE ${table} SET data_json = ? WHERE id = ?`, [JSON.stringify(data), id])
}

export async function deleteAdminRecord(entity: AdminEntity, id: number) {
  await ensureAdminTables()
  const table = getTable(entity)

  await pool.execute(`DELETE FROM ${table} WHERE id = ?`, [id])
}
