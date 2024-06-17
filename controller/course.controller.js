const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require('../middleware/async');
const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');

// @description GET Courses
// @route GET /api/v1/courses
// @route GET /api/v1/bootcamps/:bootcampId/courses
// @access Public

exports.getCourses = asyncHandler(async (req, res, next) => {

    if (req.params.bootcampId) {
        const courses = Course.find({bootcamp: req.params.bootcampId})

        return res.status(200).json({
            success: true,
            count: courses.length,
            data: courses
        })
    } else {
        return res.status(200).json(res.advanceResult);
    }
})

// @description GET Courses By ID
// @route GET /api/v1/courses:id
// @route GET /api/v1/courses/:id
// @access Public

exports.getCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description',
    })

    if (!course) {
        return next(new ErrorResponse(`No course with id ${req.params.id}`), 404);
    }

    res.status(200).json({
        success: true,
        data: course,
    })
})


// @description POST Courses
// @route POST /api/v1/bootcamps/:bootcampId/courses
// @access Private

exports.addCourses = asyncHandler(async (req, res, next) => {
    req.body.bootcamp = req.params.bootcampId;

    req.body.user = req.user.id

    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    if (!bootcamp) {
        return next(new ErrorResponse(`No bootcamp with id ${req.params.bootcamp}`), 404);
    }

    // Check if the user is the owner of this bootcamp
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User with ID ${req.user.id} is not authorized to add a course to this bootcamp id ${req.params.bootcamp}`, 403));
    }

    const course = await Course.create(req.body);

    res.status(200).json({
        success: true,
        data: course
    })

})


// @description PUT Courses
// @route PUT /api/v1/courses/:id
// @access Private

exports.updateCourses = asyncHandler(async (req, res, next) => {
    req.body.user = req.user.id
    const course = await Course.findById(req.params.id);

    if (!course) {
        return next(new ErrorResponse(`No Course with id ${req.params.id}`), 404);
    }

    // Check if the user is the owner of this course
    if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User with ID ${req.user.id} is not authorized to update the course`, 403));
    }

    const updatedCourse = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        success: true,
        data: updatedCourse
    })

})


// @description DELETE Courses
// @route DELETE /api/v1/courses/:id
// @access Private

exports.deleteCourses = asyncHandler(async (req, res, next) => {

    const course = await Course.findById(req.params.id);

    if (!course) {
        return next(new ErrorResponse(`No Course with id ${req.params.id}`), 404);
    }

    // Check if the user is the owner of this course
    if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User with ID ${req.user.id} is not authorized to delete the course`, 403));
    }


    await course.deleteOne();

    res.status(200).json({
        success: true,
        data: {}
    })

})




