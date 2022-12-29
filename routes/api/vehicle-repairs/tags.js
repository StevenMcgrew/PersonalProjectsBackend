const express = require('express');
const router = express.Router();
const { isTagValid } = require('../../../utils');
const { vehicleRepairsDatabase } = require('../../../shared-db');
const { db, pgp } = vehicleRepairsDatabase;
const PQ = pgp.ParameterizedQuery;


/*********************************************************************
Function to save tags
**********************************************************************/
const saveTags = async (tags) => {
    try {
        let tagIds = [];
        tags.forEach(async (tag) => {

            // Check if tag already exists
            const pqGetTag = new PQ({
                text: `SELECT id FROM tags WHERE tag = $1 LIMIT 1`,
                values: [tag]
            });
            const existingId = await db.query(pqGetTag);

            if (existingId.length) {
                tagIds.push(existingId[0].id);
            }
            else {
                // Save tag
                const pqSaveTag = new PQ({
                    text: `INSERT INTO tags (tag) VALUES ($1) RETURNING id`,
                    values: [tag]
                });
                const newId = await db.query(pqSaveTag);
                tagIds.push(newId[0].id);
            }
        });
        return tagIds;
    } catch (error) {
        return error;
    }
};


/*********************************************************************
Create new tags. Request body: { tags: ['tag1', 'tag2', ..., 'tag5'] }
**********************************************************************/
router.post('', async (req, res, next) => {
    try {
        let { tags } = req.body;

        // Make sure they are strings, otherwise errors occur
        tags = tags.map((t) => t.toString().trim());

        // Remove empty strings
        tags = tags.filter(tags => tags);

        // Validate tags
        let warning = '';
        tags.forEach((t) => warning += isTagValid(t) ? '' : `The tag "${t}" is invalid.`);
        if (warning) { res.status(400).json({ warning }); return; }

        //Save tags
        const tagIds = await saveTags(tags);
        res.json(tagIds);

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
exports.vehicleRepairsTagsRouter = router;
exports.saveTags = saveTags;