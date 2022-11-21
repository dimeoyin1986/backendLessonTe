const mongoose = require("mongoose")
const slugify = require("slugify");
const validator = require("validator")
// const User = require("./userModel");



// simple schema:is the blueprint of a database
// A DATABASE MODEL is a Collection of Concepts that can be use to describe the Structure of Database.This description of structure of a database is DATABASE SCHEMA. This concepts arr referred to as attributes,relation to other tables and other models and the constraints 

const tourSchema = new mongoose.Schema({
    name: {
        type:String,
        required :[true,"A tour must a name"],
        unique:true,
        trim: true,
        maxLength : [40," A tour must have less than or equal 40 characters"],
        minLength : [10," A tour must have more than or equal 10 characters"]
       
    },
    duration:{
        type:Number,
        required:[true,"A Tour must a duration"]
    },
    ratingsAverage : {
        type:Number,
        default: 4.2,
         set : newVal => Math.round(newVal * 10)/10
        // min:[1, "Rating should be equal or above 1,"],
        // min:[5, "Rating should be equal or below 5,"]
    },
    ratingsQuantity:{
        type: Number,
        default: 0
    },
    maxGroupSize:{
        type: Number,
        required : [true, "A tour must have group size"]
    },
    difficulty:{
        type: String,
        required: [true,"A tour must have a difficulty"],
        enum: {
            values : ["difficult","medium", "easy"],
            message:"Difficulty should either: easy medium or difficulty"
        }
    },
    price:{
        type: Number,
        required:[true,"A tour must a price"]
    },
    priceDiscount:{
       type: Number,
         validate: {
            // this only point to current doc on new document creation
            validator: function(val){
                return val < this.price ;
            },
            message: "Discount price ({VALUE}) should be less than the actual price"
         }
        
    },
    summary:{
        type :String,
        trim: true,
        required:[true,"summary of the is required"]
    },
    description:{
        type: String,
        trim:true
    }, 
    imageCover:{
        type: String,
        trim: true
     },
     slug :String,
     secretTour : {
        type: Boolean,
        default : false
     },
     images :[String],
     createdAt:{
        type : Date,
        default:Date.now(),
        select: false
     },
     startDates:[Date],
     startLocation:{
        // GEOJSON
        type :{
            type : String,
            default:"Point",
            enum :["Point"]

        },
        coordinates : [Number],
        address: String,
        description :String
    },
    locations : [
        {
            type :{
                type : String,
                default:"Point",
                enum :["Point"]
    
            },
            coordinates : [Number],
            address: String,
            description :String ,
            day : Number
        }
    ],
    guides: [
        {
            type : mongoose.Schema.ObjectId,
            ref : "User"
        }
    ],
   
},

  

{
    toJSON :{virtuals:true},
    toObject:{virtuals: true}
})


tourSchema.index({price : 1, ratingsAverage :1})
tourSchema.index({slug : 1})
tourSchema.index({startLocation : "2dsphere"})
tourSchema.virtual("durationWeeks").get(function(){
    return this.duration/7
})

// Virtual populate
tourSchema.virtual("reviews", {
    ref : "Review",
    foreignField:"tour",
    localField: "_id"
})

// DOCUMENT MIDDLEWARES RUN BEFORE .save() and .create()
// tourSchema.pre("save",function(next){
//     this.slug = slugify(this.name, {lower : true})
//     next()
// })
// tourSchema.post("save",function(doc,next){
//     console.log(doc),
//     next();
// })

// EMBEDDING USERS IN THE TOURS MODEL
// tourSchema.pre("save", async function(next){
//  const guidesPromises = this.guides.map(async id => await User.findById(id))
//   this.guides = await Promise.all(guidesPromises)

//     next()
// })



//QUERY MIDDLEWARE
// tourSchema.pre("find",function(next){
//     this.find({secretTour: {$ne : true}})
//     next();
// })

//  tourSchema.pre("findOne",function(next){
//     //     this.find({secretTour: {$ne : true}})
//     //     next();
//     // })

tourSchema.pre(/^find/,function(next){
    this.find({secretTour: {$ne : true}})
    this.start = Date.now()
    next();
})
tourSchema.pre(/^find/, function(next){
    this.populate({
        path:"guides",
        select: "-__v -passwordChangedAt"
    })
    next()
})


tourSchema.post(/^find/,function(docs,next){
    console.log(`query took ${Date.now() - this.start} milliseconds!`)
  
    next();
})

// tourSchema.pre("aggregate",function(next){
//     this.pipeline().unshift({$match : {secretTour : {$ne: true}}})
//       console.log(this.pipeline())
//     next()
// })


const Tour = mongoose.model("Tour",tourSchema)
module.exports = Tour;

// const testTour2 = new Tour({
//     name:"AbdiRahmon The Friend ALlaah",
//     rating:7.7,
//     price:200
// })
//  testTour2.save().then(doc=>{
//     console.log(doc);

//  }).catch(err=>{
//     console.log("ERROR🤦‍♀️:",err)
//  })