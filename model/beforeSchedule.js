var mongoose = require('mongoose')
var DB = require('../config/db')

var schema = new mongoose.Schema({
    message: { type: String, required: true, unique: true },
    status: { type: String, required: true, enum: ['pending', 'completed'], default: 'pending' },
    transferTime: { type: Date }
}, { timestamps: true })

module.exports = DB.model('before_schedules', schema)