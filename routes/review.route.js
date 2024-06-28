const express = require('express');

const Review = require('../models/Review');
const {getReview, getSingleReview, addReview} = require('../controller/review.controller');

const advanceResults = require('../middleware/pagination')

const router = express.Router({mergeParams: true});

const {protect, authorize} = require('../middleware/auth');


router.route('/').get(
    advanceResults(Review, [{
        path: 'bootcamp',
        select: 'name description',
    }, {
        path: 'user',
        select: 'name email',
    }]),
    getReview
).post(protect, authorize('user', 'admin'), addReview);

router.route('/:id').get(getSingleReview)


module.exports = router;