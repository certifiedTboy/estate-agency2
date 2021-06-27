var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var responseSchema = new Schema({
    createdAt: {
        type: Date,
        default: Date.now,
      },
  message: String, 
  title: String, 
  user:{
    id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    username: String, 
    firstName: String, 
    otherName: String
}, 

messages: [
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "message"
    }
], 

    
});

var response = mongoose.model('response', responseSchema)  

module.exports = response;