const mongoose = require("mongoose")
const Tour = require("./tourModel")
const { findOne } = require("./userModel")
const reviewSchema = new mongoose.Schema(
    {
        review :{
            type : String,
            required :[true,"Review must not be empty."]
        },
        rating :{
            type :Number,
            min: 1 ,
            max : 5
        },
        createdAt :{
            type : Date,
            default :Date.now()
        },

        tour : {
            type : mongoose.Schema.ObjectId,
            ref :"Tour",
            required :[true,"Review must belong to tour."]
        },
        user : {
            type : mongoose.Schema.ObjectId,
            ref :"User",
            required :[true,"Review must belong to user."]
        }
    },
    {
        toJSON :{virtuals:true},
        toObject:{virtuals: true}
    }
) 

reviewSchema.index({tour : 1 , user : 1},{unique : true})


reviewSchema.pre(/^find/, function(next){
    this.populate({
        path:"user",
        select: "name photo"
    })
    next()
})

reviewSchema.statics.calAverageRatings = async function(tourId){
    console.log(tourId)
  const stats = await this.aggregate([
        {
            $match : {tour : tourId}
        },
        
        {
            $group :{
                _id :"$tour",
                nRating : {$sum : 1},
                aveRating : {$avg : "$rating"}
            }
        }
    ])
    console.log(stats)
    if(stats.length > 0){
        await Tour.findByIdAndUpdate(tourId,{
            ratingsQuantity:stats[0].nRating,
            ratingsAverage: stats[0].aveRating 
        })
    } else{
        await Tour.findByIdAndUpdate(tourId,{
            ratingsQuantity:0,
            ratingsAverage: 4.5 
        })
    }
   
}

reviewSchema.post("save", function(){
    //this point to current review
   this.constructor.calAverageRatings(this.tour) 
  
})


// calAverageRatings for deleting and updating reviews
reviewSchema.pre(/^findOneAnd/, async function(next){
      this.editReview = await this.findOne().clone()
      console.log(this.editReview)
      next();
})

reviewSchema.post(/^findOneAnd/, async function(){
    //  this.r = await this.findOne() this does not work her because queryhas already been executed
   
   await this.editReview.constructor.calAverageRatings(this.editReview.tour)
})



const Review = mongoose.model("Review",reviewSchema)

module.exports = Review;