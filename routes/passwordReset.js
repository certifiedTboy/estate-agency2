var express = require("express")
var bodyParser = require('body-parser');  
var path = require('path'); 
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const nodemailer = require('nodemailer');
var flash = require("connect-flash");
var LocalStrategy = require("passport-local");
var passport = require("passport");
const expressSanitizer = require('express-sanitizer');
var middleware = require("../middleware/index");
var async = require("async");
var crypto = require("crypto");
var User = require("../models/user");


var router = express.Router();



router.use(bodyParser.urlencoded({extended:false}))  
router.use(expressSanitizer());


   
    passport.use(new LocalStrategy(User.authenticate()));
    passport.serializeUser(User.serializeUser());     
    passport.deserializeUser(User.deserializeUser());

    router.use(passport.initialize());
    router.use(passport.session());
  
    router.use(function(req, res, next){
        res.locals.currentUser = req.user;
      
        next();
    });

 // MAILING OPTION
 const myOAuth2Client = new OAuth2(
  "854421937371-nm9p55ikip4pevj5rb74qm8l4jl9a6kg.apps.googleusercontent.com",
 "73i3nhkVBlDAr6e003SFLvP6",
 "https://developers.google.com/oauthplayground"
)

myOAuth2Client.setCredentials({
  refresh_token:"1//047zP5KeDmlnACgYIARAAGAQSNwF-L9Ir-4cUvQarZXEsUiHXOb-0w2xZuN9mxvVnnETeV7FhbQ1M14xwDQqv9SL_Ajr1ARoZPlQ"
});

const myAccessToken = myOAuth2Client.getAccessToken()

const transport = nodemailer.createTransport({
 service: "gmail",
 auth: {
      type: "OAuth2",
      user: "urinfo.examssolutions12@gmail.com", //your gmail account you used to set the project up in google cloud console"
      clientId: "854421937371-nm9p55ikip4pevj5rb74qm8l4jl9a6kg.apps.googleusercontent.com",
      clientSecret: "73i3nhkVBlDAr6e003SFLvP6",
      refreshToken: "1//047zP5KeDmlnACgYIARAAGAQSNwF-L9Ir-4cUvQarZXEsUiHXOb-0w2xZuN9mxvVnnETeV7FhbQ1M14xwDQqv9SL_Ajr1ARoZPlQ",
      accessToken: myAccessToken //access token variable we defined earlier
 }});


router.get("/resetpassword", function(req,res){
  res.render("user/forgot")
})

router.post('/forgot', function(req, res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
        console.log(token)
        
      });
    },
    function(token, done) {
      User.findOne({ username: req.body.username }, function(err, user) {
        if (!user) {
          req.flash('error', 'No account with the email address exist.');
          return res.redirect('back');
        }
        
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var mailOptions = {
        to: user.username,
        from: 'urinfo.examssolutions12@gmail.com',
        subject: 'Request for Password reset',
       html: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      transport.sendMail(mailOptions, function(err) {
        req.flash('success', 'An e-mail has been sent to ' + user.username + ' with further instructions.');
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('back');
  });
});

router.get('/reset/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/resetpassword');
    }
    res.render('user/reset', {token: req.params.token});
  });
});

router.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
        if(req.body.password === req.body.confirm) {
          user.setPassword(req.body.password, function(err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function(err) {
              req.logIn(user, function(err) {
                done(err, user);
              });
            });
          })
        } else {
            req.flash("error", "Passwords do not match.");

            return res.redirect('back');
        }
      });
    },
    function(user, done) {
     
      var mailOptions = {
        to: user.username,
        from: 'urinfo.examssolutions12@gmail.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.username + ' has just been changed.\n'
      };
      transport.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/property');
  });
});



module.exports = router; 