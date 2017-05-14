var mongoose = require('mongoose')
var EvaluateSchema = require('../schemas/Evaluate.js')

var Evaluate = mongoose.model('Evaluate', EvaluateSchema)

module.exports = Evaluate