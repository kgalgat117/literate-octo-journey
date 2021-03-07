var mongoose = require('mongoose')
var DB = require('../config/db')

var schema = new mongoose.Schema({
    account_name: { type: String, required: true },
}, { timestamps: true })

module.exports = DB.model('user_accounts', schema)