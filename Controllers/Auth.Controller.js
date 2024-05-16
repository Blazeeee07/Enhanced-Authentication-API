const createError=require('http-errors')
const User = require('../Models/User.model')
// const AuthController = require('../Controllers/Auth.Controller')
const {UserSchema} = require('../helpers/validation_schema')
// router.post('/register', AuthController.register)
const jwt = require('jsonwebtoken')

const {signAccessToken, 
    verifyAccessToken, 
    signRefreshToken,
    verifyRefreshToken,
    invalidateToken} = require('../helpers/jwt_helper')



module.exports= {
    register: async(req,res,next)=>{
        console.log(req.body)
        try{
            // if(!email || !password) throw createError.BadRequest()
                const result = await UserSchema.validateAsync(req.body)
            console.log(result,"--------------------------");
            const {email, password} =req.body
            const doesExist = await User.findOne({ email: result.email})
            if(doesExist) throw createError.Conflict('This user already exists')
                const user = new User(result);
            const savedUser= await user.save()
            console.log(savedUser,"===============================");
            const accessToken = await signAccessToken(savedUser.id)
            const refreshToken= await signRefreshToken(savedUser.id)
    res.send({savedUser,accessToken, refreshToken})
            }
        catch(error){
            if(error.isJoi===true) error.status =422
            next(error)
        }
    },
    login: async(req,res,next)=>{
        try{
            
            // console.log(res.cookie,"============================");
            const result =await UserSchema.validateAsync(req.body)
    
            const user = await User.findOne({email:result.email})
            if(!user) throw createError.NotFound('User not registered')
            
            const isMatch = await user.isValidPassword(result.password)
            if(!isMatch) throw createError.Unauthorized('Username/password not valid')
            
            const accessToken =await signAccessToken(user.id)
            console.log(user,"======================================");
            const refreshToken= await signRefreshToken(user.id)
            res.send({accessToken, refreshToken})
            }
        catch(error){
            if(error.isJoi === true) {
                return next(createError.BadRequest('Invalid Username/Password'))
            }
            next(error)
        }
    },
    refreshToken: async(req,res,next)=>{
        try {
            const { refreshToken } = req.body
          if (!refreshToken) throw createError.BadRequest()
          const userId = await verifyRefreshToken(refreshToken)
          await verifyRefreshToken(refreshToken)
          const accessToken = await signAccessToken(userId)
          const refToken = await signRefreshToken(userId)
            res.send({accessToken, refreshToken: refToken})
        } catch (error) {
            next(error)
        }
    },
    logout: async(req,res,next)=>{
        const {accessToken}=req.body
        console.log(accessToken);
        if (!accessToken) throw createError.BadRequest()
        invalidateToken(accessToken)
        res.send('logout route')
    },
    test: async(req,res,next)=>{
        console.log(req.headers['authorization'],"--------------")
        res.send('Hello from express123')
    },
    getAll: async(req,res,next)=>{
        try {
            const user=await User.find();
            if(!user){
                res.send("No profiles to see")
            }
            res.send(user)
        } catch (error) {
            console.log(error.message);
        }
    },
    getAllPublic: async(req,res,next)=>{
        try {
            const user=await User.find({isPublic:true});
            if(!user){
                res.send("No profiles to see")
            }
            res.send(user)
        } catch (error) {
            console.log(error.message);
            
        }
    },
    getById: async(req,res,next)=>{
        const id=req.params.id;
        try {
            const user =await User.findById(id);
            if(!user){
                res.send("Profile doesn't exist")
            }
            res.send(user)
        } catch (error) {
            console.log(error.message);
        }
    },
    verifyAdmin: async(req,res,next)=>{
        const id=req.query.id
        try {
            const user =await User.findOne({ _id: id, isAdmin: true });
            if(!user){
                return res.status(401).json({ message: 'Only admins are allowed to see this.' });
            }
            next()
        } catch (error) {
            console.log(error.message);
        }
    },
    updateById: async(req,res,next)=>{
        const id=req.params.id;
        try {
            const user =await User.findById(id);
            if(!user){
                res.send("Profile doesn't exist")
            }
            Object.assign(user, req.body)
            await user.save()
            // return stop
            res.send(user)
        } catch (error) {
            console.log(error.message);
        }
    },

}