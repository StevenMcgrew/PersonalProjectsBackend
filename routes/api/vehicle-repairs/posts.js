const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { rootDir } = require('../../../utils');
const { isTitleValid } = require('../../../utils');
const { saveVehicle } = require('./vehicles');
const { saveTags } = require('./tags');
const { savePostsTags } = require('./posts_tags');
var sanitizeFilename = require("sanitize-filename");
const { vehicleRepairsDatabase } = require('../../../shared-db');
const { db, pgp } = vehicleRepairsDatabase;
const PQ = pgp.ParameterizedQuery;


/*********************************************************************
Function to get post
**********************************************************************/
const getPostBy = async (field, value) => {
    try {
        const pq = new PQ({
            text: `SELECT * FROM posts WHERE ${field} = $1 LIMIT 1`,
            values: [value]
        });
        const arr = await db.query(pq);
        return arr.length ? arr[0] : null;
    } catch (error) {
        return error;
    }
};


/*********************************************************************
Function to save post
**********************************************************************/
const savePost = async (id, title, steps, thumbnail, is_published, user_id, vehicle_id) => {
    try {
        let postId = null;
        if (id) {
            const pq = new PQ({
                text: `UPDATE posts
                        SET title = $1, steps = $2, thumbnail = $3, is_published = $4, user_id = $5, vehicle_id = $6
                        WHERE id = $7 RETURNING id`,
                values: [title, steps, thumbnail, is_published, user_id, vehicle_id, id]
            });
            postId = await db.query(pq);
        }
        else {
            const pq = new PQ({
                text: `INSERT INTO posts (title, steps, thumbnail, is_published, user_id, vehicle_id)
                        VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
                values: [title, steps, thumbnail, is_published, user_id, vehicle_id]
            });
            postId = await db.query(pq);
        }
        return postId[0].id;
    } catch (error) {
        return error;
    }
};


/*********************************************************************
Get featured posts
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
Create new post
**********************************************************************/
router.post('', async (req, res, next) => {
    try {
        // Check for signed in user
        // if (!req.session.userId) { res.status(400).json({ warning: 'Must be signed in.' }); return; }

        let user_id = 17;

        // const user_id = req.session.userId;
        let {
            id,
            year,
            make,
            model,
            engine,
            title,
            tags,
            steps,
            thumbnail,
            is_published,
        } = req.body;

        // Make sure inputs are correct types, otherwise errors occur
        title = title.toString().trim();
        thumbnail = thumbnail.toString().trim();
        steps = JSON.stringify(steps);

        // Sanitize filename
        thumbnail = sanitizeFilename(thumbnail);

        // Validate inputs
        let warning = '';
        warning += isTitleValid(title) ? '' : 'Title is not valid. ';
        warning += typeof (is_published) === 'boolean' ? '' : 'Invalid value for is_published. ';
        if (warning) { res.status(400).json({ warning }); return; }

        // Save vehicle
        const vehicle_id = await saveVehicle(year, make, model, engine);

        // Save tags
        tags = tags.filter(tags => tags); // Remove empty strings
        tags = [...new Set(tags)]; // Remove duplicates
        const tagIds = await saveTags(tags);

        // Save post
        const postId = await savePost(id, title, steps, thumbnail, is_published, user_id, vehicle_id);

        // Save posts_tags
        await savePostsTags(postId, tagIds);

        // Respond
        res.json({ id: postId });

    } catch (error) {
        next(error);
    }
});


/*********************************************************************
Delete a post
**********************************************************************/
router.delete('/:id', async (req, res, next) => {
    try {
        // Check for signed in user
        // if (!req.session.userId) { res.status(400).json({ warning: 'Must be signed in.' }); return; }
        // const user_id = req.session.userId;

        let user_id = 17;

        // Get post
        let post = await getPostBy('id', req.params.id);
        if (!post) { res.status(400).json({ warning: 'Error: Could not find post.' }); return; }

        // Check that this post belongs to this user
        if (post.user_id !== user_id) { res.status(400).json({ warning: "Error: Unauthorized user." }); return; }

        // Delete all images (make sure the images belong to this user)
        const steps = JSON.parse(post.steps);
        steps.forEach((step) => {
            if (!step.img) { return; }

            const fileName = step.img;
            const imgUserId = fileName.substring(0, fileName.indexOf("_"));

            if (imgUserId !== user_id.toString()) { return; }

            const pathToFile = path.join(rootDir, 'public/repair-images/', fileName);
            fs.unlink(pathToFile, (err) => {
                if (err) {
                    throw err;
                }
            });
        });

        // Delete posts_tags (must delete these first because of db constraint)
        const deletePostsTagsPQ = new PQ({
            text: `DELETE FROM posts_tags WHERE post_id = $1`,
            values: [post.id]
        });
        const deletePostsTagsResult = await db.query(deletePostsTagsPQ);
        console.log('DELETE POSTS_TAGS:  ', deletePostsTagsResult);

        // Delete post
        const deletePostPQ = new PQ({
            text: `DELETE FROM posts WHERE id = $1`,
            values: [post.id]
        });
        const deletePostResult = await db.query(deletePostPQ);
        console.log('DELETE POST:  ', deletePostResult);

        res.sendStatus(200);

    } catch (error) {
        next(error);
    }
});


/*********************************************************************
Exports
**********************************************************************/
exports.vehicleRepairsPostsRouter = router;
exports.getPostBy = getPostBy;
exports.savePost = savePost;