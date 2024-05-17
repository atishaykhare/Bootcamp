const express = require('express');
const {
    getBootcamps,
    createBootcamp,
    updateBootcamp,
    deleteBootcamp, getBootcampDetails,
} = require('../controller/bootcamps.controller');

const router = express.Router();

router.route('/').get(getBootcamps).post(createBootcamp);

router.route('/:id').get(getBootcampDetails).put(updateBootcamp).delete(deleteBootcamp);


module.exports = router;