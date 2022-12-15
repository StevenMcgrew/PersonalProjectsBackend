const express = require('express');
const router = express.Router();
const { isIntYearValid, isMakeValid, isModelValid, isEngineValid } = require('../../../utils');
const { vehicleRepairsDatabase } = require('../../../shared-db');
const { db, pgp } = vehicleRepairsDatabase;
const PQ = pgp.ParameterizedQuery;


/*********************************************************************
Create new vehicle. Request body:  { year, make, model, engine }
**********************************************************************/
router.post('', async (req, res, next) => {
    try {
        let { year, make, model, engine } = req.body;

        // Validate inputs
        let warning = '';
        warning += isIntYearValid(year) ? '' : 'Invalid vehicle year. ';
        warning += isMakeValid(make) ? '' : 'Invalid vehicle make. ';
        warning += isModelValid(model) ? '' : 'Invalid vehicle model. ';
        warning += isEngineValid(engine) ? '' : 'Invalid vehicle engine.';
        if (warning) { res.status(400).json({ warning }); return; }

        //Save new vehicle
        const pq = new PQ({
            text: `INSERT INTO vehicles (year, make, model, engine) VALUES ($1, $2, $3, $4) RETURNING id`,
            values: [year, make, model, engine]
        });
        const recordId = await db.query(pq);
        res.json(recordId[0]);

    } catch (error) {
        // TODO: handle db error for UNIQUE CONSTRAINT
        next(error);
    }
});


/*********************************************************************

**********************************************************************/
// router.get('/', async (req, res, next) => {
//     try {

//     } catch (error) {
//         next(error)
//     }
// });


/*********************************************************************
Export router
**********************************************************************/
module.exports = router;