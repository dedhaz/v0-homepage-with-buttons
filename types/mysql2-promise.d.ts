declare module "mysql2/promise" {
  export interface RowDataPacket {
    [column: string]: unknown
  }

  export interface ResultSetHeader {
    insertId: number
    affectedRows: number
  }

  export interface Pool {
    execute<T = unknown>(sql: string, values?: unknown[]): Promise<[T, unknown]>
  }

  export interface PoolOptions {
    host?: string
    port?: number
    database?: string
    user?: string
    password?: string
    waitForConnections?: boolean
    connectionLimit?: number
    queueLimit?: number
    charset?: string
  }

  export function createPool(options: PoolOptions): Pool

  const mysql: {
    createPool: typeof createPool
  }

  export default mysql
}
