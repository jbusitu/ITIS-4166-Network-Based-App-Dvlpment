const express = require('express');
const controller = require('../controllers/eventController');
const { fileUpload } = require('../middlewares/fileUpload');
const {isLoggedIn, isHost} = require('../middlewares/auth');
const {validateId, validateEvent, validateRSVP, validateResult} = require('../middlewares/validator');

const router = express.Router();

//GET /events: send all events to the use
router.get('/', controller.index);

//GET /events/newEvent: send html for creating a new event
router.get('/new', isLoggedIn, controller.new);

//POST /events: create a new event
router.post('/', isLoggedIn, fileUpload, validateEvent, validateResult, controller.create);

router.post('/:id/rsvp', validateId, isLoggedIn, validateRSVP, validateResult, controller.rsvp);

//GET /events/:id: send details of event identified by id
router.get('/:id', validateId, controller.show);

//GET /events/:id/edit: send html form for editing an existing event
router.get('/:id/edit', isLoggedIn, isHost, validateId, controller.edit);

//PUT /events/:id/: update the event identified by id
router.put('/:id', isLoggedIn, fileUpload, isHost, validateId, validateEvent, validateResult, controller.update);

//DELETE /events/:id, delete the event identified by id
router.delete('/:id', isLoggedIn, isHost, validateId, controller.delete);

module.exports = router;