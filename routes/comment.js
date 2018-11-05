var express = require("express");
var router = express.Router();
var CampGround      = require("../models/campground");
var Comment         = require("../models/comment");
var middleware = require("../middleware");
router.post("/campground/:id/comment",middleware.isLoggedIn,function(req,res){
   CampGround.findById(req.params.id,function(err,camp){
       if(err){
           console.log(err);
       }else{
           Comment.create(req.body.comment,function(err,comment){
              if(err){
                  console.log(err);
              } else{
                  comment.author.id = req.user._id;
                  comment.author.username = req.user.username;
                  comment.save();
                  camp.comments.push(comment);
                  camp.save(function(err){
                      if(err){
                          console.log(err);
                      }else{
                          res.redirect("/campground/"+camp._id);
                      }
                  });
              }
           });
       }
   }) ;
});
router.get("/campground/:id/comment/new",middleware.isLoggedIn,function(req,res){
    CampGround.findById(req.params.id,function(err,camp){
       if(err){
           console.log(err);
       } else{
           res.render("comment/new",{camp:camp});
       }
    });
});
router.get("/campground/:id/comment/:comment_id/edit",middleware.checkCommentOwnership,function(req,res){
    Comment.findById(req.params.comment_id,function(err, foundedComment) {
        if(err){
            res.redirect("back");
        }else{
            res.render("comment/edit",{campId:req.params.id,comment:foundedComment});
        }
    });
});
router.put("/campground/:id/comment/:comment_id",middleware.checkCommentOwnership,function(req,res){
   
   Comment.findByIdAndUpdate(req.params.comment_id,req.body.comment,function(err,foundedComment){
       if(err){
           res.redirect("/campground/"+req.params.id);
       }else{
           res.redirect("/campground/"+req.params.id);
       }
   }) ;
});
router.delete("/campground/:id/comment/:comment_id",middleware.checkCommentOwnership,function(req,res){
   Comment.findByIdAndRemove(req.params.comment_id,function(err){
       if(err){
           res.redirect("/campground/"+req.params.id);
       }else{
           res.redirect("/campground/"+req.params.id);
       }
   }) ;
});
function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }else{
        res.redirect("/login");
    }   
}
function checkCommentOwnership(req,res,next){
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id,function(err,foundComment){
            if(foundComment.author.id.equals(req.user._id)){
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
module.exports = router;