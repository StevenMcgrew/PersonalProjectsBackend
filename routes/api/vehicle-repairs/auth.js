const express = require('express');
const router = express.Router();
const utils = require('../../../utils');
const bcrypt = require('bcryptjs');
const sharedDB = require('../../../shared-db');
const { db, pgp } = sharedDB.connect('vehicle_repairs');
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
        let arr = await db.query(pq);
        return arr.length ? arr[0] : null;
    } catch (error) {
        return error;
    }
};


/*********************************************************************
Check email availability. Query param:  ?email=
**********************************************************************/
router.get('/email/availability', async (req, res, next) => {
    try {
        if (!req.query.email) { res.statusMessage = 'Email must be provided as a query parameter.'; res.status(400).end(); return; }
        const user = await getUserBy('email', req.query.email);
        res.json({ isAvailable: (user ? false : true) });
    } catch (error) {
        next(error);
    }
});


/*********************************************************************
Check username availability. Query param:  ?username=
**********************************************************************/
router.get('/username/availability', async (req, res, next) => {
    try {
        if (!req.query.username) { res.statusMessage = 'Username must be provided as a query parameter.'; res.status(400).end(); return; }
        const user = await getUserBy('username', req.query.username);
        res.json({ isAvailable: (user ? false : true) });
    } catch (error) {
        next(error);
    }
});


/*********************************************************************
Sign up. Request body:  { email, username, password }
**********************************************************************/
router.post('/signup', async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        let errors = 'The server detected the following problems:  ';

        // Validate inputs
        errors += utils.isEmailValid(email) ? '' : 'Invalid email address. ';
        errors += utils.isUsernameValid(username) ? '' : 'Invalid Username. ';
        errors += utils.isPasswordValid(password) ? '' : 'Invalid Password. ';

        // Check availability
        let userByEmail = await getUserBy('email', email);
        errors += userByEmail.length ? '' : 'That email address is already in use.';
        let userByUsername = await getUserBy('username', username);
        errors += userByUsername ? '' : 'That username is already taken.';

        if (errors) { res.statusMessage = errors; res.status(400).end(); return; }

        // Hash password (password must be of type String)
        const hash = await bcrypt.hash(password, 10);

        //Save new user
        const pq = new PQ({
            text: `INSERT INTO users (email, username, password) VALUES ($1, $2, $3) RETURNING id`,
            values: [email, username, hash]
        });
        const recordId = await db.query(pq);
        req.session.user_id = recordId;
        res.json(recordId);
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

        // Get user
        let user = await getUserBy('email', email);
        if (user.warning)
            if (!user.length) { res.statusMessage = 'Email and/or password incorrect.'; res.status(400).end(); return; }

        // Check status
        if (user.status !== 'active') { res.statusMessage = `Cannot log in to that account. The account status is: ${user.status}.`; res.status(400).end(); return; }

        // Check password
        let isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) { res.statusMessage = 'Email and/or password incorrect.'; res.status(400).end(); return; }

        // Create new session and return user data
        req.session.user_id = user.id;
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

**********************************************************************/
// router.get('/', async (req, res, next) => {
//     try {

//     } catch (error) {
//         next(error)
//     }
// });

module.exports = router; 