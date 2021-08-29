const express = require('express')
const mongoose = require('mongoose')

// var dbUrl = "mongodb://127.0.0.1:27017/estate-agency"
const dbUrl = 'mongodb://:yGHblWA4Vm4LFivj@cluster0-shard-00-00.3wo4h.mongodb.net:27017,cluster0-shard-00-01.3wo4h.mongodb.net:27017,cluster0-shard-00-02.3wo4h.mongodb.net:27017/?authSource=admin&replicaSet=atlas-8os7kz-shard-0&w=majority&readPreference=primary&retryWrites=true&ssl=true'
const dbConnect = mongoose.connect(dbUrl, {useNewUrlParser:true, useUnifiedTopology: true})
.then(()=>console.log('connectd to db'))
.catch((err)=>console.log('error ',err));





module.exports = dbConnect;
