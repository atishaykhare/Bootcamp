const path = require('path');

const Bootcamp = require('../models/Bootcamp');
const geocoder = require('../utils/geocoder');
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require('../middleware/async');

exports.getBootcamps = asyncHandler(async (req, res, next) => {

    res.status(200).json(res.advanceResult);
});

exports.getBootcampDetails = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
        return next(new ErrorResponse(`No Bootcamp found for ${req.params.id}`, 404))

    }
    res.status(200).json({success: true, data: bootcamp});

})

exports.createBootcamp = asyncHandler(async (req, res, next) => {

    //Add user to req bodu

    req.body.user = req.user.id;

    //check for published bootcamp
    const publishedBootcamp = await Bootcamp.findOne({user: req.user.id});


    //If the user is not an admin, they can only add one bootcamp
    if (publishedBootcamp && req.user.role !== 'admin') {
        return next(new ErrorResponse(`The user with ID ${req.user.id} has already published a bootcamp`, 400));
    }

    //Add geocode to body
    const loc = await geocoder.geocode(req.body.address);
    req.body.location = {
        type: 'Point',
        coordinates: [loc[0].longitude, loc[0].latitude],
        formattedAddress: loc[0].formattedAddress,
        street: loc[0].streetName,
        city: loc[0].city,
        state: loc[0].stateCode,
        zipcode: loc[0].zipcode,
        country: loc[0].country,
    }


    const bootcamp = await Bootcamp.create(req.body);

    res.status(201).json({success: true, data: bootcamp});
})

exports.updateBootcamp = asyncHandler(async (req, res, next) => {
    let bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
        return next(new ErrorResponse(`No Bootcamp found for ${req.params.id}`, 404));
    }

    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User with ID ${req.user.id} is not authorized to update this bootcamp`, 403));
    }

    bootcamp = await Bootcamp.findOneAndUpdate({"_id": req.params.id}, req.body, {
        new: true,
        runValidators: true
    });

     res.status(200).json({success: true, data: bootcamp});

})

exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id, {})
    if (!bootcamp) {
        return next(new ErrorResponse(`No Bootcamp found for ${req.params.id}`, 404));
    }


    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User with ID ${req.user.id} is not authorized to delete this bootcamp`, 403));
    }


    const deletedBootcamp = await bootcamp.deleteOne({_id: req.params.id})

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

    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User with ID ${req.user.id} is not authorized to update this bootcamp`, 403));
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
