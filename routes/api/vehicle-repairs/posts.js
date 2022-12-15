const express = require('express');
const router = express.Router();
const { vehicleRepairsDatabase } = require('../../../shared-db');
const { db, pgp } = vehicleRepairsDatabase;
const PQ = pgp.ParameterizedQuery;


/*********************************************************************
Get featured posts.
**********************************************************************/
router.get('/featured', async (req, res, next) => {
    try {
        const queryString = `SELECT p.id, p.title, p.thumbnail, p.created_on, u.id, u.username, u.profile_pic
                                FROM posts p
                                JOIN users u
                                ON p.user_id = u.id
                                WHERE p.is_featured = true`;
        const arr = await db.query(queryString);
        return arr;
    } catch (error) {
        next(error);
    }
});


/*********************************************************************
Create new post.
Request body:
{
    title: '',             -> String
    repair_steps: '',      -> JSON as a String
    thumbnail: '',         -> file name and extension as a String
    is_published: false,   -> optional, database defaults to false
    user_id: 34,           -> Int
    vehicle_id: 89         -> Int
}
**********************************************************************/
router.post('', async (req, res, next) => {
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