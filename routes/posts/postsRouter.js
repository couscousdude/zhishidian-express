const express = require('express');
const router = express.Router();

const zhishidianGet = require('./zhishidianGet');
const zhishidianQuery = require('./zhishidianQuery');
const zhishidianCreatePost = require('./zhishidianCreatePost');

router.get('/:startId', zhishidianGet);
router.get('/', zhishidianQuery);
router.post('/', zhishidianCreatePost);

module.exports = router;