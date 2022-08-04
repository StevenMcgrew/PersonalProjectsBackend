const pgp = require('pg-promise')()

let conn = ''
if (process.env.NODE_ENV === 'development') {
    conn = process.env.LOCAL_DB_URL
} else {
    conn = process.env.DATABASE_URL
}

const db = pgp(conn)

module.exports = { db, pgp }