var express = require("express");
var router = express.Router();
var CampGround      = require("../models/campground");
var middleware = require("../middleware");
var NodeGeocoder = require("node-geocoder");

var options = {
    provider:'google',
    httpAdapter:'https',
    apiKey:process.env.GEOCODER_API_KEY,
    formatter:null
};
var geocoder = NodeGeocoder(options); 
router.get("/campground",function(req, res) {
   res.redirect("/campground/page/1"); 
});
router.get("/campground/page/:pageNumber",function(req,res){
                var noMatch = null;
                
    if(req.query.search) {
        console.log(req.query.search);
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        // Get all campgrounds from DB
        CampGround.find({name: regex}).count(function(err,cnt){
                   if(err){
                       console.log(err);
                   }else{
                       var count = cnt;
                       var pages;
                       var pageNumber = req.params.pageNumber;
                       
                       if(count%20!=0){
                           pages = Math.floor(count/20)+1;
                       }else{
                           pages = count/20;
                       }
                       if(pageNumber<=0){
                           pageNumber = 1;
                       }else if(pageNumber>=pages){
                           pageNumber = pages;
                       }
                       if(count==0){
                            noMatch = "No campgrounds match that query, please try again.";

                       }
                       CampGround.find({name: regex}).limit(20).skip((pageNumber-1)*20).exec(function(err,camps){
                          if(err){
                              console.log(err);
                          } else{
                              
                              res.render("campground/campground",{keywords:req.query.search,campground:camps,pages:pages,pageNumber:pageNumber,noMatch:noMatch});
                          }
                       });
                        

                   } 
                });
      
    } else {
        CampGround.find().count(function(err,cnt){
                   if(err){
                       console.log(err);
                   }else{
                       var count = cnt;
                       var pages;
                       var pageNumber = req.params.pageNumber;
                       
                       if(count%20!=0){
                           pages = Math.floor(count/20)+1;
                       }else{
                           pages = count/20;
                       }
                       if(pageNumber<=0){
                           pageNumber = 1;
                       }else if(pageNumber>=pages){
                           pageNumber = pages;
                       }
                                              
                       CampGround.find().limit(20).skip((pageNumber-1)*20).exec(function(err,camps){
                          if(err){
                              console.log(err);
                          } else{
                              
                              res.render("campground/campground",{keywords:req.query.search,campground:camps,pages:pages,pageNumber:pageNumber,noMatch:noMatch});
                          }
                       });
                        

                   } 
                });
    }
       
                
                
                      
      
       
});
router.post("/campground",middleware.isLoggedIn,function(req,res){
    var name = req.body.name;
    var img = req.body.img;
    var desc = req.body.desc;
    var price = req.body.price;
    var author =  {
        id : req.user._id,
        username : req.user.username
    };
    geocoder.geocode(req.body.location,function(err,data){
       if(err||!data.length){
           req.flash("err","Invalid address");
           return res.redirect('back');
       } else{
           //console.log(data[0]);
           //console.log(data[1]);
           var lat = data[0].latitude;
           var lng = data[0].longitude;
           var location = data[0].formattedAddress;
        var newCamp =  {name:name,img:img,desc:desc,price:price,location:location,lat:lat,lng:lng,author:author}; 
    
    CampGround.create(newCamp,function(err,camp){
       if(err){
           console.log(err);
       }else{
           res.redirect("campground");
       }
    });
       }
    });
   
    
});
router.get("/campground/:id",function(req,res){
   CampGround.findById(req.params.id).populate("comments").exec(function(err,foundCamp){
       if(err){
           console.log(err);
       }else{
           res.render("campground/show",{camp:foundCamp});
       }
   });
});
router.get("/campground/:id/edit",middleware.checkCampgroundOwnership,function(req,res){
   CampGround.findById(req.params.id,function(err, foundedCamp) {
       if(err){
           console.log(err);
       }else{
           res.render("campground/edit",{camp:foundedCamp});
       }
   });
   
});
router.put("/campground/:id/",middleware.checkCampgroundOwnership,function(req,res){
    var name = req.body.campground.name;
    var price = req.body.campground.price;
    var img = req.body.campground.img;
    var desc = req.body.campground.desc;
    var author = req.body.campground.author;
    geocoder.geocode(req.body.location,function(err,data){
       if(err||!data.length){
           req.flash("err","Invalid address");
           return res.redirect('back');
       } else{
            var lat = data[0].latitude;
           var lng = data[0].longitude;
           var location = data[0].formattedAddress;
        var newCamp =  {name:name,price:price,img:img,desc:desc,author:author,location:location,lat:lat,lng:lng}; 
    
    CampGround.findByIdAndUpdate(req.params.id,newCamp,function (err,foundCamp){
      if(err){
          res.redirect("/campground");
      }else{
            res.redirect("/campground/"+req.params.id);
      } 
   });
       }
    });
    
   
});
router.delete("/campground/:id",middleware.checkCampgroundOwnership,function(req,res){
   CampGround.findByIdAndRemove(req.params.id,function(err){
       console.log(req.params.id);
       if(err){
           res.redirect("/campground");
       }else{
           res.redirect("/campground");
       }
   }) ;
});
router.get("/add",middleware.isLoggedIn,function(req,res){
   res.render("campground/add"); 
});

function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }else{
        res.redirect("/login");
    }   
}
function checkCampgroundOwnership(req,res,next){
    if(req.isAuthenticated()){
        CampGround.findById(req.params.id,function(err,foundedCamp){
            if(foundedCamp.author.id.equals(req.user._id)){
                next();
            }else{
                res.redirect("back");
            }
        });
        }
    else{
        res.redirect("back");
    }
}
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};
module.exports = router;