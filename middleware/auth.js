var envs = require('./../config/env')

var middlewares = {}

async function validateUser(req, res, next) {
    try {

    } catch (err) {
        res.status(400).json({ message: 'something went wrong 6' })
    }
}

middlewares.validateUser = validateUser

module.exports = middlewares