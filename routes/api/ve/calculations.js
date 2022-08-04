let express = require('express')
let router = express.Router()
let utils = require('../../../utils')
const { db, pgp } = require('../../../shared-db')
const PQ = pgp.ParameterizedQuery


// Expects query string in URL '?limit= '
// Max allowed is limit=100
router.get('', async (req, res, next) => {
    try {
        let limit = req.query.limit
        limit = utils.strToPositiveInt(limit)

        if (isNaN(limit)) { res.status(400).send("Problem with query string. Query string should be similar to this:  '?limit=20'"); return; }
        if (limit === 0) { res.sendStatus(200); return; }
        if (limit > 100) { limit = 100 }

        let pQuery = new PQ({ text: 'SELECT * FROM calculations ORDER BY id DESC LIMIT $1',
                              values: [limit] })
        let records = await db.query(pQuery)
        res.json(records)
    } catch (err) {
        next(err)
    }
});


// Expects a JSON object with the following structure:
// {
//     "year": "2008",
//     "make": "Ford",
//     "model": "Taurus",
//     "engine": "3.0L",
//     "condition": "Good",
//     "comments": "Some comment",
//     "maf_units": "g/s",
//     "temp_units": "°F",
//     "elevation_units": "ft",
//     "rpm": 5000,
//     "maf": 150.0,
//     "air_temp": 76,
//     "elevation": 1200,
//     "ve": 96,
// }
router.post('', async (req, res, next) => {
    try {
        let b = req.body
        if (utils.isObjEmpty(b)) { res.status(400).send("Expected JSON data but nothing was found in the request body."); return; }
        if (!utils.isYearValid(b.year)) { res.status(400).send("Invalid car year detected in JSON data."); return; }
        if (!utils.isMakeValid(b.make)) { res.status(400).send("Invalid car make detected in JSON data."); return; }
        if (!utils.isModelValid(b.model)) { res.status(400).send("Invalid car model detected in JSON data."); return; }
        if (!utils.isEngineValid(b.engine)) { res.status(400).send("Invalid car engine detected in JSON data."); return; }
        if (!utils.isConditionValid(b.condition)) { res.status(400).send("Invalid condition (Good, Bad, or Unsure) detected in JSON data."); return; }
        if (!utils.isCommentsValid(b.comments)) { res.status(400).send("Comments are too long. Max length is 300 characters."); return; }
        if (!utils.isMafUnitsValid(b.maf_units)) { res.status(400).send("Invalid maf_units detected in JSON data."); return; }
        if (!utils.isTempUnitsValid(b.temp_units)) { res.status(400).send("Invalid temp_units detected in JSON data."); return; }
        if (!utils.isElevationUnitsValid(b.elevation_units)) { res.status(400).send("Invalid elevation_units detected in JSON data."); return; }
        if (!(typeof b.rpm === 'number')) { res.status(400).send("Invalid rpm detected in JSON data."); return; }
        if (!(typeof b.maf === 'number')) { res.status(400).send("Invalid maf detected in JSON data."); return; }
        if (!(typeof b.air_temp === 'number')) { res.status(400).send("Invalid air_temp detected in JSON data."); return; }
        if (!(typeof b.elevation === 'number')) { res.status(400).send("Invalid elevation detected in JSON data."); return; }
        if (!(typeof b.ve === 'number')) { res.status(400).send("Invalid volumetric efficiency detected in JSON data."); return; }

        let pQuery = new PQ({ text: `INSERT INTO calculations (year, make, model, engine, condition, comments, maf_units, temp_units, elevation_units, rpm, maf, air_temp, elevation, ve)
                                     VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING id;`,
                              values: [b.year, b.make, b.model, b.engine, b.condition, b.comments, b.maf_units, b.temp_units, b.elevation_units, b.rpm, b.maf, b.air_temp, b.elevation, b.ve] }) 
        let recordId = await db.query(pQuery)
        res.json(recordId)
    } catch (err) {
        next(err)
    }
});


module.exports = router