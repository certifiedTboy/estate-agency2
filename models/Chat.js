const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const chatSchema = new Schema({
  createdAt:{
    type: Date,
    default: Date.now,
  },
  message:{
    type:String
  },
 sender:{
   type:String
 }
  
});

let Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;
