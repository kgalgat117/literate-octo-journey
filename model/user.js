var mongoose = require('mongoose')
var DB = require('../config/db')

var schema = new mongoose.Schema({
    firstname: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    userType: { type: String, required: true },
    dob: { type: String, required: true },
    address: { type: String },
    state: { type: String },
    zip: { type: String },
    gender: { type: String }
}, { timestamps: true })

module.exports = DB.model('users', schema)