var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var Schema = mongoose.Schema;
var userSchema = new Schema({
	username:String,
	firstName: String,
	otherName: String,
	phoneNumber:{
		type: Number,
		 unique: true, 
		 required: true
		},
	isAdmin: {
		type: Boolean, 
		default: false
	},
	password:String,
	confirmPassword: String, 
	property:[
  
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "property"
		}
  
],
	response: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "response"
		}
	], 

	messages: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "message"
		}
	], 
	resetPasswordToken: String,
	resetPasswordExpires: Date,

});

userSchema.plugin(passportLocalMongoose);
var User = mongoose.model("user", userSchema);

module.exports = User;