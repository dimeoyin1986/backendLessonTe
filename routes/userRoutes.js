const express = require("express")
const {
    signup,
    login,
    forgetPassword,
    resetPassword,
    updateUserPassword,
    protect,
    restrictTo,
} = require("../controllers/authController")





const router = express.Router()
const {
    getAllUsers,
    createOneUser,
    getOneUser,
    updateUser,
    deleteUser,
    updateMe,
    deleteMe,
    getMe,
    getMeNow

} = require("../controllers/userController")
const {createNewReview} = require("../controllers/reviewController")

router
.post("/my-signup",signup)
router
.post("/login",login)

router
.post("/forgetPassword",forgetPassword)
router
.patch("/resetPassword/:token",resetPassword)
// You must be loggin for you to use the API after this protect middleware below 
router.use(protect)
router.patch("/updateMyPassword",updateUserPassword)
router.patch("/updateMe",updateMe)
router.delete("/deleteMe",deleteMe)
router.get("/me",getMe, getOneUser)

// You must be loggin and ADMIN for you to use the API after this RESTRICTTO middleware below 
router.use(restrictTo("admin"))

router
    .route("/")
    .get(getAllUsers)
    .post(createOneUser)

router
    .route("/:id")
    .get(getOneUser)
    .patch(updateUser)// Do not update user with this!
    .delete(deleteUser)




  

module.exports = router;
