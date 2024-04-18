const model = require('../models/event');
const RSVP = require('../models/rsvp');
const { DateTime } = require('luxon');

exports.index = (req, res, next) => {
    model.find()
    .lean()
    .then(events => {
        return model.distinct('category').then(categories => {
            const formattedEvents = events.map(event => ({
                ...event,
                startDateTime: DateTime.fromJSDate(event.startDateTime).toISOTime(),
                endDateTime: DateTime.fromJSDate(event.endDateTime).toISOTime()
            }));
            res.render('./event/index', { events: formattedEvents, categories });
        });
    })
    .catch(err => next(err));
};

exports.new = (req, res) => {
    res.render('./event/new');
};

exports.create = (req, res, next)=>{
    let event = new model(req.body);
    req.flash('success', 'Event was created successfully!');
    event.hostName = req.session.user.id;
    if(req.file) {
        event.image = "/images/" + req.file.filename;
    }
    event.save()
    .then(event=> res.redirect('/events'))
    .catch(err=>{
        if (err.name === 'ValidationError') {
            err.status = 400;
        }
        next(err);
    });
};

exports.show = (req, res, next)=>{
    let id = req.params.id;
    
    model.findById(id).populate('hostName', 'firstName lastName')
    .lean()
    .then(event=>{
        if(event) {
            let startDateTime = DateTime.fromJSDate(event.startDateTime)
            event.startDateTime = startDateTime.toLocaleString(DateTime.DATETIME_SHORT)
            let endDateTime = DateTime.fromJSDate(event.endDateTime)
            event.endDateTime = endDateTime.toLocaleString(DateTime.DATETIME_SHORT)

            console.log(event);
            RSVP.find({event: id, status: 'YES'})
            .then(rsvp=>{
                return res.render('./event/show', {event, rsvp});
            })
            .catch(err=>next(err));
        } else {
            let err = new Error('Cannot find an event with id ' + id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err=>next(err));
};

exports.edit = (req, res, next)=>{
    let id = req.params.id;
    
    model.findById(id)
    .lean()
    .then(event=>{
            console.log(event)
            event.startDateTime = DateTime.fromJSDate(event.startDateTime).toISO({ includeOffset: false })
            event.endDateTime = DateTime.fromJSDate(event.endDateTime).toISO({ includeOffset: false })
            return res.render('./event/edit', {event});
    })
    .catch(err=>next(err));
};

exports.update = (req, res, next)=>{
    let event = req.body;
    let id = req.params.id;
    req.flash('success', 'Event was updated successfully!');
    if (req.file) {
        event.image = "/images/" + req.file.filename;
    }

    model.findByIdAndUpdate(id, event, {useFindAndModify: false, runValidators: true})
    .then(event=>{
            res.redirect('/events/' + id);
    })
    .catch(err=>{
        if(err.name === 'ValidationError')
            err.status = 400;
        next(err);
    });
};

exports.delete = (req, res, next) => {
    let id = req.params.id;
    req.flash('success', 'Event and associated RSVPs deleted successfully!');

    // Delete the associated RSVPs first
    RSVP.deleteMany({ event: id })
        .then(() => {
            // Proceed to delete the event
            return model.findByIdAndDelete(id);
        })
        .then(() => {
            // Handle successful deletion
            res.redirect('/events');
        })
        .catch(err => next(err));
};

exports.rsvp = (req, res, next) => {
    let id = req.params.id;
    let userId = req.session.user.id; // Assuming user ID is accessible via session

    // Check if the user is not the host of the event
    model.findById(id)
        .then(event => {
            if (!event || event.hostName.toString() === userId) {
                // Render error page with a 401 error
                return res.status(401).render('error', { error: new Error('Unauthorized to access the resource') });
            }

            // Create or update RSVP based on the request
            let newStatus = req.body.status; // Assuming status is sent in the request body
            RSVP.findOneAndUpdate(
                { user: userId, event: id },
                { status: newStatus },
                { new: true, upsert: true, useFindAndModify: false, runValidators: true, rawResult: true }
            )
                .then(() => {
                    // Handle successful RSVP update
                    if (newStatus === 'YES') {
                        req.flash('success', 'Successfully created your RSVP for this event!');
                    } else {
                        req.flash('success', 'Successfully updated your RSVP for this event!');
                    }
                    res.redirect('/users/profile');
                })
                .catch(err => next(err));
        })
        .catch(err => next(err));
};