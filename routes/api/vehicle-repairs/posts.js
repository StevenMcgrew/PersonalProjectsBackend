const express = require('express');
const router = express.Router();
const { vehicleRepairsDatabase } = require('../../../shared-db');
const { db, pgp } = vehicleRepairsDatabase;
const PQ = pgp.ParameterizedQuery;


/*********************************************************************
Featured posts
**********************************************************************/
router.get('/featured', async (req, res, next) => {
    try {

    } catch (error) {
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