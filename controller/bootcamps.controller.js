const Bootcamp = require('../models/Bootcamp');
const geocoder = require('../utils/geocoder');
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require('../middleware/async');

exports.getBootcamps = asyncHandler(async (req, res, next) => {
    let queryStr;

    const reqQuery = {...req.query};

    const removeFields = ['select', 'sort', 'page', 'limit'];

    removeFields.forEach(r => delete reqQuery[r])

    queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    let query = Bootcamp.find(JSON.parse(queryStr));

    //Select Fields
    if (req.query.select) {
        const fields = req.query.select.replaceAll(',', ' ');

        query = query.select(fields);
    }

    //Sort
    if (req.query.sort) {
        const sort = req.query.sort.split(',').join(' ');
        query = query.sort(sort);
    } else {
        query = query.sort('-createdAt')
    }

    //Pagination

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 1;
    const startIndex = (page - 1) * limit;
    const endIndex = (page * limit);
    const total = await Bootcamp.countDocuments();

    query = query.skip(startIndex).limit(limit);

    const bootcamps = await query;

    const pagination = {};

    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit,
        }
    }

    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit,
        }
    }

    res.status(200).json({success: true, total_result: bootcamps.length, pagination: pagination, data: bootcamps});
})


exports.getBootcampDetails = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
        return next(new ErrorResponse(`No Bootcamp found for ${req.params.id}`, 404))

    }
    res.status(200).json({success: true, data: bootcamp});

})

exports.createBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.create(req.body);

    res.status(201).json({success: true, data: bootcamp});
})

exports.updateBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    })
    if (!bootcamp) {
        return next(new ErrorResponse(`No Bootcamp found for ${req.params.id}`, 404));
    }
    res.status(200).json({success: true, data: bootcamp});

})

exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id, {})
    if (!bootcamp) {
        return next(new ErrorResponse(`No Bootcamp found for ${req.params.id}`, 404));
    }
    res.status(200).json({success: true, data: bootcamp});
})

// @desc Get bootcamps within a specified radius
// @route GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access Private

exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
    const {zipcode, distance} = req.params;

    //Get lat/lng from geocoder

    const loc = await geocoder.geocode(zipcode);
    const lat = loc[0].latitude;
    const lng = loc[0].longitude;

    //Calc radius using radians
    //Divide dist by radius of Earth.
    //Earth radius = 3,963 miles or 6,378 kilometers

    const radius = distance / 6378;

    const bootcamps = await Bootcamp.find({
        location: {
            $geoWithin: {$centerSphere: [[lng, lat], radius]}
        }
    })

    res.status(200).json({
        success: true,
        count: bootcamps.length,
        data: bootcamps,
    })

})