const express = require('express')
const mongoose = require('mongoose')

// var dbUrl = "mongodb://127.0.0.1:27017/estate-agency"
const dbUrl = 'mongodb+srv://smssolution:BxA45zj5BQ70CD6I@cluster0.3wo4h.mongodb.net/estate-agency?retryWrites=true&w=majority'
const dbConnect = mongoose.connect(dbUrl, {useNewUrlParser:true, useUnifiedTopology: true})
.then(()=>console.log('connectd to db'))
.catch((err)=>console.log('error ',err));





module.exports = dbConnect;
