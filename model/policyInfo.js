var mongoose = require('mongoose')
var DB = require('../config/db')
var envs = require('../config/env')

var schema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    policy_number: { type: String, unique: true, required: true },
    policy_start_date: { type: Date },
    policy_end_date: { type: Date },
    policy_category: { type: mongoose.Schema.Types.ObjectId, ref: 'policy_categories', required: true },
    policy_carrier: { type: mongoose.Schema.Types.ObjectId, ref: 'policy_carriers', required: true }
}, { timestamps: true })

module.exports = DB.model('policy_info', schema)