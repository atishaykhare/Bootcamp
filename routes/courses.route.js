const express = require('express');
const {getCourses, getCourse, addCourses, updateCourses, deleteCourses} = require('../controller/course.controller');
const advanceResults = require('../middleware/pagination')
const Course = require('../models/Course');

const router = express.Router({mergeParams: true});

router.route('/').get(advanceResults(Course, {
    path: 'bootcamp',
    select: 'name description',
}), getCourses).post(addCourses);
router.route('/:id').get(getCourse).put(updateCourses).delete(deleteCourses);

module.exports = router;