const express = require('express');  
const bodyParser = require('body-parser');  
const multer = require('multer');  
const mongoose = require('mongoose');  
const path = require('path'); 
const methodOverride = require("method-override");
const flash = require("connect-flash");
const LocalStrategy = require("passport-local");
const ObjectId = require('mongodb').ObjectId; 
const passport = require("passport");
const expressSanitizer = require('express-sanitizer');
const middleware = require("../middleware/index");
const asyncMiddleware = require("../utils/asyncMiddleware")
const User = require("../models/user");
const Property = require("../models/property")
const response = require("../models/response")
const Message = require("../models/message");
const Chat = require('../models/Chat');


const router = express.Router();

const storage = multer.diskStorage({  
    destination:function(req,file,cb){  
         cb(null,'./public/uploads')  
    },  
    filename(req,file,cb){  
        cb(null,file.originalname)  
    }  
})  
  
const upload = multer({storage:storage}); 
router.use(methodOverride("_method"))
const picPath = path.resolve(__dirname,'public');  
router.use(express.static(picPath));  
router.use(bodyParser.urlencoded({extended:false}))  
router.use(expressSanitizer());


router.use(require("express-session")({
    secret:"fasttrack is the best in the whole of Nigera",
        resave: false,          
        saveUninitialized:false    
    }));
   
    router.use(methodOverride("_method"))
    passport.use(new LocalStrategy(User.authenticate()));
    passport.serializeUser(User.serializeUser());     
    passport.deserializeUser(User.deserializeUser());

    router.use(passport.initialize());
    router.use(passport.session());
    router.use(flash())
    router.use(function(req, res, next){
        res.locals.currentUser = req.user;
        res.locals.error = req.flash("error");
        res.locals.success = req.flash("success");
        next();
    });


// //REGISTERATION ROUTE
    router.post("/register", middleware.sanitizeRegister, (req,res)=>{
      if(req.body.password !== req.body.confirmPassword || req.body.password.length < 8){
        req.flash("error", "Password is invalid or Does not match !!!")
        res.redirect("back")
      }
     
          User.register(new User({username: req.body.username, firstName: req.body.firstName, otherName: req.body.otherName, phoneNumber: req.body.phoneNumber}),req.body.password,function(err, user){
            if(err){
                req.flash("error", err.message); 
                res.redirect("back");
            }
           
            passport.authenticate("local")(req, res, function(){
            res.redirect("/property");
       });    
     });
    
    });


    // //LOGIN ROUTE
    router.post("/login", middleware.sanitizelogin, passport.authenticate("local", 
    
    {
        successRedirect:"/admin/dashboard", 
        failureRedirect: "/home",
        failureFlash:true
    
    }), function(req, res){
    
    });
    
 // // LOGOUT ROUTE
 router.get("/logout",(req,res)=>{
  req.logout();
  res.redirect("/home");
});


    // CLIENT SIDE ROUTES
   router.get("/", (req, res)=>res.redirect("/home"))

   // HOME PAGE ROUTE
   router.get("/home", asyncMiddleware(async(req, res) =>{
       const property = await Property.find();
       res.render("index", {data:property})
   }))

   // ABOUT PAGE ROUTE
   router.get("/about", (req, res)=>res.render("about"))

   // USERPROFILE ROUTE
   router.get("/user/userprofile/:id", middleware.isLoggedIn, asyncMiddleware(async(req, res)=>{
     User.findById(req.params.id).populate("response").populate("Chat").exec((err, data)=>{
     res.render("rooms", {data:data})
     })
   }))

// USER CHAT-PAGE ROUTE 
    router.get("/response/:message", middleware.isLoggedIn, asyncMiddleware(async(req, res) => {
      response.findOne({"message":req.params.message}).populate("Chat").exec(function(err, data){
       res.render("chat", {data:data})
      })
    }))

    // USER RESPONSE DELETE ROUTE
  router.delete('/response/:id', asyncMiddleware (async(req, res) => {
        const respond = await response.findByIdAndDelete(req.params.id);
        res.redirect("back")
        
}))

   // PROPERTY PAGE ROUTE
   router.get("/property", asyncMiddleware(async(req, res)=>{
       const property = await Property.find()
       res.render("property-grid", {data:property})
   }))

// PROPERTY DETAILS PAGE ROUTE
  router.get("/property/:id", asyncMiddleware(async(req, res)=>{
      const id = req.params.id;
      const data = await Property.findById(id);
        res.render("property-single", {data:data})
  }))

// AGENTS PAGE ROUTES
   router.get("/agent", (req, res)=>res.render("agend-grid"))

   // BLOG ROUTES
   router.get("/blogs", (req, res)=>res.render("blog-grid"))

   // CONTACT ROUTE
    router.get("/contact", (req, res)=>res.render("contact"))

  //CLIENT SIDE MESSAGE / RESPONSE POST ROUTES


  router.post('/property/:id/response', asyncMiddleware(async(req, res, next) => {
      const User = req.user;
      const property = await Property.findById(req.params.id)
      if(property){
        const respond = await response (req.body)
        respond.save()
        property.response.push(respond)
        property.save()
        User.response.push(respond)
        User.save()
        res.redirect("back")
    }
  }))
 

//ADMIN DASHBOARD ROUTES
router.get("/admin/dashboard", middleware.isLoggedIn, middleware.checkAdmin, (req, res)=>res.render("admin/dashboard"))

// ADMIN REGISTERED USERS ROUTES
router.get("/admin/users", middleware.isLoggedIn, middleware.checkAdmin, asyncMiddleware(async(req, res)=>{
    const user = await User.find({})
    res.render("admin/user", {data:user})
}))

// ADMIN USERPROFILE DETAILS ROUTE
router.get("/admin/users/:id", middleware.isLoggedIn, middleware.isLoggedIn, asyncMiddleware(async(req, res) => {
    User.findById(req.params.id).populate("response").exec((err, data)=>{
        res.render("admin/userinfo", {data:data})
    })
}))

// ADMIN USER DELETE ROUTE
router.delete("/admin/users/:id", middleware.isLoggedIn, middleware.checkAdmin, asyncMiddleware(async(req, res)=>{
    const user = await User.findByIdAndDelete(req.params.id)
    res.redirect("back")
}))

// ADMIN VIEW ALL MESSAGES / RESPONSES ROUTE
router.get("/admin/messages", middleware.isLoggedIn, middleware.checkAdmin, asyncMiddleware(async(req, res)=>{
    const respond = await response.find({})
    res.render("admin/messages", {data:respond}) 
}))
// ADMIN PROPERTY VIEWS ROUTE
router.get("/admin/properties",  middleware.isLoggedIn, middleware.checkAdmin, asyncMiddleware(async(req, res) => {
    const property = await Property.find({})
    res.render("admin/properties", {data:property})
}))

// ADMIN PROEPRY DETAILS VIEW ROUTE
router.get("/admin/properties/:id",  middleware.isLoggedIn, middleware.checkAdmin, asyncMiddleware(async(req, res)=>{
    const property = await Property.findById(req.params.id).populate("response").exec((err, data) => {
      res.render("admin/propertyDetails", {data:data})
  })
}))

// ADMIN RENT PROPERTIES VIEW ROUTE
router.get("/admin/rentproperties",  middleware.isLoggedIn, middleware.checkAdmin, asyncMiddleware(async(req, res) => {
    const property = await Property.find({})
    res.render("admin/propertyRent", {data:property})
}))

// ADMIN SALE PROPERTY VIEWS ROUTE
router.get("/admin/saleproperties",  middleware.isLoggedIn, middleware.checkAdmin, asyncMiddleware(async(req, res) => {
    const property = await Property.find({})
    res.render("admin/propertySale", {data:property})
}))

// ADMIN MORTGAGE PROPERTY VIEW ROUTE
router.get("/admin/mortgageproperties",  middleware.isLoggedIn, middleware.checkAdmin, asyncMiddleware(async(req, res) => {
    const property = await Property.find({})
    res.render("admin/propertyMortage", {data:property})
}))

//ADMIN REGISTERED AGENTS VIEWS ROUTE
router.get("/admin/agents",  middleware.isLoggedIn, middleware.checkAdmin, (req, res) =>res.render("admin/agent"))

// ADMIN PROPERTY POST ROUTE
// router.post("/property", upload.array("pic", 30),  middleware.isLoggedIn, middleware.checkAdmin, middleware.sanitizeProperty, asyncMiddleware(async(req, res) => {
//   const User = req.user;
//   const x = req.files.map(file =>  "uploads/" + file.originalname)
//   const picss = await Property ({property:req.body.property, picspath:x})
//   picss.save()
//   User.property.push(picss)
//   User.save()
//   res.redirect("back")
// }))
router.post("/property", upload.array("pic", 30),  middleware.isLoggedIn, middleware.checkAdmin, middleware.sanitizeProperty, function(req, res){
  var User = req.user;
  var x = req.files.map(file =>  "uploads/" + file.originalname)
  var picss = {
      picspath:x,
      price: req.body.price,
      period: req.body.period, 
      type: req.body.type,
      description: req.body.description, 
      method: req.body.method,
      bedroom: req.body.bedroom,
      bathroom: req.body.bathroom, 
      location: req.body.location, 
      address: req.body.address, 
      parkingSpace:req.body.parkingSpace, 
      garage: req.body.garage, 
      rooms:req.body.rooms,  
      kitchen: req.body.kitchen, 
      water: req.body.water, 
      broadband: req.body.broadband,
      security: req.body.security, 
      securityGate: req.body.securityGate,
      store: req.body.store, 
      garden: req.body.garden 
        
  }
  Property.create(picss, function(err, data){
    if(err){
      console.log(err)
    }else{
      
      User.property.push(data)
      User.save()
     
      res.redirect("back")
    }
  })
})

// ADMIN PROPERTY DELETE ROUTE
router.delete("/property/:id",  middleware.isLoggedIn, middleware.checkAdmin, asyncMiddleware(async(req, res) => {
    const property = await Property.findByIdAndDelete(req.params.id)
    res.redirect("back")
}))

// ADMIN PROPERTY EDIT ROUTE
router.put("/property/:id", upload.array("pic", 30),  middleware.isLoggedIn,  middleware.checkAdmin, middleware.sanitizeProperty, function(req, res){
  var User = req.user;
  var x = req.files.map(file =>  "uploads/" + file.originalname)
  var picss = {
      picspath: x,
      price: req.body.price,
      period: req.body.period, 
      type: req.body.type,
      description: req.body.description, 
      method: req.body.method,
      bedroom: req.body.bedroom,
      bathroom: req.body.bathroom, 
      location: req.body.location, 
      address: req.body.address, 
      parkingSpace:req.body.parkingSpace, 
      garage: req.body.garage, 
      rooms:req.body.rooms,  
      kitchen: req.body.kitchen, 
      water: req.body.water, 
      broadband: req.body.broadband,
      security: req.body.security, 
      securityGate: req.body.securityGate,
      store: req.body.store, 
      garden: req.body.garden 
        
  }
  Property.findByIdAndUpdate(req.params.id, picss, function(err, data){
    if(err){
      console.log(err)
    }else{
      User.property.push(data)
      User.save()
      res.redirect("back")
    }
  })
})

// SEARCH ROUTE
router.get('/search',(req,res)=>{
  try {
           Property.find({$or:[{location:{'$regex':req.query.dsearch}},{method:{'$regex':req.query.dsearch}}, {type:{'$regex':req.query.dsearch}}, {description:{'$regex':req.query.dsearch}}, {bedroom:{'$regex':req.query.dsearch}}, {period:{'$regex':req.query.dsearch}}]},(err,data)=>{
               if(err){
                    console.log(err)
                   res.redirect("back")
               }else{
                    
                   res.render('property-grid',{data:data});
               }
           })
  } catch (error) {
      console.log(error);
  }
});

module.exports = router; 