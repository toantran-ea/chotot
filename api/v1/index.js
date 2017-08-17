var express = require('express')
var router = express.Router()

const property = require('./property')

router.use(function timeLog (req, res, next) {
  console.log('Time: ', Date.now())
  next()
})

router.use('/property', property)

module.exports = router
