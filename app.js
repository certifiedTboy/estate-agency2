var express = require('express');  
var bodyParser = require('body-parser');  
var multer = require('multer');  
var mongoose = require('mongoose');  
var methodOverride = require("method-override");
var flash = require("connect-flash");
var LocalStrategy = require("passport-local");
var ObjectId = require('mongodb').ObjectId; 
var passport = require("passport");
const middleware = require("./middleware/index")
const expressSanitizer = require('express-sanitizer');
var indexRoutes = require("./routes/index");
var passwordRoutes = require("./routes/passwordReset")
var path = require('path'); 
var app = express();  
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Message = require("./models/message")
var response = require("./models/response")
var mongoose = require("mongoose"); 
const User = require('./models/user');





// var dbUrl = 'mongodb://127.0.0.1:27017/estate-agency'
var dbUrl = 'mongodb://smssolution:yGHblWA4Vm4LFivj@cluster0-shard-00-00.3wo4h.mongodb.net:27017,cluster0-shard-00-01.3wo4h.mongodb.net:27017,cluster0-shard-00-02.3wo4h.mongodb.net:27017/examsolution?authSource=admin&replicaSet=atlas-8os7kz-shard-0&w=majority&readPreference=primary&retryWrites=true&ssl=true'
mongoose.connect(dbUrl, {useNewUrlParser:true}, {useUnifiedTopology: true})
.then(()=>console.log('connectd to db'))
.catch((err)=>console.log('error ',err));


var storage = multer.diskStorage({  
    destination:function(req,file,cb){  
         cb(null,'./public/uploads')  
    },  
    filename(req,file,cb){  
        cb(null,file.originalname)  
    }  
})  
  
var upload = multer({storage:storage});  

app.set('view engine','ejs'); 
app.set("views",path.resolve(__dirname,'views'));  
var picPath = path.resolve(__dirname,'public');  
app.use(express.static(picPath));  
app.use(bodyParser.urlencoded({extended:false}))
app.use(expressSanitizer());  
app.use(indexRoutes);
app.use(passwordRoutes)
app.use(flash());






  app.get("/response/:id", function(req, res){
    Message.findById(req.params.id).populate("messages").exec(function(err, messages){
      res.send(messages);
      console.log(messages)
    })
  })
  
  

  app.post("/response/:id", middleware.sanitizeChat, function(req, res){
   response.findById(req.params.id, function(err, responses){
     if(err){
       console.log(err)
     }else{
      var User = req.user;
      var message = {
        message: req.body.message,
        user:{
          id: req.user._id, 
          username: req.user.username, 
          firstName: req.user.firstName
        }
      }
      Message.create(message, function(err, message){
        if(err){
          console.log(err)
        }else{
          io.emit('message', req.body);
          User.messages.push(message)
          responses.messages.push(message)
          responses.save()
          User.save()
        }
      })
     }
   })
   
  })
  
 
  
  
  
  io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });


  io.on('connection', (socket)=>{
  
    socket.on('typing', (data)=>{
      if(data.typing==true)
         io.emit('display', data)
      else
         io.emit('display', data)
    })
}) 

  



// if (cluster.isMaster) {
//   console.log(`Master ${process.pid} is running`);

//   const httpServer = http.createServer();
//   setupMaster(httpServer, {
//     loadBalancingMethod: "least-connection", // either "random", "round-robin" or "least-connection"
//   });
//   httpServer.listen(3000);

//   for (let i = 0; i < numCPUs; i++) {
//     cluster.fork();
//   }

//   cluster.on("exit", (worker) => {
//     console.log(`Worker ${worker.process.pid} died`);
//     cluster.fork();
//   });
// } else {
//   console.log(`Worker ${process.pid} started`);

// }


  // var server = http.listen(3000, () => {
  //   console.log('server is running on port', server.address().port);
  // });

  app.listen(process.env.PORT || 3000, process.env.IP, function(){
    console.log("estate agency is live")
  })