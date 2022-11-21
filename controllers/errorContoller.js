







module.exports = (err,req,res,next)=>{
    // console.log(err.stack)
     err.statusCode = err.statusCode || 500;
     err.status = err.status || "error";
     if(process.env.NODE_ENV === "development"){

     }
     res.status(err.statusCode).json({
        status : err.status ,
        message : err.message
     })
     next()
}