var mongoose = require('mongoose')
var StudentCourseSelectionSchema = require('../schemas/StudentCourseSelection.js')

var StudentCourseSelection = mongoose.model('StudentCourseSelection', StudentCourseSelectionSchema)

module.exports = StudentCourseSelection