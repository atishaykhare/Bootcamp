const express = require('express');

const Review = require('../models/Review');
const {getReview, getSingleReview, addReview, updateReview, deleteReview} = require('../controller/review.controller');

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

router.route('/:id').get(getSingleReview).put(protect, authorize('user', 'admin'), updateReview).delete(protect, authorize('user', 'admin'), deleteReview)
;


module.exports = router;