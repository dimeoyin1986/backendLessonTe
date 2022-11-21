const express = require("express")
const router = express.Router({mergeParams: true })

// POST /tour/234rdf/reviews
// POST /reviews
// the above are merged by mergeParams: true

const {
    protect,
    restrictTo
} = require("../controllers/authController")

const {
    createNewReview,
    getAllReviews,
    deleteReview,
    updateReview,
    setTourUserIds,
    getReview,

} = require("../controllers/reviewController")

router.use(protect)

router
.route("/")
.get(getAllReviews)
.post(restrictTo("user"), setTourUserIds , createNewReview)

router
.route("/:id")
.delete(restrictTo("user"),deleteReview).patch(restrictTo("user"),updateReview).get(getReview)



module.exports = router;