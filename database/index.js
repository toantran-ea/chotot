const mongoose = require('mongoose')
const Property = require('./models/property')
const config = require('config')
const uri = config.get('database.uri')
const options = config.get('database.options')

mongoose.connect(uri, options)

mongoose.connection.once('open', () => {
  console.log('Connected to the Database %s', uri)
})
/* istanbul ignore next  */
mongoose.connection.on('error', err => {
  console.error(err.message)
})

/* istanbul ignore next  */
mongoose.connection.on('disconnected', () => {
  console.log('disconected from the DB, reconecting')
  mongoose.connect(uri, options)
})
mongoose.Promise = Promise

exports = module.exports = {
  Property
}
