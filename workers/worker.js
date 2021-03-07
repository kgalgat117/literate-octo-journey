// Access the workerData by requiring it.
const { parentPort, workerData } = require("worker_threads");
var agentModel = require('./../model/agent')
var userModel = require('./../model/user')
var userAccountModel = require('../model/userAccount')
var policyCarrierModel = require('../model/policyCarrier')
var policyCategoryModel = require('../model/policyCategory')
var policyInfoModel = require('../model/policyInfo')

// Something we shouldn"t run in main thread
// since it will block.
function createAgent(data) {
    return agentModel.insertMany(data)
}

function findAllAgent() {
    return agentModel.find()
}

function createUser(data) {
    return userModel.insertMany(data)
}

function createUserAccount(data) {
    return userAccountModel.insertMany(data)
}

function createPolicyCarrier(data) {
    return policyCarrierModel.insertMany(data)
}

function findAllPolicyCarrier() {
    return policyCarrierModel.find()
}

function createPolicyCategory(data) {
    return policyCategoryModel.insertMany(data)
}

function findAllPolicyCategory() {
    return policyCategoryModel.find()
}

function createPolicyInfo(data) {
    return policyInfoModel.insertMany(data)
}

// Main thread will pass the data we need
// through this event listener.
parentPort.on("message", async (param) => {
    var result = []
    if (param.type == 'create_agent') {
        result = await createAgent(param.data)
    } else if (param.type == 'create_user') {
        result = await createUser(param.data)
    } else if (param.type == 'create_userAccount') {
        result = await createUserAccount(param.data)
    } else if (param.type == 'create_policyCarrier') {
        result = await createPolicyCarrier(param.data)
    } else if (param.type == 'create_policyCategory') {
        result = await createPolicyCategory(param.data)
    } else if (param.type == 'create_policyInfo') {
        result = await createPolicyInfo(param.data)
    } else if (param.type == 'get_agent') {
        result = await findAllAgent()
    } else if (param.type == 'get_policy_carrier') {
        result = await findAllPolicyCarrier()
    } else if (param.type == 'get_policy_category') {
        result = await findAllPolicyCategory()
    }
    // return the result to main thread.
    parentPort.postMessage(JSON.stringify(result));
});