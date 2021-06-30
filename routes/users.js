var express = require('express');
var router = express.Router();
var axios = require('axios').default

// API to insert message to collection 1 and schedule the insertion to collection 2
router.get('/user', async function (req, res) {
  try {
    console.log('hitting auth url')
    let response = await axios.get(process.env.AUTH_URL)
    console.log('got response froma auth', response.data)
    res.status(200).json({ message: " This is user service !!!!" })
  } catch (error) {
    return res.status(500).json({ message: "something went wrong", error: JSON.stringify(error) })
  }
})

// API to insert message to collection 1 and schedule the insertion to collection 2
router.get('/auth', async function (req, res) {
  try {
    res.status(200).json({ message: " This is auth service !!!!" })
  } catch (error) {
    return res.status(500).json({ message: "something went wrong", error: JSON.stringify(error) })
  }
})

// API to insert message to collection 1 and schedule the insertion to collection 2
router.get('/task', async function (req, res) {
  try {
    console.log('hitting auth url')
    let response = await axios.get(process.env.AUTH_URL)
    console.log('got response from auth', response.data)
    res.status(200).json({ message: " This is task service !!!!" })
  } catch (error) {
    return res.status(500).json({ message: "something went wrong", error: JSON.stringify(error) })
  }
})

// API to insert message to collection 1 and schedule the insertion to collection 2
router.get('/task/user', async function (req, res) {
  try {
    console.log('hitting auth url')
    let response = await axios.get(process.env.AUTH_URL)
    console.log('got response from auth', response.data)
    console.log('hitting user from task url')
    let response2 = await axios.get(process.env.USER_URL)
    console.log('got response to task from user', response2.data)
    res.status(200).json({ message: " This is task service !!!!" })
  } catch (error) {
    return res.status(500).json({ message: "something went wrong", error: JSON.stringify(error) })
  }
})

// API to insert message to collection 1 and schedule the insertion to collection 2
router.get('/user/task', async function (req, res) {
  try {
    console.log('hitting auth url')
    let response = await axios.get(process.env.AUTH_URL)
    console.log('got response from auth', response.data)
    console.log('hitting task from user url')
    let response2 = await axios.get(process.env.TASK_URL)
    console.log('got response to user from task', response2.data)
    res.status(200).json({ message: " This is user service !!!!" })
  } catch (error) {
    return res.status(500).json({ message: "something went wrong", error: JSON.stringify(error) })
  }
})

module.exports = router;