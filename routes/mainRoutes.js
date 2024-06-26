const express = require('express');
const controller = require('../controllers/mainController');

const router = express.Router();

router.get('/about', controller.about);
router.get('/contact', controller.contact);
router.get('/', controller.index);

module.exports = router;