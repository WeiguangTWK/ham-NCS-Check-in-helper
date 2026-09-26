import initSqlJs from 'sql.js'
import sqlWasmUrl from 'sql.js/dist/sql-wasm.wasm?url'

const readTable = (db, tableName, orderBy = '') => {
  const exists = db.exec(`select name from sqlite_master where type='table' and name='${tableName}'`)
  if (!exists.length || !exists[0].values.length) return []
  const statement = db.prepare(`select * from ${tableName}${orderBy}`)
  const rows = []
  try {
    while (statement.step()) rows.push(statement.getAsObject())
  } finally {
    statement.free()
  }
  return rows
}

onmessage = async ({ data }) => {
  try {
    const SQL = await initSqlJs({ locateFile: () => sqlWasmUrl })
    const db = new SQL.Database(new Uint8Array(data.buffer))
    try {
      postMessage({ qthRows: readTable(db, 'qth'), qsoRows: readTable(db, 'qsolog', ' order by ID') })
    } finally {
      db.close()
    }
  } catch (error) {
    postMessage({ error: error?.message || String(error) })
  }
}
