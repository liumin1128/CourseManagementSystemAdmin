var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    username: String,
    password: String,
    nickName: String,
    avatarUrl: String,
    class: String,
    idNumber: String,
    type: {
        type: String,
        default: 'student'
    },
    grade: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    updatedAt: {
        type: Date,
        default: Date.now()
    }
})

UserSchema.pre('save', function(next) {
    if(this.isNew){
        this.createdAt = this.updatedAt = Date.now()
    } else {
        this.updatedAt = Date.now()
    }
    next()
})

UserSchema.statics.fetch = function (cb) {
  return this
    .find({})
    .sort('updatedAt')
    .exec(cb)
}

UserSchema.statics.findById = function (id, cb) {
  return this
    .findOne({_id: id})
    .sort('updatedAt')
    .exec(cb)
}

module.exports = UserSchema