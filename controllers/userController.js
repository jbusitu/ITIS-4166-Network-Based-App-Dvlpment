const User = require('../models/user');
const Event = require('../models/event');
const RSVP = require('../models/rsvp');
const { DateTime } = require('luxon');

//sign up form here
exports.new = (req, res)=>{
    return res.render('./user/new');
};

exports.create = (req, res, next)=>{
    
    let user = new User(req.body);
    if(user.email)
        user.email = user.email.toLowerCase();
    user.save()
    .then(user=>{ 
        req.flash('success', 'Registration succeeded!');
        res.redirect('/users/login')
    })
    .catch(err=>{
        if(err.name === 'ValidationError' ) {
            req.flash('error', err.message);  
            return res.redirect('/users/new');
        }

        if(err.code === 11000) {
            req.flash('error', 'Email has been used');  
            return res.redirect('/users/new');
        }
       
        next(err);
    });
   
};

exports.getUserLogin = (req, res, next) => {
        return res.render('./user/login');
}

exports.login = (req, res, next)=>{
   
    let email = req.body.email;
    if(email)
        email = email.toLowerCase();
    let password = req.body.password;
    User.findOne({ email: email })
    .then(user => {
        if (!user) {
            console.log('wrong email address');
            req.flash('error', 'wrong email address');  
            res.redirect('/users/login');
            } else {
            user.comparePassword(password)
            .then(result=>{
                if(result) {
                    req.session.user = {id: user._id, name: user.firstName};
                    req.flash('success', 'Successfully logged in!');
                    res.redirect('/');
            } else {
                req.flash('error', 'wrong password');      
                res.redirect('/users/login');
            }
            });    
        }    
    })
    .catch(err => next(err));
   
};

exports.logout = (req, res, next)=>{
    req.session.destroy(err=>{
        if(err)
           return next(err);
       else
            res.redirect('/');  
    });
   
};

exports.profile = (req, res, next) => {
    let userId = req.session.user.id; // Assuming user ID is accessible via session

    Promise.all([
        Event.find({ hostName: userId }), // Fetch events hosted by the user
        RSVP.find({ user: userId }).populate('event') // Fetch RSVPs made by the user and populate event details
    ])
        .then(([events, rsvp]) => {
            res.render('./user/profile', { events, rsvp });
        })
        .catch(err => next(err));
};