let express = require('express');
let router = express.Router();

router.get('/', function (req, res, next) {
    res.send('vehicle-repairs auth route not yet implemented');
});

module.exports = router;