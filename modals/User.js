var mongoose = require('mongoose')
var UserSchema = require('../schemas/User.js')

var User = mongoose.model('User', UserSchema)

module.exports = User