const express = require('express');
const router = express.Router();

const zhishidianUserDetails = require('./zhishidianUserDetails');
const zhishidianUserAuthenticate = require('./zhishidianUserAuthenticate');
const zhishidianGetUserPosts = require('./zhishidianGetUserPosts');
const zhishidianUserCreate = require('./zhishidianUserCreate');

router.get('/:username', zhishidianUserDetails);
router.get('/', zhishidianUserAuthenticate);
router.get('/userposts/:userid', zhishidianGetUserPosts);
router.post('/', zhishidianUserCreate);

module.exports = router;