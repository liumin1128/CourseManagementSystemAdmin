var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var CourseSchema = new Schema({
    name: String,
    desc: String,
    select: Boolean,
    teacher: {
        type: ObjectId,
        ref: "User"
    },
    students: [{
        type: ObjectId,
        ref: "User"
    }],
    createdAt: {
        type: Date,
        default: Date.now()
    },
    updatedAt: {
        type: Date,
        default: Date.now()
    }
})

CourseSchema.pre('save', function(next) {
    if(this.isNew){
        this.createdAt = this.updatedAt = Date.now()
    } else {
        this.updatedAt = Date.now()
    }
    next()
})

CourseSchema.statics.fetch = function (cb) {
  return this
    .find({})
    .populate('teacher students')
    .sort({'createdAt': -1})
    .exec(cb)
}

CourseSchema.statics.findById = function (id, cb) {
  return this
    .findOne({_id: id})
    .sort('updatedAt')
    .exec(cb)
}

module.exports = CourseSchema