const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name:String,
    email:String,
    password:String,
    phone:Number,
    address:String,
    gender:String
})


const usermodel = mongoose.model("users", UserSchema);
module.exports = usermodel;

