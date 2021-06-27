const expressSanitizer = require('express-sanitizer');
const Property = require("../models/property")
const response = require("../models/response")
const reply = require("../models/message")
module.exports = {
    isLoggedIn: function(req, res, next){
        if(req.isAuthenticated()){
            return next();
        }
        req.flash("error", "You must be signed in first!");
        res.redirect("back");
    },
   
    checkAdmin: function (req, res, next){
        if(req.isAuthenticated()){
            if(req.user.isAdmin === true){
                next()
            }else{
                res.redirect("/home")
            }
        }
      }, 

      sanitizelogin:  function (req, res, next){
        req.body.username = req.sanitize(req.body.username);
        req.body.password = req.sanitize(req.body.password);
        next()
      }, 

      sanitizeResponse: function(req, res, next){
        req.body.title = req.sanitize(req.body.title);
        req.body.message = req.sanitize(req.body.message);
        next()
      }, 

      sanitizeProperty: function(req, res, next){
        req.body.price = req.sanitize(req.body.price);
        req.body.address = req.sanitize(req.body.address);
        req.body.description = req.sanitize(req.body.description);
        next()
      }, 

      sanitizeForgot: function(req, res, next){
        req.body.username = req.sanitize(req.body.username);
        next()
      }, 
      sanitizeChat: function(req, res, next){
        req.body.message = req.sanitize(req.body.message);
        next()
      },
      sanitizeReset: function(req, res, next){
        req.body.password = req.sanitize(req.body.password);
        req.body.confirm = req.sanitize(req.body.confirm);
        next()
      }

  
}