const path = require('path');

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

    let query = Bootcamp.find(JSON.parse(queryStr)).populate('courses');

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
    const bootcamp = await Bootcamp.findById(req.params.id, {})
    if (!bootcamp) {
        return next(new ErrorResponse(`No Bootcamp found for ${req.params.id}`, 404));
    }

    const deletedBootcamp = await bootcamp.deleteOne({_id: req.params.id})
    console.log({deletedBootcamp: deletedBootcamp})
    res.status(200).json({success: true, data: {}});
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


// @desc Upload Photo for bootcamp
// @route PUT /api/v1/bootcamps/:id/photo
// @access Private

exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id, {});

    if (!bootcamp) {
        return next(new ErrorResponse(`No Bootcamp found for ${req.params.id}`, 404));
    }

    if (!req.files) {
        return next(new ErrorResponse('No File Found to upload'));
    }

    const file = req.files.files;

    if (!file.mimetype.startsWith('image')) {
        return next(new ErrorResponse('File is not an image', 400));
    }

    //check file size
    if (file.size > process.env.MAX_FILE_SIZE) {
        return next(new ErrorResponse(`File size should be less than ${process.env.MAX_FILE_SIZE / 1000000} MB`, 400));
    }


    //create custom filename
    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
        if (err) {
            console.log(err)
            return next(new ErrorResponse(
                `Problem with file upload ${err}`, 500
            ))
        }
        await Bootcamp.findByIdAndUpdate(req.params.id, {photo: file.name});

        res.status(200).json({
            success: true,
            data: file.name,
        })
    });


})
