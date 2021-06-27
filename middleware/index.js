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
      }
}