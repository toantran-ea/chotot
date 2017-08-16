'use strict'

const mongoose = require('mongoose')
const schemaName = 'Properties'
const Schema = mongoose.Schema

const addressSchema = new Schema({
  _id: false,
  district: {
    type: String,
    required: 'District is required'
  },
  street: String,
  meta: String
}, {
  toObject: {
    virtuals: true
  },
  toJSON: {
    virtuals: true
  }
})

const propertySchema = new Schema({
  link: {
    type: String,
    index: true,
    unique: true
  },
  price: {
    type: Number
  },
  date: Date,
  phone: String,
  address: addressSchema,
  shortDescription: String
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

module.exports = mongoose.model(schemaName, propertySchema)
