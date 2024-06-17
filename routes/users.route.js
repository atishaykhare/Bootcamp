const express = require("express");

const {protect, authorize} = require('../middleware/auth');
const {getUser, createUser, updateUser, deleteUser, getUsers} = require("../controller/users.controller");
const advanceResults = require("../middleware/pagination");
const User = require('../models/User');

const router = express.Router({mergeParams: true});

router.use(protect);
router.use(authorize('admin'));

router.route('/')
    .get(advanceResults(User), getUsers)
    .post(createUser)

router.route('/:id')
    .get(getUser)
    .put(updateUser)
    .delete(deleteUser);

module.exports = router;