var mongoose    = require("mongoose");
//mongoose.connect("mongodb://localhost/yelp_camp");

var mongooseSchema = new mongoose.Schema({
    name:String,
    img:String,
    desc:String,
    price:String,
    location:String,
    lat:Number,
    lng:Number,
    comments:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Comment"
    }],
    author:{
        id:{
            type: mongoose.Schema.Types.ObjectId,
            ref:"user"
            },
            username:String
    }
});

module.exports =  mongoose.model("campground",mongooseSchema);