const {validationResult, body} = require('express-validator');
const fs = require('fs');
//const rsvp = require('../models/rsvp')

//const mongoose = require('mongoose');
exports.validateId = (req, res, next) => {
    let id = req.params.id;
      //an objectId is a 24-bit Hex string
      if(!id.match(/^[0-9a-fA-F]{24}$/)) {
          let err = new Error('Invalid event id');
          err.status = 400;
          return next(err);
      }
      return next();
};

exports.validateSignUp = [body('firstName', 'First name cannot be empty').notEmpty().trim().escape(),
body('lastName', 'Last name cannot be empty').notEmpty().trim().escape(),
body('email', 'Email cannot be empty').notEmpty().isEmail().withMessage('Email must be valid').trim().escape().normalizeEmail(),
body('password', 'Password must be at least 8 characters and at most 64 characters').isLength({min: 8, max: 64})];

exports.validateLogIn = [body('email', 'Email cannot be empty').notEmpty().isEmail().withMessage('Email must be valid').trim().escape().normalizeEmail(),
body('password', 'Password must be at least 8 characters and at most 64 characters').isLength({min: 8, max: 64})];
exports.validateEvent = [body('title', 'Title cannot be empty').notEmpty().trim().escape(),
body('startDateTime', 'startDateTime cannot be empty').notEmpty().trim().escape().isISO8601().withMessage('The format of startDateTime is not valid').isAfter().withMessage('Star date must be after todays date'),
body('endDateTime', 'endDateTime cannot be empty').notEmpty().trim().escape().isISO8601().withMessage('The format of endDateTime is not valid').isAfter().withMessage('End date must be after the start date'),
body('location', 'Location cannot be empty').notEmpty().trim().escape(),
body('category', 'Category cannot be empty').notEmpty().isIn(['Sport', 'Employment', 'Entertainment', 'Politic', 'Social', 'other']).withMessage('Category can only be Sport, Employment, Entertainment, Politic, Social or other'),
body('details', 'details cannot be empty').notEmpty().trim().escape(),
body('image', 'image cannot be empty').custom((value, { req }) => {
    // Check if req.file exists for file uploads
    if (!req.file && !value) {
        throw new Error('Image cannot be empty');
    }
    return true;
}),
];

exports.validateRSVP = [body('status', 'RSVP cannot be empty').notEmpty().isIn(['YES', 'NO', 'MAYBE',]).withMessage('RSVP status field can ONLY be YES, NO or MAYBE')];

exports.validateResult = (req, res, next) => {
    let errors = validationResult(req);
    if(!errors.isEmpty()) {
        errors.array().forEach(error=>{
            req.flash('error', error.msg);
        });
        return res.redirect('back');
    } else {
        return next();
    }
}