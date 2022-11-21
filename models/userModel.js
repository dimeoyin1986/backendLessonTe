const crypto = require("crypto") //is a built in module that need no installation
const mongoose = require("mongoose")
const validator = require("validator");
const bcrypt  = require("bcryptjs");

const userSchema = new mongoose.Schema({
    name :{
        type : String,
        required :[true,"A user must a name"],
        unique:true,
        trim: true,
        maxLength : [40," A user must have less than or equal 40 characters"],
        minLength : [10," A user must have more than or equal 10 characters"],
       

    },
   
    // _id :Object,
    email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        required: 'Email address is required',
        validate: [validator.isEmail, 'Please fill a valid email address'],
    },
    photo :{
        type : String,
    },
    role:{
       type :String,
       enum : ["user","guide","lead-guide", "admin"],
       default : "user"
    },
    password: {
        type : String,
        required : [true, "Password is required"],
        minLength : 8,
        select : false

    },
    confirmPassword :{
        type : String,
        required : [true, "You need to confirm the password supply"],
        validate : {
            // this only work on save or create
            validator : function(e){
                return e === this.password
            },
            message: `comfirmPassword is not the same as the password`
        }
    },
    passwordChangedAt: Date,
    passwordResetToken : String,
    passwordResetExpires: Date,
    active :{
        type : Boolean,
        default : true,
        select: false
    }
      
})

userSchema.pre("save",function(next){
    if(!this.isModified("password") || this.isNew)return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
})

userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next
   this.password = await bcrypt.hash(this.password,12) 
   this.confirmPassword = undefined
   next();
})

userSchema.methods.correctPassword = async function(candidatePassword, userPassword){
   const comparedPassword = await bcrypt.compare(candidatePassword, userPassword);
   return comparedPassword;
}
userSchema.methods.changedPasswordAfter = function(JWTTimeStamp){
    
   if(this.passwordChangedAt){
    const changedTimeStamp =  parseInt(this.passwordChangedAt.getTime()/1000,10)
     console.log(changedTimeStamp,JWTTimeStamp)
     return JWTTimeStamp < changedTimeStamp // 100 < 200 (true) [password change] 200 < 100(false)[password not changed]
   }
   //password  Not changed
    return  false
}


userSchema.methods.createPasswordResetToken = function(){
    const resetToken = crypto.randomBytes(32).toString("hex")
    this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex")
    this.passwordResetExpires= Date.now() + 10 * 60
    * 1000
    console.log({resetToken},this.passwordResetToken)
    return resetToken
}

userSchema.pre(/^find/, function(next){
    // this point to the current query
    this.find({active:{$ne: false}})
    next()
})


const User = mongoose.model("User",userSchema)
 module.exports = User;