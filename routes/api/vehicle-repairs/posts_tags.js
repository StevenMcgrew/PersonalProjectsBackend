const express = require('express');
const router = express.Router();
const { isTagValid } = require('../../../utils');
const { vehicleRepairsDatabase } = require('../../../shared-db');
const { db, pgp } = vehicleRepairsDatabase;
const PQ = pgp.ParameterizedQuery;


/*********************************************************************
Function to save posts_tags
**********************************************************************/
const savePostsTags = async (postId, tagIds) => {
    try {
        tagIds.forEach(async (tagId) => {
            const pq = new PQ({
                text: `INSERT INTO posts_tags (post_id, tag_id) VALUES ($1, $2)`,
                values: [postId, tagId]
            });
            await db.query(pq);
        });
    } catch (error) {
        return error;
    }
};


/*********************************************************************
Create new posts_tags
**********************************************************************/
router.post('', async (req, res, next) => {
    try {
        let { postId, tagIds } = req.body;

        // Save posts_tags
        const result = savePostsTags(postId, tagIds);
        res.sendStatus(200);

    } catch (error) {
        next(error);
    }
});


/*********************************************************************
Exports
**********************************************************************/
exports.vehicleRepairsPostsTagsRouter = router;
exports.savePostsTags = savePostsTags;