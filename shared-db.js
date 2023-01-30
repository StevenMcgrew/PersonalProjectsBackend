const pgp = require('pg-promise')();


/*********************************************************************
Export ve database
**********************************************************************/
let veConn = '';
if (process.env.NODE_ENV === 'development') {
    veConn = process.env.DEV_DB_BASE_URL + 've';
} else {
    veConn = process.env.PROD_DB_BASE_URL + 've';
}
console.log('CONN: ', veConn);
const veDB = pgp(veConn);
exports.veDatabase = { db: veDB, pgp };


/*********************************************************************
Export vehicle_repairs database
**********************************************************************/
let vehicleRepairsConn = '';
if (process.env.NODE_ENV === 'development') {
    vehicleRepairsConn = process.env.DEV_DB_BASE_URL + 'vehicle_repairs';
} else {
    vehicleRepairsConn = process.env.PROD_DB_BASE_URL + 'vehicle_repairs';
}
console.log('CONN: ', vehicleRepairsConn);
const vehicleRepairsDB = pgp(vehicleRepairsConn);
exports.vehicleRepairsDatabase = { db: vehicleRepairsDB, pgp };
