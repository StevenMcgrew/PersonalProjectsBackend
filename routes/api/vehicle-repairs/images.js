const express = require('express');
const router = express.Router();
const busboy = require('busboy');
const fs = require('fs');
const path = require('path');
const { mimeToImgFileExt } = require('../../../utils');
const { getPostBy } = require('./posts');
const { vehicleRepairsDatabase } = require('../../../shared-db');
const { db, pgp } = vehicleRepairsDatabase;
const PQ = pgp.ParameterizedQuery;


/*********************************************************************
Save image. Query params:  ?postId=0
**********************************************************************/
router.post('/', async (req, res, next) => {
    try {
        const postId = req.params.postId;
        let originalPath;

        // Check for signed in user
        if (!req.session.userId) { res.status(400).json({ warning: 'Must be signed in.' }); return; }
        const user_id = req.session.userId;

        // Get post
        let post = getPostBy('id', postId);
        if (!post) { res.status(400).json({ warning: 'Error saving image. Could not find post.' }); return; }

        // Check that this post belongs to this user
        if (post.user_id !== user_id) { res.status(400).json({ warning: "Error saving image. Unauthorized user." }); return; }

        const bb = busboy({ headers: req.headers });

        bb.on('field', function (name, val, info) {
            originalPath = val;
        });

        bb.on('file', async function (fieldname, fileStream, filename, encoding, mimetype) {
            // Determine file extension
            const fileExt = mimeToImgFileExt(mimetype);
            if (!fileExt) { res.status(400).json({ warning: 'Invalid image file type.' }); return; }

            // Create newFileName
            let newFileName = `${user_id}_${postId}_${Date.now()}${fileExt}`;

            // Save new image
            const saveTo = path.join(__dirname, 'public/repair-images/', newFileName);
            fileStream.pipe(fs.createWriteStream(saveTo));

            // Delete old image, if needed
            if (originalPath) {
                const pathToOldFile = path.join(__dirname, originalPath);
                fs.unlink(pathToOldFile, (err) => {
                    err ? console.log(`Error when deleting image file:  ${err}`) : {};
                });
            }

            // Done
            res.json({ imgPath: saveTo });
        });

        req.pipe(bb);

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
Exports
**********************************************************************/
exports.vehicleRepairsImagesRouter = router;
