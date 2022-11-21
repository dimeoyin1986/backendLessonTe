const catchAsync = require("../utils/catchAsync")
const AppError = require("../utils/appError")
const { Model } = require("mongoose")
const APIFeatures = require("../utils/apiFeature")
// Closure in action

exports.deleteOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id)
    console.log(doc)
 
    if(!doc){
     return next(new AppError(("No document has this ID"),404))
  }
     res.status(204).json({
         status: "success",
         data: null
         
     })
 
    
 
 })


 exports.updateOne = Model =>catchAsync(async(req, res, next) => {
    const doc =await Model.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators:true
     })

      if(!doc){
       return next(new AppError(("No Document has this ID"),404))
    }
        res.status(200).json({
            status: "success",
            data: {
              data : doc
            } 
            
        })


})


exports.createOne = Model => catchAsync(async (req, res,next) => {
    const newDoc = await Model.create(req.body)
           res.status(201).json({
             status: "success",
             data: {
                 data: newDoc
             }
         })
   })


   exports.getAll = Model =>  catchAsync(async(req, res, next) => {
    // To allow for nested get Review on Tour
    let filter = {};
    if (req.params.tourId) filter = {tour : req.params.tourId}
    const newFeatures = new APIFeatures(Model.find(filter),req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate()
    // const doc = await newFeatures.query.explain();
    const doc = await newFeatures.query;
   
      return res.status(200).json({
            status: "success",
            numResults: doc.length,
            RequestedAt: req.requestTime,
            data: {
               data: doc
            }
        })
})


   exports.getOne = (Model,popOption) =>catchAsync(async(req, res,next) => {
    let query =  Model.findById(req.params.id)
    if(popOption) query = query.populate("reviews")
     const doc = await query;

    if(!doc){
       return next(new AppError(("No document has this ID"),404))
    }
    // const specificTour= await Tour.findById({_id:req.params.id})
     res.status(200).json({
        // status: "success",
        data: {
           data : doc
        }
    }) 

})
