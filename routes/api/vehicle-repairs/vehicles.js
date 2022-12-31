const express = require('express');
const router = express.Router();
const { isIntYearValid, isMakeValid, isModelValid, isEngineValid } = require('../../../utils');
const { vehicleRepairsDatabase } = require('../../../shared-db');
const { db, pgp } = vehicleRepairsDatabase;
const PQ = pgp.ParameterizedQuery;


/*********************************************************************
Function to save vehicle
**********************************************************************/
const saveVehicle = async (year, make, model, engine) => {
    try {
        // Check if vehicle already exists
        const pqGetVehicle = new PQ({
            text: `SELECT id FROM vehicles WHERE
                    year = $1 AND
                    make = $2 AND
                    model = $3 AND
                    engine = $4 LIMIT 1`,
            values: [year, make, model, engine]
        });
        const existingId = await db.query(pqGetVehicle);
        if (existingId.length) {
            return existingId[0].id;
        }

        // Save vehicle
        const pqSaveVehicle = new PQ({
            text: `INSERT INTO vehicles (year, make, model, engine)
                    VALUES ($1, $2, $3, $4) RETURNING id`,
            values: [year, make, model, engine]
        });
        const vehicleId = await db.query(pqSaveVehicle);
        return vehicleId[0].id;

    } catch (error) {
        return error;
    }
};


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
        const vehicleId = await saveVehicle(year, make, model, engine);
        res.json(vehicleId);

    } catch (error) {
        // TODO: handle db error for UNIQUE CONSTRAINT
        next(error);
    }
});


/*********************************************************************
Exports
**********************************************************************/
exports.vehicleRepairsVehiclesRouter = router;
exports.saveVehicle = saveVehicle;