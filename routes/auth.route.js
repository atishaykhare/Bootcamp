const express = require('express');
const {register, login, getMe, forgotPassword, resetPassword, updateDetails, updatePassword, logout} = require('../controller/auth.controller');

const router = express.Router();

const {protect} = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', protect, getMe);
router.put('/updateUser', protect, updateDetails);
router.put('/updatePassword', protect, updatePassword);
router.post('/forgot-password', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

module.exports = router;
