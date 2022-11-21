// const fs = require("fs");
const Tour = require("../models/tourModel")
const APIFeatures = require("../utils/apiFeature")
const catchAsync = require("../utils/catchAsync")
const AppError = require("../utils/appError")

const {deleteOne,updateOne, createOne, getOne, getAll} = require("./handlerFactoryFuncController")

exports.aliasTopToursMiddleware = (req,res,next)=>{
  
     req.query.limit = "5";
     req.query.sort="-ratingsAverage,price"
     req.query.fields= "name,price,ratingAverage,summary,difficulty"
     next();

}

// const tours = JSON.parse(fs.readFileSync("./dev-data/data/tours-simple.json"))


// exports.checkId = (req, res, next, val) => {
//     console.log(`Tour id : ${val}`)
//     if (req.params.id > tours.length) {
//         return res.status(404).json({
//             status: "Fail",
//             message: "Invalid Id"
//         })
//     }
//     next();
// }

// exports.checkBody = (req, res, next) => {
//     if (!req.body.name || !req.body.price) {
//         return res.status(400).json({
//             status: "Fail",
//             message: "Missing name or price"
//         })
//     }
//     next();
// }







// exports.getASpecificTour = catchAsync(async(req, res,next) => {
//     const tour = await Tour.findById(req.params.id).populate("reviews")

//     if(!tour){
//        return next(new AppError(("No tour has this ID"),404))
//     }
//     // const specificTour= await Tour.findById({_id:req.params.id})
//      res.status(200).json({
//         // status: "success",
//         data: {
//             tour
//         }
//     }) 

// })





// exports.updateTour = catchAsync(async(req, res, next) => {
//     const tour =await Tour.findByIdAndUpdate(req.params.id,req.body,{
//         new:true,
//         runValidators:true
//      })

//       if(!tour){
//        return next(new AppError(("No tour has this ID"),404))
//     }
//         res.status(200).json({
//             status: "success",
//             data: {
//                 tour
//             }
//         })


// })




exports.getAllTours =getAll(Tour)
exports.getASpecificTour = getOne(Tour,{ path: "reviews" })
exports.postATour = createOne(Tour)
exports.updateTour = updateOne(Tour)
exports.deleteTour = deleteOne(Tour)




// exports.deleteTour = catchAsync(async (req, res, next) => {
//    const tour = await Tour.findByIdAndDelete(req.params.id)
//    console.log(tour)

//    if(!tour){
//     return next(new AppError(("No tour has this ID"),404))
//  }
//     res.status(204).json({
//         status: "success",
//         data: {
//             tour: null
//         }
//     })

   

// })


exports.getTourStats = catchAsync (async (req , res, next) => {
    const stats = await Tour.aggregate([
        {
            $match: {
                ratingsAverage :{$gte : 3.5}
            }
        },
        {
            $group:{
               _id : { $toUpper:"$difficulty"},
            // _id : "$ratingsAverage",
               numTours : {$sum: 1},
               numOfRrating :{$sum:"$ratingsQuantity"},
               aveRating : {$avg : "$ratingsAverage"},
               avePrice : {$avg : "$price"},
               minPrice: {$min : "$price"},
               maxPrice: {$max : "$price"}
            }
        },
        {
            $sort: {avePrice:1}
        }


     ])

     res.status(200).json({
        status: "success",
        data: {
            stats
        }
    })
})


exports.getMonthlyPlan = catchAsync(async(req , res, next ) =>{
    const year = req.params.year  * 1;
    console.log(year)
    
    const plan = await Tour.aggregate([
        {
            $unwind : "$startDates"
        },
         {
            $match: {
               startDates :{
                $gte : new Date(`${year}-01-01`),
                $lte:  new Date(`${year}-12-31`)
               }
            }
         },
         {
            $group :{
                _id :{
                    $month : "$startDates"
                },
                numOfTourStart: {
                    $sum : 1
                },
                namesTours :{
                    $push :"$name"
                },
              
            }
         },
         {
            $addFields :{
                month : "$_id"
            }
         },
         {
            $project :{
                _id :0
            }
         },
         {
            $sort : {
                numOfTourStart :-1
            }
         },
         {
            $limit:12
         }
    ])
  

    res.status(200).json({
        status: "success",
        result : tour.length,
        data: {
          plan
        }
    }) 
})

///tours-within/:distance/center/:latlng/unit/:unit
//tours-within/344/center/6.508734, 3.189431/unit/mi
exports.getTourWithin = catchAsync (async(req,res,next)=>{

    const { distance, latlng , unit } = req.params
    const [lat,lng] = latlng.split(",")
     const radius = unit === "mi" ? distance/3963.2 : distance/6378.1
    if(!lat || !lng ){
      return  next(new AppError("Please provide the latitude and longitude in the format lat,lng.",400))
    }
    const tours = await Tour.find({
        startLocation : { $geoWithin :  {$centerSphere : [[lng,lat],radius]}}
    })
    res.status(200).json({
        status : "success",
        result :tours.length,
        data:{
            data: tours
        }
    })

})


exports.getDistances = catchAsync(async (req,res,next)=>{
    const {  latlng , unit } = req.params
    const [lat,lng] = latlng.split(",")

    const multiplier = unit === "mi" ? 0.000621371 : 0.001
    if(!lat || !lng ){
      return  next(new AppError("Please provide the latitude and longitude in the format lat,lng.",400))
    }
  const distances = await Tour.aggregate([
    {
        $geoNear :{
            near : {
                type :"Point",
                coordinates:[lng*1,lat*1]
            },
            distanceField : "distance",
            distanceMultiplier: multiplier
        }
       
    },
    {
        $project : {
            distance : 1,
            name: 1
        }
    }
  ])

  res.status(200).json({
    status : "success",
  
    data:{
        data: distances
    }
})
})