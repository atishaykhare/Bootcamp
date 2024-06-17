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

const {protect, authorize} = require('../middleware/auth');

router.use('/:bootcampId/courses', courseRouter);

router.route('/radius/:zipcode/:distance')
    .get(getBootcampsInRadius)

router.route('/')
    .get(advanceResults(Bootcamp, 'courses'), getBootcamps)
    .post(protect, createBootcamp);

router.route('/:id')
    .get(getBootcampDetails)
    .put(protect, authorize('publisher', 'admin'), updateBootcamp)
    .delete(protect, authorize('publisher', 'admin'), deleteBootcamp);

router.route('/:id/photo')
    .put(protect, authorize('publisher', 'admin'),
        bootcampPhotoUpload
    )
;


module.exports = router;