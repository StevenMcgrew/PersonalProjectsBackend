const express = require('express');
const router = express.Router();
const { isEmailValid, isUsernameValid, isPasswordValid } = require('../../../utils');
const bcrypt = require('bcryptjs');
const { vehicleRepairsDatabase } = require('../../../shared-db');
const { db, pgp } = vehicleRepairsDatabase;
const PQ = pgp.ParameterizedQuery;


/*********************************************************************
Function to get user
**********************************************************************/
const getUserBy = async (field, value) => {
    try {
        const pq = new PQ({
            text: `SELECT * FROM users WHERE ${field} = $1 LIMIT 1`,
            values: [value]
        });
        const arr = await db.query(pq);
        return arr.length ? arr[0] : null;
    } catch (error) {
        return error;
    }
};


/*********************************************************************
Sign up. Request body:  { email, username, password }
**********************************************************************/
router.post('/signup', async (req, res, next) => {
    try {
        let { email, username, password } = req.body;

        // Make sure inputs are strings, otherwise errors occur
        email = email.toString().trim();
        username = username.toString().trim();
        password = password.toString();

        let warning = '';

        // Validate inputs
        warning += isEmailValid(email) ? '' : 'Invalid email address. ';
        warning += isUsernameValid(username) ? '' : 'Invalid Username. ';
        warning += isPasswordValid(password) ? '' : 'Invalid Password. ';

        // Check availability
        const userByEmail = await getUserBy('email', email);
        warning += userByEmail ? 'That email address is already in use. ' : '';
        const userByUsername = await getUserBy('username', username);
        warning += userByUsername ? 'That username is already taken.' : '';

        if (warning) { res.status(400).json({ warning }); return; }

        // Hash password
        const hash = await bcrypt.hash(password, 10);

        //Save new user
        const pq = new PQ({
            text: `INSERT INTO users (email, username, password) VALUES ($1, $2, $3) RETURNING id`,
            values: [email, username, hash]
        });
        const recordId = await db.query(pq);
        req.session.userId = recordId[0].id;
        res.json(recordId[0]);

    } catch (err) {
        next(err);
    }
});


/*********************************************************************
Log in. Request body:  { email, password }
**********************************************************************/
router.post('/login', async (req, res, next) => {
    try {
        let { email, password } = req.body;

        // Make sure inputs are strings, otherwise errors occur
        email = email.toString().trim();
        password = password.toString();

        // Get user
        const user = await getUserBy('email', email);
        if (!user) { res.status(400).json({ warning: 'Email and/or password incorrect.' }); return; }

        // Check status 
        if (user.status !== 'active') { res.status(400).json({ warning: `Cannot log in to that account. The account status is: ${user.status}.` }); return; }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) { res.status(400).json({ warning: 'Email and/or password incorrect.' }); return; }

        // Create new session and return user data
        req.session.userId = user.id;
        res.json({
            username: user.username,
            view_history: user.view_history,
            profile_pic: user.profile_pic,
            theme: user.theme
        });

    } catch (error) {
        next(error);
    }
});


/*********************************************************************
Log out. 
**********************************************************************/
router.delete('/logout', async (req, res, next) => {
    try {
        req.session = null;
        res.sendStatus(200);
    } catch (error) {
        next(error);
    }
});


/*********************************************************************
Export router
**********************************************************************/
module.exports = router;