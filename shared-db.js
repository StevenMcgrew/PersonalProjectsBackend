const pgp = require('pg-promise')();

exports.connect = (dbName) => {
    let conn = '';
    if (process.env.NODE_ENV === 'development') {
        conn = process.env.DEV_DB_BASE_URL;
    }
    else {
        conn = process.env.PROD_DB_BASE_URL;
    }
    conn += dbName;

    const db = pgp(conn);
    return { db, pgp };
};

// let conn = '';
// if (process.env.NODE_ENV === 'development') {
//     conn = process.env.LOCAL_DB_URL;
// } else {
//     conn = process.env.DATABASE_URL;
// }

// const db = pgp(conn);

// module.exports = { db, pgp };