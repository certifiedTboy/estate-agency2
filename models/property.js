var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var propertySchema = new Schema({
    createdAt: {
        type: Date,
        default: Date.now,
      },
    picspath:[String],
    price: Number,
    description: String, 
    type: String,
    method:String,
    bedroom: String,
    address: String, 
    location: String,
    period: String, 
    bathroom: String,  
    parkingSpace:String, 
    garage: String, 
    rooms:String, 
    sittingRoom: String, 
    kitchen: String, 
    water: String, 
    broadband: String,
    security: String, 
    securityGate: String, 
    garden: String, 
    store: String, 
    response: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "response"
      }
    ], 
    user:{
      id:{
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
      },
      username: String
  }
});




var Property = mongoose.model("property", propertySchema)  

module.exports = Property;