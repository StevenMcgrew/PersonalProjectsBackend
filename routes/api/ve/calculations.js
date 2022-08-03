let express = require('express')
let router = express.Router()
let utils = require('../../../utils')


// Expects query string '?limit= '
// Max allowed is limit=100
router.get('', function (req, res, next) {
    let limit = req.query.limit
    limit = utils.strToPositiveInt(limit)

    if (isNaN(limit)) { res.status(400).send("Problem with query string. Query string should be similar to this:  '?limit=20'"); return; }
    if (limit === 0) { res.sendStatus(200); return; }
    if (limit > 100) { limit = 100 }

    res.send(limit.toString())
});


module.exports = router