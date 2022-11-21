  const queryObj = {...req.query}
     const excludedFields = ["page","sort","limit","fields"];
     excludedFields.forEach(e => delete queryObj[e])
     // using advance query
        let queryStr = JSON.stringify(queryObj)
      queryStr =  queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match =>`$${match}`)
     
     let query =  Tour.find(JSON.parse(queryStr))
     sorting
      if(req.query.sort){
        const sortBy = req.query.sort.split(",").join(" ")
        query = query.sort(sortBy)
      }else{
        query=query.sort("-createdAt")
      }
      if(req.query.fields){
        const fields =req.query.fields.split(",").join(" ")
         query = query.select(fields)
      }else{
        query=query.select("-__v");
      }
      // pagination
      const page = req.query.page*1 || 1;
      console.log(page)
      console.log(typeof page)
      const limit = req.query.limit*1 || 100;
       console.log(typeof limit)

      console.log(limit)
      
      const skip = (page-1)*limit
      console.log(skip)
         query = query
         .skip(skip)
         .limit(limit)
         if(req.query.page){
            const numOfTours = await Tour.countDocuments();
            if(skip >= numOfTours) throw new Error("This page does not exist")
         }

//BEFORE
         // const fs = require("fs");
const Tour = require("../models/tourModel")
const APIFeatures = require("../utils/apiFeature")
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





exports.getAllTours = async(req, res) => {
  try {
    const newFeatures = new APIFeatures(Tour.find(),req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate()
    const tours = await newFeatures.query;
   
        res.status(200).json({
            status: "success",
            numResults: tours.length,
            RequestedAt: req.requestTime,
            data: {
                tours
            }
        })
  } catch (err) {
     res.status(404).json({
        status:"fail",
        message:err
     })
  }
}

exports.getASpecificTour = async(req, res) => {
    try {
        const specificTour = await Tour.findById(req.params.id)
        // const specificTour= await Tour.findById({_id:req.params.id})
        console.log(specificTour)
        res.status(200).json({
            // status: "success",
            data: {
                specificTour
            }
        }) 
    } catch (err) {
        res.status(404).json({
            status: "Fail",
            message:err
        })
    }

}

const catchAsync = fn =>{
 return (req,res,next)=>{
        fn(req,res,next).catch(err => next(err))
    }
   
}

exports.postATour =  catchAsync(async (req, res,next) => {
//  const newTour = new Tour({})
        //  newTour.save()
 const newTour = await Tour.create(req.body)
        res.status(201).json({
          status: "success",
          data: {
              tour: newTour
          }
      })

    // try {
       
        
    // } catch (err) {
    //     res.status(400).json({
    //         status: "fail",
    //         message:err
    //     })
    // }
    


})

exports.updateTour = async(req, res) => {
    try {
        const tour =await Tour.findByIdAndUpdate(req.params.id,req.body,{
            new:true,
            runValidators:true
         })
            res.status(200).json({
                status: "success",
                data: {
                    tour
                }
            }) 
    } catch (err) {
        res.status(400).json({
            status: "fail",
            message:err
        })
    }


}
exports.deleteTour =async (req, res) => {
try {
    await Tour.findOneAndDelete(req.params.id)
    res.status(204).json({
        status: "success",
        data: {
            tour: null
        }
    })
    
} catch (err) {
    res.status(400).json({
        status: "fail",
        message:err
    })
}

   

}


exports.getTourStats = async (req , res) => {
   try {
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

    
   } catch (err) {
    res.status(400).json({
        status: "fail",
        message:"oh! you can not delete"
    })
   }
}


exports.getMonthlyPlan = async(req , res ) =>{
    try {
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
        console.log(plan)

        res.status(200).json({
            status: "success",
            data: {
              plan
            }
        }) 
    } catch (err) {
        res.status(400).json({
            status: "fail",
            message:err
        })
    }
}