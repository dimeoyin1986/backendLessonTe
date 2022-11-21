const fs = require("fs")
require("dotenv").config();
const mongoose = require("mongoose")
const Tour =require("../../models/tourModel")
const User = require("../../models/userModel")
const Review = require("../../models/reviewModel")



// dotenv.config({ path: "./env" })
// console.log(process.env)
const port = process.env.PORT
//db
mongoose
.connect(process.env.DATABASE_LOCAL,{ useNewUrlParser: true})
.then(console.log(`The DB is connected`))

// READING JSON FILE
// THIS IS JSON
// const tours = fs.readFileSync("./tours-simple.json", "utf-8");
// convert into JAVASCRIPT OBJECT
const  tours = JSON.parse(fs.readFileSync("./dev-data/data/tours-simple.json","utf-8"))
const  users = JSON.parse(fs.readFileSync("./dev-data/data/users.json","utf-8"))
const  reviews = JSON.parse(fs.readFileSync("./dev-data/data/reviews.json","utf-8"))

// IMPORT DATA INTO DATABASE
const importData = async () => {
    try {
        await Tour.create(tours);
        await User.create(users, {validateBeforeSave : false});
        await Review.create(reviews);
        console.log(`Data is successful loaded!`)
        
    } catch (error) {
        console.log(error)
    }
}

// data from database collection
const deleteData = async ()=>{
    try {
        await Tour.deleteMany()
        await User.deleteMany()
        await Review.deleteMany()
        console.log({message:"data successfully deleted"})
    } catch (error) {
        console.log(error)
    }
}

// (process.argv[2] ==="--import")? importData() : deleteData()
if(process.argv[2]==="--import"){
    importData();
} else if(process.argv[2]==="--delete"){
    deleteData()
}
    

console.log(process.argv)
   // for importing data
//   node dev-data/data/import-dev-data.js --import
//   node dev-data/data/import-dev-data.js --delete