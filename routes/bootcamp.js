const express = require('express');
const {
    getBootcamps,
    createBootcamp,
    updateBootcamp,
    deleteBootcamp,
    getBootcampDetails,
    getBootcampsInRadius,
    bootcampPhotoUpload,
} = require('../controller/bootcamps.controller');

const Bootcamp = require('../models/Bootcamp');
const advanceResults = require('../middleware/pagination')

const courseRouter = require('./courses.route');

const router = express.Router();

router.use('/:bootcampId/courses', courseRouter);

router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius)

router.route('/').get(advanceResults(Bootcamp, 'courses'), getBootcamps).post(createBootcamp);

router.route('/:id').get(getBootcampDetails).put(updateBootcamp).delete(deleteBootcamp);

router.route('/:id/photo').put(bootcampPhotoUpload);


module.exports = router;