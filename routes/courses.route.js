const express = require('express');
const {getCourses, getCourse, addCourses, updateCourses, deleteCourses} = require('../controller/course.controller');
const advanceResults = require('../middleware/pagination')
const Course = require('../models/Course');

const router = express.Router({mergeParams: true});

const {protect, authorize} = require('../middleware/auth');


router.route('/')
    .get(advanceResults(Course, {
        path: 'bootcamp',
        select: 'name description',
    }), getCourses)
    .post(protect, authorize('publisher', 'admin'), addCourses);

router.route('/:id')
    .get(getCourse)
    .put(protect, authorize('publisher', 'admin'), updateCourses)
    .delete(protect, authorize('publisher', 'admin'), deleteCourses);

module.exports = router;