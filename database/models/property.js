'use strict'

const mongoose = require('mongoose')
const schemaName = 'Properties'
const Schema = mongoose.Schema

const schema = new Schema({
  link: {
    type: String,
    index: true
  },
  price: {
    type: Number
  },
  date: Date,
  phone: String
}, {
  collectionName: schemaName,
  toObject: {
    virtuals: true,
    versionKey: false,
    minimize: true
  },
  toJSON: {
    virtuals: true,
    versionKey: false,
    minimize: false
  }
})

module.exports = mongoose.model(schemaName, schema)
