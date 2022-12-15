const express = require('express');
const router = express.Router();
const { isTagValid } = require('../../../utils');
const { vehicleRepairsDatabase } = require('../../../shared-db');
const { db, pgp } = vehicleRepairsDatabase;
const PQ = pgp.ParameterizedQuery;


/*********************************************************************
Create new tags. Request body: { tags: ['tag1', 'tag2', ..., 'tag5'] }
**********************************************************************/
router.post('', async (req, res, next) => {
    try {
        let { tags } = req.body;

        // Make sure they are strings, otherwise errors occur
        tags = tags.map((t) => t.toString().trim());

        // Validate tags
        let warning = '';
        tags.forEach((t) => warning += isTagValid(t) ? '' : `The tag "${t}" is invalid.`);
        if (warning) { res.status(400).json({ warning }); return; }

        //Save tags
        tags.forEach(async (t) => {
            const pq = new PQ({
                text: `INSERT INTO tags (tag) VALUES ($1)`,
                values: [t]
            });
            await db.query(pq);
        });
        res.json({ success: true });

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