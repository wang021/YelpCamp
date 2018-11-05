var express = require("express");
var router = express.Router();
var passport  = require("passport");
var User    = require("../models/user");
var middle = require("../middleware");
router.get("/",function(req,res){
    res.render("index");
});


router.get("/register",function(req,res){
   res.render("register"); 
});
router.post("/register",function(req,res){
   User.register(new User({
       username:req.body.username
   }),req.body.password,function(err,user){
      if(err){
          req.flash("error",err.message);
          return res.redirect("/register");
      }else{
          passport.authenticate("local")(req,res,function(){
             req.flash("success","Welcome " + req.body.username);
             res.redirect("/campground"); 
          });
      } 
   }); 
});
router.get("/login",function(req,res){
   
   res.render("login"); 
});
router.post("/login",passport.authenticate("local",{
    successRedirect:"/campground",
    failureRedirect:"/login"
}),function(req,res){});
router.get("/logout",function(req,res){
   req.logout();
   req.flash("success","You have been logged out");
   res.redirect("/campground");
});
router.get("/chattingroom",middle.isLoggedIn,function(req, res) {
    res.render("chat");
});
module.exports = router;