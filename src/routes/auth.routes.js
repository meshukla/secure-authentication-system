const express = require('express')
const authController = require('../controllers/auth.controller')


const router = express.Router()

router.post('/register',  authController.userRegister)
router.post('/login',  authController.userLogin)
router.get('/refresh-token', authController.refreshtoken)
router.get('/get-me',authController.getme)
router.get('/logout',authController.logout)
router.get('/logout-all',authController.logoutAll)
router.post('/verify-email', authController.verifyEmail)
router.post( "/forgot-password",  authController.forgotPassword);
router.post("/verify-forgot-password-otp", authController.verifyForgotPasswordOtp);
router.post("/reset-password",authController.resetPassword);

module.exports = router