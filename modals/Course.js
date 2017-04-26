var mongoose = require('mongoose')
var CourseSchema = require('../schemas/Course.js')

var Course = mongoose.model('Course', CourseSchema)

module.exports = Course