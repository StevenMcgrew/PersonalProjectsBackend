const express = require('express');
const router = express.Router();
const busboy = require('busboy');
const fs = require('fs');
const path = require('path');
const { mimeToImgFileExt, rootDir } = require('../../../utils');
const { getPostBy, savePost } = require('./posts');
const { vehicleRepairsDatabase } = require('../../../shared-db');
const { db, pgp } = vehicleRepairsDatabase;
const PQ = pgp.ParameterizedQuery;


/*********************************************************************
Save image. Query params:  ?postId=0&stepNum=0
**********************************************************************/
router.post('', async (req, res, next) => {
    try {
        const { postId, stepNum } = req.query;
        let oldFileName;

        // Check for signed in user
        if (!req.session.userId) { res.status(400).json({ warning: 'Must be signed in.' }); return; }
        const user_id = req.session.userId;

        // let user_id = 17;

        // Get post
        let post = await getPostBy('id', postId);
        if (!post) { res.status(400).json({ warning: 'Error saving image. Could not find post.' }); return; }

        // Check that this post belongs to this user
        if (post.user_id !== user_id) { res.status(400).json({ warning: "Error saving image. Unauthorized user." }); return; }

        const bb = busboy({ headers: req.headers });

        bb.on('field', function (name, val, info) {
            oldFileName = val;
        });

        bb.on('file', async function (name, file, info) {
            const { filename, encoding, mimeType } = info;

            // Determine file extension
            const fileExt = mimeToImgFileExt(mimeType);
            if (!fileExt) { res.status(400).json({ warning: 'Invalid image file type.' }); return; }

            // Create newFileName
            let newFileName = `${post.user_id}_${post.id}_${stepNum}_${Date.now()}${fileExt}`;

            // Save new image
            const saveTo = path.join(rootDir, 'public/repair-images/', newFileName);
            file.pipe(fs.createWriteStream(saveTo));

            // Update repair post
            let steps = JSON.parse(post.steps);
            while (steps.length < stepNum) {
                steps.push({ img: '', text: '' });
            }
            steps[stepNum - 1].img = newFileName;
            await savePost(post.id, post.title, JSON.stringify(steps), post.thumbnail, post.is_published, post.user_id, post.vehicle_id);

            // Delete old image, if needed
            if (oldFileName) {
                const pathToOldFile = path.join(rootDir, 'public/repair-images/', oldFileName);
                fs.unlink(pathToOldFile, (err) => {
                    if (err) {
                        throw err;
                    }
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
Delete image. Query params:  ?postId=0&stepNum=0
**********************************************************************/
router.delete('', async (req, res, next) => {
    try {
        const { postId, stepNum } = req.query;

        // Check for signed in user
        if (!req.session.userId) { res.status(400).json({ warning: 'Must be signed in.' }); return; }
        const user_id = req.session.userId;

        // let user_id = 17;

        // Get post
        let post = await getPostBy('id', postId);
        if (!post) { res.status(400).json({ warning: 'Error deleting image. Could not find post.' }); return; }

        // Check that this post belongs to this user
        if (post.user_id !== user_id) { res.status(400).json({ warning: "Error deleting image. Unauthorized user." }); return; }

        // Delete old image
        let steps = JSON.parse(post.steps);
        const oldFileName = steps[stepNum - 1].img;
        const pathToOldFile = path.join(rootDir, 'public/repair-images/', oldFileName);
        fs.unlink(pathToOldFile, (err) => {
            if (err) {
                throw err;
            }
        });

        // Update repair post
        steps[stepNum - 1].img = '';
        savePost(post.id, post.title, JSON.stringify(steps), post.thumbnail, post.is_published, post.user_id, post.vehicle_id);

        res.sendStatus(200);

    } catch (error) {
        next(error);
    }
});


/*********************************************************************
Exports
**********************************************************************/
exports.vehicleRepairsImagesRouter = router;
