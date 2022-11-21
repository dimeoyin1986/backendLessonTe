// const dotenv = require("dotenv")
require("dotenv").config();
const app = require("./app")
const mongoose = require("mongoose")



// dotenv.config({ path: "./env" })
// console.log(process.env)
const port = process.env.PORT
//db
mongoose
.connect(process.env.DATABASE_LOCAL,{ useNewUrlParser: true})
.then(console.log(`The DB is connected`))





app.listen(port, () => {
    console.log(`The app is listen on port ${port}...`)
})

// test