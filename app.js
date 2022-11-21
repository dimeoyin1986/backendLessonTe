
const morgan = require("morgan")
const rateLimit = require("express-rate-limit")
const helmet = require("helmet")
const mongoSanitize = require('express-mongo-sanitize');
const xss = require("xss-clean")
const hpp = require("hpp");
//Express JS is a Node.js framework designed to build API's web applications cross-platform mobile apps quickly and make node js easy.
// feature of express
//.1 middleware.:These are functions that modify requests before appropriates responses are given.
// 2. routing/creation of different handlers for different rquests
//3.presentation:This involves diplaying of data to be viewed by client or client side rendering 
//4.cnnnection of database to the application through the port
const AppError = require("./utils/appError")
const globalErrorController = require("./controllers/errorContoller")
const express = require("express")
const cors = require("cors")
const app = express();

const tourRouter = require("./routes/tourRoutes")
const userRouter = require("./routes/userRoutes")
const reviewRouter = require("./routes/reviewRoutes")

console.log(process.env.NODE_ENV)
// secure HTTP HEADER MIDDLEWARE
app.use(helmet())
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"))
}
// middleware: This a function that can modify incoming request data in other word is the middleman between the request object and response object.
app.use(cors())
app.use(express.json({limit : "10kb"}));

// Data sanitization against Nosql query injection
app.use(mongoSanitize())

//Data sanitization against xss
app.use(xss())

// prevent parameter pollution
app.use(hpp({
    whitelist:[
        "duration",
        "ratingsAverage",
         "ratingsAverage",
         "price",
         "maxGroupSize",
         "difficulty"
]
}))


app.use(express.static(`${__dirname}/public`))


// express.json() gives us access to the request body
//LIMIT NUMBER OF REQUEST
const limiter = rateLimit({
    max :100,
    windowMs:60 * 60 * 1000,
    message:"Too many requests from this IP,Please try again in an hour's time !"
})
app.use("/api", limiter)

app.use((req, res, next) => {
    console.log(`Hello from my custom middleware`);
    next()
})

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    console.log(req.headers)
  
    next();
})
app.use("/api/v1/tours", tourRouter)
app.use("/api/v1/users", userRouter)
app.use("/api/v1/reviews", reviewRouter)

app.all("*", (req,res,next)=>{
 next(new AppError((`Can not find ${req.originalUrl} on the server`),404))
})

app.use(globalErrorController)
//ROUTEHANDLER
module.exports = app;

//ROUTING is the way in which client request is been handled by application endpoints
