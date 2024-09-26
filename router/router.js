const express = require('express');
const router = express.Router();
const postsController = require('../contollers/posts.controller');
const photoController = require('../contollers/photo.controller');
const subscriptionsController = require('../contollers/subscriptions.controller');
const bodyParser = require("body-parser");
const auth = require('../middlewares/auth');


router.get('/posts', postsController.get);
router.delete('/posts', auth() ,postsController.del);
router.post('/posts',bodyParser.raw({type: ["image/jpeg", "image/png"], limit: "5mb"}), postsController.post);

router.get('/posts/:post_id/photo', photoController.get);

router.post('/subscriptions', subscriptionsController.post);

module.exports = router;
