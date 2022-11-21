const User = require("../models/userModel")
const jwt = require("jsonwebtoken")
const AppError = require("../utils/appError")
const catchAsync = require("../utils/catchAsync")
const {deleteOne,updateOne, getOne, getAll} = require("./handlerFactoryFuncController")


const filterObj = (obj,...allowedField)=>{
    const newObj = {}
    Object.keys(obj).forEach(el =>{
        if(allowedField.includes(el)) newObj[el] = obj[el]
    })
      return newObj;
}

exports.getMe = (req,res,next) =>{
    req.params._id =  req.user.id
      next();
  }

//   exports.getMeNow = async(req,res,next)=>{
//     console.log(req,params)
//     //  req.params.id = req.user.id
//     // const myUser = await User.findById(req.params.id )
//     // console.log(myUser)
//     // res.status(200).json({
//     //     status : "success",
//     //      data : {
//     //         data: myUser
//     //      }
//     // })
//   }

exports.updateMe = async (req,res,next) =>{
 // create error if user post password and confirmPassword
 if(req.body.password || req.body.confirmPassword){
return next(new AppError("This route is not for password update,try /updateMyPassword ",401))
 }

 //update user document
 const filteredBody = filterObj(req.body, "name", "email")
 const updateUser = await User.findByIdAndUpdate(req.user.id, 
    filteredBody , {
    new:true,
    runValidators:true
})
 res.status(200).json({
    status : "success",
    user : updateUser
 })
}

exports.deleteMe = async(req, res,next) =>{
    try {
       await User.findByIdAndUpdate(req.user.id, {active : false})
       res.status(204).json({
        status : "success",
        data: null
       }) 
    } catch (error) {
        
    }

}
// exports.getAllUsers = catchAsync ( async (req , res , next) => {

//    const users = await User.find();
//     res.status(200).json({
//         status:"success",
//         numResults: users.length,
//         RequestedAt: req.requestTime, 
//         userData : {
//             users
//         }
//     })
// })

exports.createOneUser = (req, res) => {
    
    res.status(500).json({
        status: "error",
        message: "This route does not exist please use my-signup!🤦‍♂️🤦‍♀️"
    })
}


// exports.getOneUser =(async (req, res) => {
//     const user = await User.findById(req.params.id)
     
//     if(!user){
//         return next(new AppError(("No user has this ID"),404))
//      }
//      res.status(200).json({
//         // status: "success",
//         data: {
//             user
//         }
//     })
// })

// exports.updateOneUser = (req, res) => {
//     res.status(500).json({
//         status: "error",
//         message: "This route is not yet defined!🤦‍♂️🤦‍♀️"
//     })
// }

// exports.deleteUser = (req, res) => {
//     res.status(500).json({
//         status: "error",
//         message: "This route is not yet defined!🤦‍♂️🤦‍♀️"
//     })
// }



exports.getAllUsers = getAll(User)

exports.getOneUser = getOne(User)

exports.updateUser = updateOne(User)

exports.deleteUser = deleteOne(User)