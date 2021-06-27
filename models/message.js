var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var messageSchema = new Schema({
    createdAt: {
        type: Date,
        default: Date.now,
      },
  message:String,
  response: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "response"
		}
	], 
    user:{
        id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        },
        username: String, 
        firstName: String, 
        otherName: String
    }, 
    
    
});



var Message = mongoose.model('message', messageSchema)  

module.exports = Message;