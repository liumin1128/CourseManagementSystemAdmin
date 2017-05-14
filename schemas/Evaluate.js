var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var EvaluateSchema = new Schema({
    course: {
        type: ObjectId,
        ref: "Course"
    },
    teacher: {
        type: ObjectId,
        ref: "User"
    },
    from: {
        type: ObjectId,
        ref: "User"
    },
    level: Array,
    sub: String,
    studentEvaluate: Array,
    expertEvaluate: Array,
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
    .populate('teacher course from')
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