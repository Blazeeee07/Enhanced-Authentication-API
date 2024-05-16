const express = require('express')
const router = express.Router()
const {verifyAccessToken, signAccessToken} = require('../helpers/jwt_helper')
const AuthController = require('../Controllers/Auth.Controller')
const passport = require('passport');
const {Strategy} =require ('passport-local')
const GoogleStrategy = require('passport-google-oauth2')

router.get('/',verifyAccessToken,AuthController.test )
router.post('/register', AuthController.register)
router.post('/login', AuthController.login)

router.post('/logout', AuthController.logout)
router.get('/:id', verifyAccessToken, AuthController.getById)
router.patch('/:id', verifyAccessToken, AuthController.updateById)
router.get('/all-profiles', verifyAccessToken,AuthController.verifyAdmin, AuthController.getAll)
router.get('/all-public-profiles',verifyAccessToken, AuthController.getAllPublic)



router.post('/refresh-token', AuthController.refreshToken)


module.exports = router