const express = require('express');
const router = express.Router();
const utils = require('../../../utils');
const { db, pgp } = require('../../../shared-db');
const PQ = pgp.ParameterizedQuery;
const bcrypt = require('bcryptjs');


/*********************************************************************
Utility functions for auth routes
**********************************************************************/
const isEmailAvailable = async (email) => {
    try {
        const pq = new PQ({
            text: `SELECT id FROM users WHERE email = $1 LIMIT 1`,
            values: [req.query.email]
        });
        const records = await db.query(pq);
        return records.length ? false : true;
    } catch (error) {
        return error;
    }
};

const isUsernameAvailable = async (username) => {
    try {
        const pq = new PQ({
            text: `SELECT id FROM users WHERE username = $1 LIMIT 1`,
            values: [req.query.username]
        });
        const records = await db.query(pq);
        return records.length ? false : true;
    } catch (error) {
        return error;
    }
};


/*********************************************************************
Check email availability. Query param:  ?email=
**********************************************************************/
router.get('/users/email/availability', async (req, res, next) => {
    try {
        res.json(`{ "isAvailable": ${isEmailAvailable(req.query.email)} }`);
    } catch (error) {
        next(error);
    }
});


/*********************************************************************
Check username availability. Query param:  ?username=
**********************************************************************/
router.get('/users/username/availability', async (req, res, next) => {
    try {
        res.json(`{ "isAvailable": ${isUsernameAvailable(req.query.username)} }`);
    } catch (error) {
        next(error);
    }
});


/*********************************************************************
Sign up new user. Request body:  { email, username, password }
**********************************************************************/
router.post('/users', async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        let errors = 'The server detected the following problems:  ';

        // Validate inputs
        errors += utils.isEmailValid(email) ? '' : 'Invalid email address. ';
        errors += utils.isUsernameValid(username) ? '' : 'Invalid Username. ';
        errors += utils.isPasswordValid(password) ? '' : 'Invalid Password. ';

        // Check availability
        errors += isEmailAvailable(email) ? '' : 'That email address is already in use.';
        errors += isUsernameAvailable(username) ? '' : 'That username is already taken.';

        if (errors) {
            res.statusMessage = errors;
            res.status(400).end();
            return;
        }

        // Hash password (password must be of type String)
        const hash = await bcrypt.hash(password, 10);

        //Save new user
        const pq = new PQ({
            text: `INSERT INTO users (email, username, password) VALUES ($1, $2, $3) RETURNING id`,
            values: [email, username, hash]
        });
        const recordId = await db.query(pq);
        res.json(recordId);
    } catch (err) {
        next(err);
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

module.exports = router;