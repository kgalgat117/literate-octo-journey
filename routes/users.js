var express = require('express');
var router = express.Router();
var multer = require('multer')
var policyInfoModel = require('../model/policyInfo')
var beforeScheduleModel = require('../model/beforeSchedule')
var afterScheduleModel = require('../model/afterSchedule')
var commonController = require('../controller/common')
const { StaticPool } = require("node-worker-threads-pool");
var fs = require('fs');
var pidusage = require('pidusage');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'images/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '_' + file.originalname)
  }
})

var upload = multer({ storage: storage })

var workers = {
  agent: './workers/worker.js'
}

const pool = new StaticPool({
  size: 5, // since we are doing 3 insertion operation in parallel.
  task: workers.agent,
  workerData: "workerData!",
  shareEnv: true
});

// Interval to track node utilization and restart if more than 70 %
setInterval(function () {
  pidusage(process.pid, function (err, stats) {
    if (!err) {
      // console.log(stats, "CPU utilization")
      if (stats.cpu > 70) {
        console.log(`CPU Utilization ${stats.cpu}%, restarting in 5 secs`)
        setTimeout(function () {
          process.on("exit", function () {
            require("child_process").spawn(process.argv.shift(), process.argv, {
              cwd: process.cwd(),
              detached: true,
              stdio: "inherit"
            });
          });
          process.exit();
        }, 5000);
      }
    }
  })
}, 60000);

// API to insert message to collection 1 and schedule the insertion to collection 2
router.post('/scheduler', async function (req, res) {
  try {
    if (!req.body.message) {
      return res.status(400).json({ message: "Invalid value for message" })
    }
    if (!req.body.transferTime || new Date(req.body.transferTime) == "Invalid Date" || new Date() > new Date(req.body.transferTime)) {
      return res.status(400).json({ message: "Invalid value or Past Time for transferTime" })
    }
    let message = await beforeScheduleModel.create(req.body)
    setTimeout(() => {
      afterScheduleModel.create(req.body).then(result => {
        console.log(`${message.message} trasferred from collection 1 to collection 2`)
        message.status = 'completed'
        message.save((err, updated) => {
          if (!err) {
            console.log("Status updated for scheduler")
          }
        })
      })
    }, (new Date(req.body.transferTime) - new Date()))
    res.status(200).json({ message: "Message Scheduled" })
  } catch (error) {
    return res.status(500).json({ message: "something went wrong", error: JSON.stringify(error) })
  }
})

// API to group policy based on the user with pagination
router.get('/policy/group', async function (req, res) {
  try {
    let pageNo = 0
    let perPage = 5
    // default value for grouping the docs. Any value from policy or user document can be passed.
    let groupBy = 'firstname'
    if (req.query.pageNo) {
      pageNo = parseInt(req.query.pageNo)
    }
    if (req.query.perPage) {
      perPage = parseInt(req.query.perPage)
    }
    if (req.query.groupBy) {
      groupBy = req.query.groupBy
    }
    let result = await policyInfoModel.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ["$user", 0] }, "$$ROOT"] } }
      },
      {
        $project: { user: 0 }
      },
      {
        $group: {
          _id: `$${groupBy}`,
          policies: {
            $addToSet: {
              "policy_number": "$policy_number",
              "policy_start_date": "$policy_start_date",
              "policy_end_date": "$policy_end_date",
              "policy_carrier": "$policy_carrier",
              "policy_category": "$policy_category",
            }
          }
        }
      },
      {
        $skip: pageNo * perPage
      },
      {
        $limit: perPage
      }
    ])
    return res.status(200).json(result)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: 'Something Went Wrong', error: JSON.stringify(error) })
  }
})

// API to filter policies based on the username (firstname) with pagination
router.get('/policy/search', async function (req, res) {
  try {
    let pageNo = 0
    let perPage = 5
    let matchQuery = {}
    if (req.query.pageNo) {
      pageNo = parseInt(req.query.pageNo)
    }
    if (req.query.perPage) {
      perPage = parseInt(req.query.perPage)
    }
    if (req.query.firstname) {
      matchQuery = {
        firstname: {
          $eq: req.query.firstname
        }
      }
    }
    let result = await policyInfoModel.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ["$user", 0] }, "$$ROOT"] } }
      },
      {
        $project: { user: 0 }
      },
      {
        $match: matchQuery
      },
      {
        $skip: pageNo * perPage
      },
      {
        $limit: perPage
      }
    ])
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: 'Something Went Wrong', error: JSON.stringify(error) })
  }
})

// API to upload xlsx and insert data to db
//using to multer to accept file
router.post('/upload', upload.single('file'), async function (req, res) {
  try {
    if (req.file) {
      // using xlsx module to convert file to json
      var sheetData = commonController.sheetToJson(req.file.path)
      let uniqueAgentsData = []
      let uniquePolicyCategoriesData = []
      let uniquePolicyCarriersData = []
      // identifying unique item amount agents, categories, carriers
      sheetData.data.forEach(item => {
        if (uniqueAgentsData.findIndex(search => search.agent === item.agent) == -1) {
          uniqueAgentsData.push({ agent: item.agent })
        }
        if (uniquePolicyCategoriesData.findIndex(search => search.category_name === item.category_name) == -1) {
          uniquePolicyCategoriesData.push({ category_name: item.category_name })
        }
        if (uniquePolicyCarriersData.findIndex(search => search.company_name === item.company_name) == -1) {
          uniquePolicyCarriersData.push({ company_name: item.company_name })
        }
      })
      console.log('=================> ', new Date(), " <===================== starting User, UserAccount, Agent, Carrier, Category data creation")
      // starting 5 parallel process using worker threads to insert data to db
      // using promise.all to start the policy creation after the below data creation because of reference id dependency
      Promise.all([
        pool.exec({ type: 'create_agent', data: uniqueAgentsData }),
        pool.exec({ type: 'create_policyCarrier', data: uniquePolicyCarriersData }),
        pool.exec({ type: 'create_policyCategory', data: uniquePolicyCategoriesData }),
        pool.exec({ type: 'create_user', data: sheetData.data }),
        pool.exec({ type: 'create_userAccount', data: sheetData.data })
      ]).then(result => {
        console.log('=================> ', new Date(), " <===================== User, UserAccount, Agent, Carrier, Category data creation complete")
        let createdPolicyCarriers = JSON.parse(result[1])
        let createdPolicyCategories = JSON.parse(result[2])
        let createdUsers = JSON.parse(result[3])
        // preparing policy data with reference id's of other tables
        sheetData.data.forEach(sheetItem => {
          sheetItem.user = createdUsers[createdUsers.findIndex(createdUser => (createdUser.phone == sheetItem.phone && createdUser.email == sheetItem.email))]._id
          sheetItem.policy_carrier = createdPolicyCarriers[createdPolicyCarriers.findIndex(createdPolicyCarrier => (sheetItem.company_name == createdPolicyCarrier.company_name))]._id
          sheetItem.policy_category = createdPolicyCategories[createdPolicyCategories.findIndex(createdPolicyCategory => (sheetItem.category_name == createdPolicyCategory.category_name))]._id
        })
        // breaking data for policy creation to take advantage of multi core system
        // each chunk will be processed on a seperate thread
        let chunkedArray = commonController.splitToChunks(sheetData.data, 5)
        let promises = []
        chunkedArray.forEach(unitArray => {
          promises.push(
            pool.exec({ type: 'create_policyInfo', data: unitArray })
          )
        })
        console.log('=================> ', new Date(), " <===================== starting policy data creation")
        Promise.all(promises).then(finalResults => {
          console.log('=================> ', new Date(), " <===================== policy data creation complete")
          res.status(200).json({ message: 'Data Creation Complete' })
          fs.unlink(req.file.path, (err) => {
            if (!err) {
              console.log("Removed file from the system")
            }
          })
        })
      })
    } else {
      res.status(404).json({ message: 'File Not Received' })
    }
  } catch (err) {
    res.status(400).json({ data: err, message: 'something went wrong' })
    fs.unlink(req.file.path, (err) => {
      if (!err) {
        console.log("Removed file from the system")
      }
    })
  }

})

module.exports = router;