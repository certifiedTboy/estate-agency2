const Chat = require("../models/Chat")
const User = require("../models/user")
const moment = require('moment');

function notification(type, text) {
  return {
    type,
    text,
    time: moment().format('h:mm a')
  };
}

module.exports = notification;