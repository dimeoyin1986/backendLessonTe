const Review = require("../models/reviewModel")
// const AppError = require("../utils/appError")
// const catchAsync = require("../utils/catchAsync")
const {deleteOne,updateOne, createOne, getOne, getAll} = require("./handlerFactoryFuncController")

// exports.getAllReviews = catchAsync ( async (req , res , next) => {
//       let filter = {};
//   if (req.params.tourId) filter = {tour : req.params.tourId}
//     const reviews = await Review.find(filter );
//      res.status(200).json({
//          status:"success",
//          numResults: reviews.length,
//          RequestedAt: req.requestTime, 
//          reviewData : {
//              reviews
//          }
//      })
//  })

exports.setTourUserIds = (req,res,next) =>{
    // Nested routes
    if(!req.body.tour) req.body.tour = req.params.tourId
    // We get user from protect middleware
    if(!req.body.user) req.body.user = req.user.id
    next();
}

exports.getAllReviews = getAll(Review)

exports.getReview = getOne(Review)

exports.createNewReview = createOne(Review)


exports.updateReview = updateOne(Review)

exports.deleteReview = deleteOne(Review)