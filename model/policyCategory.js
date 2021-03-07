var mongoose = require('mongoose')
var DB = require('../config/db')

var schema = new mongoose.Schema({
    category_name: { type: String, required: true, unique: true }
}, { timestamps: true })

module.exports = DB.model('policy_categories', schema)