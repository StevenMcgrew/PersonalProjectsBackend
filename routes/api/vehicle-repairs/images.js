const express = require('express');
const router = express.Router();
const busboy = require('busboy');
const fs = require('fs');
const path = require('path');
const { mimeToImgFileExt, rootDir } = require('../../../utils');
const { getPostBy } = require('./posts');
const { vehicleRepairsDatabase } = require('../../../shared-db');
const { db, pgp } = vehicleRepairsDatabase;
const PQ = pgp.ParameterizedQuery;


/*********************************************************************
Save image. Query params:  ?postId=0
**********************************************************************/
router.post('/', async (req, res, next) => {
    try {
        const postId = req.query.postId;
        let originalPath;

        // Check for signed in user
        // if (!req.session.userId) { res.status(400).json({ warning: 'Must be signed in.' }); return; }
        // const user_id = req.session.userId;

        let user_id = 17;

        // Get post
        let post = await getPostBy('id', postId);
        if (!post) { res.status(400).json({ warning: 'Error saving image. Could not find post.' }); return; }

        // Check that this post belongs to this user
        if (post.user_id !== user_id) { res.status(400).json({ warning: "Error saving image. Unauthorized user." }); return; }

        const bb = busboy({ headers: req.headers });

        bb.on('field', function (name, val, info) {
            originalPath = val;
        });

        bb.on('file', async function (name, file, info) {
            const { filename, encoding, mimeType } = info;

            // Determine file extension
            const fileExt = mimeToImgFileExt(mimeType);
            if (!fileExt) { res.status(400).json({ warning: 'Invalid image file type.' }); return; }

            // Create newFileName
            let newFileName = `${post.user_id}_${post.id}_${Date.now()}${fileExt}`;

            // Save new image
            const saveTo = path.join(rootDir, 'public/repair-images/', newFileName);
            file.pipe(fs.createWriteStream(saveTo));

            // Delete old image, if needed
            if (originalPath) {
                const pathToOldFile = path.join(rootDir, originalPath);
                fs.unlink(pathToOldFile, (err) => {
                    err ? console.log(`Error when deleting image file:  ${err}`) : {};
                });
            }

            // Done
            res.json({ fileName: newFileName });
        });

        req.pipe(bb);

    } catch (error) {
        next(error);
    }
});


/*********************************************************************
Exports
**********************************************************************/
exports.vehicleRepairsImagesRouter = router;
