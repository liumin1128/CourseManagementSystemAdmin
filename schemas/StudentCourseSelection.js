var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var EvaluateSchema = new Schema({
    student: {
        type: ObjectId,
        ref: "User"
    },
    course: {
        type: ObjectId,
        ref: "Course"
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

EvaluateSchema.pre('save', function(next) {
    if(this.isNew){
        this.createdAt = this.updatedAt = Date.now()
    } else {
        this.updatedAt = Date.now()
    }
    next()
})

EvaluateSchema.statics.fetch = function (cb) {
  return this
    .find({})
    .populate('student course')
    .sort({'createdAt': -1})
    .exec(cb)
}

EvaluateSchema.statics.findById = function (id, cb) {
  return this
    .findOne({_id: id})
    .sort('updatedAt')
    .exec(cb)
}

module.exports = EvaluateSchema