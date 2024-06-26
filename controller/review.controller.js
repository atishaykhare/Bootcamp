const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require('../middleware/async');
const Review = require('../models/Review');
const Bootcamp = require('../models/Bootcamp');

// @description GET Review
// @route GET /api/v1/reviews
// @route GET /api/v1/bootcamps/:bootcampId/reviews
// @access Public

exports.getReview = asyncHandler(async (req, res, next) => {

    if (req.params.bootcampId) {
        const review = await Review.find({bootcamp: req.params.bootcampId})

        return res.status(200).json({
            success: true,
            count: review.length,
            data: review
        })
    } else {
        return res.status(200).json(res.advanceResult);
    }
});

// @description Get Single Review
// @route GET /api/v1/reviews/:id
// @access Public
exports.getSingleReview = asyncHandler(async (req, res, next) => {
    const review = await Review.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description'
    });

    if (!review) {
        return next(new ErrorResponse(`No review with the id of ${req.params.id}`, 404));
    }

    return res.status(200).json({
        success: true,
        data: review
    });
});


// @description Add review
// @route POST /api/v1/bootcamps/:bootcampId/reviews
// @access Private
exports.addReview = asyncHandler(async (req, res, next) => {
    req.body.bootcamp = req.params.bootcampId;
    req.body.user = req.user.id;

    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    if (!bootcamp) {
        return next(new ErrorResponse(`No bootcamp with id ${req.params.bootcampId}`), 404);
    }

    const review = await Review.create(req.body);

    res.status(201).json({
        success: true,
        data: review
    });
})


// @description Update Review
// @route PUT /api/v1/reviews/:reviewId
// @access Private
exports.updateReview = asyncHandler(async (req, res, next) => {
    console.log({s: req.params.id})
    let review = await Review.findById(req.params.id);

    if (!review) {
        return next(new ErrorResponse(`No review with id ${req.params.id}`), 404);
    }

    // Check if user belongs to this review to update this review
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse('User not authorized to update this review', 401));
    }

    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: review
    });
});

// @description Delete a review
// @route DELETE /api/v1/reviews/:id
// @access private
exports.deleteReview = asyncHandler(async (req, res, next) => {
    let review = await Review.findById(req.params.id);

    if (!review) {
        return next(new ErrorResponse(`No review with id ${req.params.id}`), 404);
    }

    // Check if user belongs to this review to delete this review
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse('User not authorized to delete this review', 401));
    }

    await review.deleteOne({_id: req.params.id});

    res.status(200).json({
        success: true,
        data: {}
    });
});







