var mongoose = require('mongoose')
var ExportEvaluateSchema = require('../schemas/ExportEvaluate.js')

var ExportEvaluate = mongoose.model('ExportEvaluate', ExportEvaluateSchema)

module.exports = ExportEvaluate