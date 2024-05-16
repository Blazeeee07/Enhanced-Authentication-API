const express = require('express')
const morgan = require('morgan')
const createError = require('http-errors')
require('dotenv').config()
require('./helpers/init_mongodb')
const passport = require('passport');
const {Strategy} =require ('passport-local')
const User = require('./Models/User.model')
const AuthController = require('./Controllers/Auth.Controller')
const GoogleStrategy = require('passport-google-oauth2')
// const { verifyAccessToken } = require('./helpers/jwt_helper')
// require('./helpers/init_redis')

const AuthRoute  = require('./Routes/Auth.route')
const { refreshToken } = require('./Controllers/Auth.Controller')

const app = express()
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
// const session = require('express-session');
// app.use(passport.initialize());
// app.use(passport.session());

// app.use(session({
//   secret: 'your_secret_key_here', // Replace with your own secret key
//   resave: false,
//   saveUninitialized: false,
//   // You can configure other options as needed
// }));


app.get('/', /*verifyAccessToken,*/ async (req, res, next) => {
  res.send('Hello from express.')
})

app.get("/auth/google",  passport.authenticate("google", {
  scope:["profile", "email"], 
}))

app.get("/auth/google/secrets",
  passport.authenticate("google", {
    successRedirect: "/",
    failureRedirect:"/login",
 }))

passport.use(
  "google",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/secrets",
      userProfileURL:"https://www.googleapis.com/oauth2/v3/userinfo",
    },
    async(accessToken, refreshToken,profile,cb)=>{
      console.log(profile);
        try {
          const existingUser = await User.findOne({ email: profile.email });
    if (!existingUser) {
      const newUser = { email: profile.email, password: "1234", name: profile?.name?.givenName };
      console.log(newUser);
      const user = new User(newUser);
      const savedUser= await user.save()
      console.log(savedUser);
      cb(null, newUser);
      return cb(null, { message: "Profile saved" });
    } else {
      cb(null, existingUser);
      return cb(null, { message: "Profile already exists" })
    }
        } catch (error) {
          cb(error, null);
        }
    }
  )
)


app.use('/auth', AuthRoute)

app.use(async (req, res, next) => {
  next(createError.NotFound("This route does not exist"))
})

// app.use((err, req, res, next) => {
//   res.status(err.status || 500)
//   res.send({
//     error: {
//       status: err.status || 500,
//       message: err.message,
//     },
//   })
// })

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})