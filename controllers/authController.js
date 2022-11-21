// const { promisify } = require("util")

const jwt = require("jsonwebtoken")
const User = require("../models/userModel")
const catchAsync = require("../utils/catchAsync")
const AppError = require("../utils/appError")
const sendEmail = require("../utils/email")
const crypto = require("crypto")

const signToken = id => {
   return jwt.sign({ id }, process.env.JWT_SECRET,{expiresIn : process.env.JWT_EXPIRES_IN})
}
const createSendToken = (user,statusCode, res) =>{  
  const token = signToken(user._id)
  const cookieOptions =  {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
  
    httpOnly:true
  }
  if(process.env.NODE_ENV === "production") cookieOptions.secure = true
  res.cookie("jwt", token ,cookieOptions)
  // This remove the password from the post request output
  user.password = undefined
 
  console.log(token)
  res.status(statusCode).json({
  status : "success",
  token,
  data : {
   user 
  }
})
}
exports.signup = catchAsync(async (req,res,next) =>{
    const newUser = await  User.create(req.body)
    createSendToken(newUser,201,res)
 
})

exports.login = async (req,res,next)=>{
    const{email,password} = req.body;
    // check whether email or passsword is in the body of request
    if(!email || !password){
       return next(new AppError("please provide email and password", 400))
    }
    // check whether the email and password supply is correct
    const user = await User.findOne({email}).select("+password")
     if( !user || !( await user.correctPassword(password, user.password)) ){
       return next(new AppError("Invalid email or password", 401))
     }
     console.log(user)
     createSendToken(user,200,res)
   //send the token to the client
}


exports.protect = async(req,res,next) =>{

  let token
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
     token = await req.headers.authorization.split(" ")[1]
   }
   console.log(token);
   if(!token){
     return next(new AppError("you dont have a token please login! ",401))
   }
 
 
  //2 verify the token the token
  let decodedToken
  try {
      decodedToken =  jwt.verify(token,process.env.JWT_SECRET)
     console.log(decodedToken)
      req.user = decodedToken;
  } catch (error) {
    return res.status(401).json("Invalid Token");
  }
  //3 if the user still exist
  const existingUser = await User.findById(decodedToken.id)
   if(!existingUser){
    return next(new AppError("The user belonging to this token no longer exist",401))
   }
  if (existingUser.changedPasswordAfter(decodedToken.iat)){
    return next(new AppError("The user rencently changed password please logging again",401))
  }
  req.user = existingUser
  console.log(req.user)
 
  
  next()
}

exports.restrictTo = (...roles) => {

  return (req,res,next)=>{
    //roles =["admin","lead-guide"] role="user"
   
    if(!roles.includes(req.user.role)){

      return next(new AppError("You do not have permission to perform this action",403))
    }
    next();
  }
 
}



exports.forgetPassword = async(req,res,next) =>{
  // get user based on posted email
  const user = await User.findOne({email:req.body.email})
  console.log(user)
  if(!user){
    return next(new AppError("There is no user with this email",404))
  }

  // GENERATE THE RANDOM RESET TOKEN
  const resetToken = user.createPasswordResetToken();
  await user.save({validateBeforeSave : false})
 

  // send it user's email

  const resetUrl =`${req.protocol}://${req.get("host")}/api/v1/users/resetPassword/${resetToken}`
  console.log(resetUrl)
  const message = `Forgot your password ? Submit a patch request with your password and confirmPassword to :${resetUrl}.\nIf you didn't forget your password ignore this email! `
  try {
    await sendEmail({
      email : user.email,
      subject :`Your reset password is valid only for 10 mins`,
      message
    })
    console.log(user.email)
    res.status(200).json({
      status : "success",
      message :"Token is sent to email"
    })
  } catch (error) {
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save({validateBeforeSave : false})
    return next(new AppError("There was an error sending the email. Try again later"),500)
    
  }
}

exports.resetPassword = async(req,res,next) =>{
  //Get user base on Token given
  try {
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex")
  const user = await User.findOne({
    passwordResetToken:hashedToken, 
    passwordResetExpires:{$gt:Date.now()}
  })
    console.log(user)
  //If the token has not expired and the user still exist,set new Password
  if(!user){
    return next(new AppError("The token is invalid or has expired",400))
  }
  user.password = req.body.password
  user.confirmPassword = req.body.confirmPassword
  user.passwordResetToken = undefined
  user.passwordResetExpires = undefined
  await user.save()
  //update changePasswordAt property of the user
  // log in the user and send the JWT
  createSendToken(user,200,res)
   } catch (error) {
    console.log(error)
  }
  

}

exports.updateUserPassword = async(req,res,next)=>{

  // Get user from the collection
  const user = await User.findById(req.user.id).select("+password")

  // check whether the posted password is correct
  if(!(await user.correctPassword(req.body.currentPassword,user.password))){
    return next(new AppError("The password you supply is not correct", 401))
  }
  // if so, update the user
  user.password = req.body.password
  user.confirmPassword = req.body.confirmPassword
  await user.save()
    // log in the user and send the JWT
    createSendToken(user,200,res)
}