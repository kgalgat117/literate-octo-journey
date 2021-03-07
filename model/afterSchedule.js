var mongoose = require('mongoose')
var DB = require('../config/db')

var schema = new mongoose.Schema({
    message: { type: String, required: true, unique: true }
}, { timestamps: true })

module.exports = DB.model('after_schedules', schema)