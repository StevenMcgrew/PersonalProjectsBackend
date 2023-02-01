const express = require('express');
const router = express.Router();
const { vehicleRepairsDatabase } = require('../../../shared-db');
const { db, pgp } = vehicleRepairsDatabase;
const PQ = pgp.ParameterizedQuery;


/*********************************************************************
Get user by id
**********************************************************************/
router.get('/:id', async (req, res, next) => {
    try {
        const userId = Math.round(req.params.id);
        const sessionUserId = req.session.userId;
        let pq;

        if (userId === sessionUserId) { // user is viewing their own profile
            pq = new PQ({
                text: `SELECT email, username, profile_pic, created_on
                            FROM users WHERE id = $1 LIMIT 1`,
                values: [userId]
            });
        }
        else { // user is viewing someone else's profile
            pq = new PQ({
                text: `SELECT username, profile_pic, created_on
                            FROM users WHERE id = $1 LIMIT 1`,
                values: [userId]
            });
        }

        const arr = await db.query(pq);
        if (!arr.length) { res.status(404).json({ warning: 'User not found.' }); return; }

        res.json(arr[0]);
    } catch (error) {
        next(error);
    }
});


/*********************************************************************
Update user's theme
**********************************************************************/
router.put('/theme', async (req, res, next) => {
    try {
        // Only a signed in user can change their theme
        if (!req.session.userId) { res.status(400).json({ warning: 'You must be signed in to save changes to the server.' }); return; }

        const pq = new PQ({
            text: `UPDATE users SET theme = $1
                    WHERE id = ${req.session.userId} RETURNING theme`,
            values: [JSON.stringify(req.body)]
        });

        const arr = await db.query(pq);
        res.json(arr[0]);

    } catch (error) {
        next(error);
    }
});


/*********************************************************************
Exports
**********************************************************************/
exports.vehicleRepairsUsersRouter = router;