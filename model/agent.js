var mongoose = require('mongoose')
var DB = require('../config/db')

var schema = new mongoose.Schema({
    agent: { type: String, required: true, unique: true }
}, { timestamps: true })

module.exports = DB.model('agents', schema)