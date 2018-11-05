var mongoose = require("mongoose");
var passportLocalmongoose    = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
    username:String,
    password:String
});

userSchema.plugin(passportLocalmongoose);

module.exports = mongoose.model("user",userSchema);