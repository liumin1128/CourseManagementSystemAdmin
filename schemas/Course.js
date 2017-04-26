var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CourseSchema = new Schema({
    name: String,
    desc: String,
    meta: {
        createdAt: {
            type: Date,
            default: Date.now()
        },
        updatedAt: {
            type: Date,
            default: Date.now()
        }
    }
})

CourseSchema.pre('save', function(next) {
    if(this.isNew){
        this.meta.createdAt = this.meta.updatedAt = Date.now()
    } else {
        this.meta.updatedAt = Date.now()
    }
    next()
})

CourseSchema.statics.fetch = function (cb) {
  return this
    .find({})
    .sort('meta.updatedAt')
    .exec(cb)
}

module.exports = CourseSchema