
// steps to create router middleware
// 1. import express application of object
// 2. use the express object to get Router object  and assign it to a variable (router)
// import the controllers
// export the route

const express = require("express")
const router = express.Router()
//destructuring allows us extract elements in an array or object into individual variable

const { getAllTours,
    postATour,
    getASpecificTour,
    updateTour,
    deleteTour,
    // checkId,
    checkBody,
    aliasTopToursMiddleware,
    getTourStats,
    getMonthlyPlan,
    getTourWithin,
    getDistances
} = require("../controllers/tourController")

const { protect,restrictTo }= require("./../controllers/authController")
// const {createNewReview} = require("../controllers/reviewController")
const reviewRouter = require("../routes/reviewRoutes")

router.use("/:tourId/reviews", reviewRouter)


     // POST /tour/234rdf/reviews
    // GET /tour/234rdf/reviews
   // GET /tour/234rdf/reviews/HD1223HJT
//    router.route("/:tourId/reviews").post(protect,restrictTo("user"),createNewReview)

// router.param(`id`, checkId)
// router.param(`id`, (req, res, next, val) => {
//     console.log(`Tour id : ${val}`)
// })


// create middleware that checkBody
// check if it contain name or price
//if not send 400(bad request)
//add it post handler stack

router
.route("/top-num-cheap-route")
.get( aliasTopToursMiddleware,getAllTours)

router
.route("/tour-stats")
.get(getTourStats)

router
.route("/monthly-plan/:year")
.get( protect, restrictTo("admin","lead-guide" ,"guide"),getMonthlyPlan)


router.route("/tours-within/:distance/center/:latlng/unit/:unit").get(getTourWithin)
router.route("/distances/:latlng/unit/:unit").get(getDistances)

router
    .route("/")
    .get(getAllTours)
    .post(protect,restrictTo("admin","lead-guide"), postATour)
    // .post(checkBody, postATour)

router
    .route("/:id")
    .get(getASpecificTour)
    .patch(protect, restrictTo("admin","lead-guide"), updateTour)
    .delete(protect, restrictTo("admin","lead-guide"), deleteTour)

      // POST /tour/234rdf/reviews
    // GET /tour/234rdf/reviews
   // GET /tour/234rdf/reviews/HD1223HJT
//    router.route("/:tourId/reviews").post(protect,restrictTo("user"),createNewReview)

module.exports = router;
