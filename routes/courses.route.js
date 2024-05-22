const express = require('express');
const {getCourses, getCourse, addCourses, updateCourses, deleteCourses} = require('../controller/course.controller');

const router = express.Router({mergeParams: true});

router.route('/').get(getCourses).post(addCourses);
router.route('/:id').get(getCourse).put(updateCourses).delete(deleteCourses);

module.exports = router;