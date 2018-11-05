var CampGround = require("../models/campground");
var Comment = require("../models/comment");
var middleObj = {
    checkCampgroundOwnership:function (req,res,next){
    if(req.isAuthenticated()){
        CampGround.findById(req.params.id,function(err,foundedCamp){
            if(foundedCamp.author.id.equals(req.user._id)){
                next();
            }else{
                req.flash("error","You don't have permission to do that");
                res.redirect("back");
            }
        });
        }
    else{
        req.flash("error","You need to login");
        res.redirect("back");
        }
    },
  isLoggedIn:function (req,res,next){
    if(req.isAuthenticated()){
        return next();
    }else{
        req.flash("error","You need to login");
        res.redirect("/login");
    }   
  },
  checkCommentOwnership:function (req,res,next){
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id,function(err,foundComment){
            if(foundComment.author.id.equals(req.user._id)){
                next();
            }else{
                req.flash("error","You don't have permission to do that");
                res.redirect("back");
            }
        });
        }
    else{
        req.flash("error","You need to login");
        res.redirect("back");
    }
}
};

module.exports = middleObj;