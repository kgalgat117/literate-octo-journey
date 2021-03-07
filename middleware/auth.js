var authController = require('./../controller/auth')
var envs = require('./../config/env')

var middlewares = {}

async function validateUser(req, res, next) {
    try {
        if (req.headers.authorization) {
            let token = req.headers.authorization.split(' ')[1]
            if (token) {
                let payload = authController.validateToken(token)
                if (payload) {
                    let filter = {}
                    if (payload.primaryPhone) {
                        filter = { primaryPhone: payload.primaryPhone }
                    } else {
                        filter = { primaryEmail: payload.primaryEmail }
                    }
                    req.user = await userModel.findOne(filter).populate({ path: 'plan', model: planModel })
                    if (req.user) {
                        req.user = req.user.toJSON()
                        if (req.user.status == 'active') {
                            next()
                        } else {
                            res.status(403).json({ message: 'Your Account is blocked. Please contact admin.' })
                        }
                    } else {
                        res.status(401).json({ message: 'unauthorized request 2' })
                    }
                } else {
                    res.status(401).json({ message: 'unauthorized request 3' })
                }
            } else {
                res.status(401).json({ message: 'unauthorized request 4' })
            }
        } else {
            res.status(401).json({ message: 'unauthorized request 5' })
        }
    } catch (err) {
        res.status(400).json({ message: 'something went wrong 6' })
    }
}

middlewares.validateUser = validateUser

module.exports = middlewares