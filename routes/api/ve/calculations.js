let express = require('express')
let router = express.Router()
let utils = require('../../../utils')
const { db, pgp } = require('../../../shared-db')
const PQ = pgp.ParameterizedQuery


// Query string parameters are optional (returns most recent 100 records if no query parameters)
// The following queary string parameters are allowed:
// ?year=2008&make=Ford&model=Taurus&engine=3.0L&condition=Good&keyword1=starter&keyword2=battery&keyword3=cable
router.get('', async (req, res, next) => {
    try {
        let q = req.query
        let pQuery = 'SELECT * FROM calculations'

        let filters = []
        if (utils.isYearValid(q.year)) { filters.push(pgp.as.format('year = $1', q.year)) }
        if (utils.isMakeValid(q.make)) { filters.push(pgp.as.format('make ILIKE $1', q.make)) }
        if (utils.isModelValid(q.model)) { filters.push(pgp.as.format('model ILIKE $1', q.model)) }
        if (utils.isEngineValid(q.engine)) { filters.push(pgp.as.format('engine = $1', q.engine)) }
        if (utils.isConditionValid(q.condition)) { filters.push(pgp.as.format('condition = $1', q.condition)) }
        if (utils.isKeywordValid(q.keyword1)) { filters.push(pgp.as.format('comments ILIKE $1', `%${q.keyword1}%`)) }
        if (utils.isKeywordValid(q.keyword2)) { filters.push(pgp.as.format('comments ILIKE $1', `%${q.keyword2}%`)) }
        if (utils.isKeywordValid(q.keyword3)) { filters.push(pgp.as.format('comments ILIKE $1', `%${q.keyword3}%`)) }
        if (filters.length) { pQuery = `${pQuery} WHERE ${filters.join(' AND ')}` }

        pQuery += ' ORDER BY id DESC'
        
        let limit = Math.abs(parseInt(q.limit))
        if (isNaN(limit) || limit > 100) { limit = 100 }
        pQuery += pgp.as.format(' LIMIT $1', limit)

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
//     "ve": 96
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
        if (typeof b.rpm !== 'number') { res.status(400).send("Invalid rpm detected in JSON data."); return; }
        if (typeof b.maf !== 'number') { res.status(400).send("Invalid maf detected in JSON data."); return; }
        if (typeof b.air_temp !== 'number') { res.status(400).send("Invalid air_temp detected in JSON data."); return; }
        if (typeof b.elevation !== 'number') { res.status(400).send("Invalid elevation detected in JSON data."); return; }
        if (typeof b.ve !== 'number') { res.status(400).send("Invalid volumetric efficiency detected in JSON data."); return; }

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