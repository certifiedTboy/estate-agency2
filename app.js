'use strict';
const express = require('express');  
const bodyParser = require('body-parser'); 
const app = express() 
const multer = require('multer');  
const mongoose = require('mongoose');  
const methodOverride = require("method-override");
const flash = require("connect-flash");
const LocalStrategy = require("passport-local");
const formatMessage = require('./utils/messages');
const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./utils/users');
const ObjectId = require('mongodb').ObjectId; 
const passport = require("passport");
const middleware = require("./middleware/index")
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const expressSanitizer = require('express-sanitizer');
const indexRoutes = require("./routes/index");
const passwordRoutes = require("./routes/passwordReset")
const path = require('path');  
const response = require("./models/response")
const User = require('./models/user');
const Chat = require('./models/Chat');
const httpServer = require("http").createServer(app);
const socketIO = require('socket.io');
const PORT = process.env.PORT || 3000;



// var dbUrl = "mongodb://127.0.0.1:27017/estate-agency"
var dbUrl = 'mongodb://smssolution:yGHblWA4Vm4LFivj@cluster0-shard-00-00.3wo4h.mongodb.net:27017,cluster0-shard-00-01.3wo4h.mongodb.net:27017,cluster0-shard-00-02.3wo4h.mongodb.net:27017/estate-agency2?authSource=admin&replicaSet=atlas-8os7kz-shard-0&w=majority&readPreference=primary&retryWrites=true&ssl=true'
var connect = mongoose.connect(dbUrl, {useNewUrlParser:true, useUnifiedTopology: true})
.then(()=>console.log('connectd to db'))
.catch((err)=>console.log('error ',err));

const server = app
  .listen(PORT, () => console.log(`Listening on ${PORT}`));
 
const io = socketIO(server);

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
app.use(cookieParser());
app.use(expressSanitizer());  
app.use(indexRoutes);
app.use(passwordRoutes)
app.use(flash());


const botName = 'Tee-Robotics';

// Run when client connects
io.on('connection', socket => {
  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    // Welcome current user
    socket.emit('message', formatMessage(botName, 'Welcome to Estate Agency Chat!'));

    // Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage(" ", `${user.username} has joined the chat`)
      );

    // Send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });
  }); 

  // Listen for chatMessage
  socket.on('chatMessage', msg => {
    const user = getCurrentUser(socket.id)
    io.to(user.room).emit('message', formatMessage(user.username, msg));
    connect.then(db => {
      let chatMessage = new Chat({ message: msg, sender: user.username });
      chatMessage.save();
      response.findOne({message:user.room}, (err, respond) => {
        respond.Chat.push(chatMessage) 
        respond.save()
      }) 
    });
  });

  
// user typing
socket.on('typing', (data)=>{
  const user = getCurrentUser(socket.id)
  if(data.typing===true)
     socket.broadcast.to(user.room).emit('display', data)
  else
  socket.broadcast.to(user.room).emit('display', data) 
})

//user stop typing 
socket.on('stopTyping', (data)=>{
  const user = getCurrentUser(socket.id)
  if(data.typing===false)
    socket.broadcast.to(user.room).emit('hidden', data)
  else
  socket.broadcast.to(user.room).emit('hidden', data)
})

// notification to users 

  socket.on("send-notification", function (data) {
    const user = getCurrentUser(socket.id)
    socket.broadcast.to(user.room).emit("new-notification", data);
  });



  // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage("", `${user.username} has left the chat`)
      );

      // Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }
  });
});








  