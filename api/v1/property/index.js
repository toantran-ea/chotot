const express = require('express')
const router = express.Router()
const path = require('path').resolve
const database = require(path('./database'))

router.use(function timeLog (req, res, next) {
  console.log('Time: ', Date.now())
  next()
})

router.get('/list', function (req, res) {
  database.Property.find({}).exec().then(results => {
    res.json(results)
  }).catch(err => {
    console.error(err)
    res.status(500).json({'message': 'internal error in return all properties'})
  })
})

module.exports = router
