var express = require('express');  
var bodyParser = require('body-parser');  
var multer = require('multer');  
var mongoose = require('mongoose');  
var path = require('path'); 
var methodOverride = require("method-override");
var flash = require("connect-flash");
var LocalStrategy = require("passport-local");
var ObjectId = require('mongodb').ObjectId; 
var passport = require("passport");
const expressSanitizer = require('express-sanitizer');
var middleware = require("../middleware/index");
var User = require("../models/user");
const Property = require("../models/property")
const response = require("../models/response")
const Message = require("../models/message");


var router = express.Router();

var storage = multer.diskStorage({  
    destination:function(req,file,cb){  
         cb(null,'./public/uploads')  
    },  
    filename(req,file,cb){  
        cb(null,file.originalname)  
    }  
})  
  
var upload = multer({storage:storage}); 
router.use(methodOverride("_method"))
var picPath = path.resolve(__dirname,'public');  
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
    router.post("/register",(req,res)=>{
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
    router.post("/login", passport.authenticate("local", 
    {
        successRedirect:"/admin/dashboard", 
        failureRedirect: "back",
        failureFlash:true
    
    }), function(req, res){
    
    });
    
 // // LOGOUT ROUTE
 router.get("/logout",(req,res)=>{
  req.logout();
  res.redirect("/property");
});


    // CLIENT SIDE ROUTES
   router.get("/", function(req, res){
     res.redirect("/home")
   })

   router.get("/home", function(req, res){
     Property.find({}, function(err, data){
       if(err){
         console.log(err)
       }else{
        res.render("index", {data: data})
       }
     })
    
   })

   router.get("/about", function(req, res){
     res.render("about")
   })

   router.get("/user/userprofile/:id", middleware.isLoggedIn, function(req, res){
     User.findById(req.params.id).populate("response").exec(function(err, data){
       if(err){
         console.log(err)
       }else{
        res.render("user/userprofile", {data:data})
       }
     })
    
   })


    router.get("/response/:id", middleware.isLoggedIn, function(req, res){
      response.findById(req.params.id).populate("messages").exec(function(err, data){
        if(err){
          console.log(err)
        }else{
         
          res.render("user/messageDetails", {data:data})
        }
      })
    })

   router.delete("/response/:id", function(req, res){
     response.findByIdAndDelete(req.params.id, function(err, data){
       if(err){
         console.log(err)
       }else{
         res.redirect("back")
       }
     })
   })

   router.get("/property", function(req, res){
     Property.find({}, function(err, data){
       if(err){
         console.log(err)
       }else{
        
        
        res.render("property-grid", {data:data})
       }
     })
    
   })

  

  

   router.get("/property/:id", function(req, res){
     Property.findById(req.params.id).populate("response").exec(function(err, data){
       if(err){
         console.log(err)
       }else{
        
        res.render("property-single", {data:data})
       }
     })
  })


   router.get("/agent", function(req, res){
     res.render("agent-grid")
   })

   router.get("/blogs", function(req, res){
     res.render("blog-grid")
   })

    router.get("/contact", function(req, res){
      res.render("contact")
    })

  //CLIENT SIDE MESSAGE / RESPONSE ROUTES
  router.post("/property/:id/response", function(req, res){
    Property.findById(req.params.id, function(err, property){
      if(err){
        console.log(err)
      }else{
        var User = req.user;
        var newResponse = {
          title: req.body.title, 
          message: req.body.message, 
          user: {
            id: req.user._id, 
            username: req.user.username,
            firstName: req.user.firstName, 
            otherName: req.user.otherName
          }
        }
        response.create(newResponse, function(err, data){
          if(err){
            console.log(err)
          }else{
            property.response.push(data)
            User.response.push(data)
            property.save()
            User.save()
            res.redirect("back")
          }
        })
      }
    })
  })

 

  
   
  
//ADMIN DASHBOARD ROUTES
router.get("/admin/dashboard", middleware.isLoggedIn, middleware.checkAdmin,  function(req, res){
  res.render("admin/dashboard")
})

router.get("/admin/users", middleware.isLoggedIn, middleware.checkAdmin, function(req, res){
  User.find({}, function(err, data){
    if(err){
      console.log(err)
    }else{
      res.render("admin/user", {data:data})
    }
  })
  
})

router.get("/admin/users/:id", middleware.isLoggedIn, middleware.isLoggedIn, function(req, res){
  User.findById(req.params.id).populate("response").exec(function(err, data){
    if(err){
      console.log(err)
    }else{
     res.render("admin/userinfo", {data:data})
    }
  })
 
})

router.delete("/admin/users/:id", middleware.isLoggedIn, middleware.checkAdmin, function(req, res){
  User.findByIdAndDelete(req.params.id, function(err){
    if(err){
      res.redirect("back")
    }else{
      
      res.redirect("back")
    }
  })
})

router.get("/admin/messages", middleware.isLoggedIn, middleware.checkAdmin, function(req, res){
  response.find({}, function(err, data){
    if(err){
      console.log(err)
    }else{
      res.render("admin/messages", {data:data})
    }
  })
})

router.get("/admin/messages/:id", middleware.isLoggedIn, middleware.checkAdmin, function(req, res){
  response.findById(req.params.id, function(err, data){
    if(err){
      console.log(err)
    }else{
      res.render("admin/adminMessageDetails", {data:data})
    }
  })
    
})

router.get("/admin/properties",  middleware.isLoggedIn, middleware.checkAdmin, function(req, res){
  Property.find({}, function(err, data){
    if(err){
      console.log(err)
    }else{
      res.render("admin/properties", {data:data})
    }
  })
 
})

router.get("/admin/properties/:id",  middleware.isLoggedIn, middleware.checkAdmin, function(req, res){
  Property.findById(req.params.id).populate("response").exec(function(err, data){
    if(err){
      console.log(err)
    }else{
     
      res.render("admin/propertyDetails", {data:data})
    }
  })
})

router.get("/admin/response/:id",  middleware.isLoggedIn, middleware.checkAdmin, function(req, res){
  response.findById(req.params.id).populate("messages").exec(function(err, data){
    if(err){
      console.log(err)
    }else{
     
      res.render("admin/adminMessageDetails", {data:data})
    }
  })
})

router.get("/admin/rentproperties",  middleware.isLoggedIn, middleware.checkAdmin, function(req, res){
  Property.find({}, function(err, data){
    if(err){
      console.log(err)
    }else{
      res.render("admin/propertyRent", {data:data})
    }
  })
  
})

router.get("/admin/saleproperties",  middleware.isLoggedIn, middleware.checkAdmin, function(req, res){
  Property.find({}, function(err, data){
    if(err){
      console.log(err)
    }else{
    
      res.render("admin/propertySale", {data:data})
    }
  })

})

router.get("/admin/mortgageproperties",  middleware.isLoggedIn, middleware.checkAdmin, function(req, res){
  Property.find({}, function(err, data){
    if(err){
      console.log(err)
    }else{
      res.render("admin/propertyMortage", {data:data})
    }
  })

})

router.get("/admin/agents",  middleware.isLoggedIn, middleware.checkAdmin, function(req, res){
  res.render("admin/agent")
})

router.post("/property", upload.array("pic", 30),  middleware.isLoggedIn, middleware.checkAdmin, function(req, res){
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
      console.log(data)
      User.property.push(data)
      User.save()
     
      res.redirect("back")
    }
  })
})

router.delete("/property/:id",  middleware.isLoggedIn, middleware.checkAdmin, function(req, res){
  Property.findByIdAndDelete(req.params.id, function(err){
    if(err){
      res.redirect("back")
    }else{
      
      res.redirect("back")
    }
  })
})

router.put("/property/:id", upload.array("pic", 30),  middleware.isLoggedIn,  middleware.checkAdmin, function(req, res){
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