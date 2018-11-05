        require("dotenv").config();
        var express         = require("express"),
            app             = express(),
            body            = require("body-parser"),
            mongoose        = require("mongoose"),
            CampGroundRouter      = require("./routes/campground"),
            CommentRouter         = require("./routes/comment"),
            passport        = require("passport"),
            localStrategy   = require("passport-local"),
   passportLocalmongoose    = require("passport-local-mongoose"),
            User            = require("./models/user"),
            UserRouter      = require("./routes/index"),
            methodOverride  = require("method-override"),
            flash           = require("connect-flash"),
            server = require('http').createServer(app),
            io = require('socket.io').listen(server);
            server.listen(process.env.PORT || 3000);
  app.use(require("express-session")({
    secret:"Here is my secret",
    resave:false,
    saveUninitialized:false
}));
app.use(flash());
app.use(methodOverride("_method"));

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use(passport.initialize());
app.use(passport.session());
var url = process.env.DATABASEURL||"mongodb://localhost/yelp_camp";

//mongodb://wang:a123456@ds249530.mlab.com:49530/myyelpcamp
app.set("view engine","ejs");
app.use(express.static(__dirname+"/public"));


app.use(body.urlencoded({ extended: true }));
app.use(function(req,res,next){
   res.locals.currentUser = req.user;
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   next();
});
var num = 0;
io.on('connection', function(socket) {
     num++;
    socket.emit('status',num);
    socket.broadcast.emit('join');
    socket.on('disconnect', function(){
        
        num--;
        socket.emit('status',num);
        socket.broadcast.emit('leave');
    });
    socket.on('chat message', function(msg){
        socket.broadcast.emit('chat message',msg);
    });
});
app.use(CampGroundRouter);
app.use(CommentRouter);
app.use(UserRouter);