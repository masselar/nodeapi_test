// Main file

'use strict'

const toobusy = require('toobusy-js')
const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const filter = require('content-filter')
const methodOverride = require('method-override')
const multer = require('multer')
const errorHandler = require('errorhandler')
const co = require('co')
const endpoints = require('./app/endpoints')
const db = require('./config/db')
const app = express()

let currentDB = db.localDB
let env = 'default'

// MongoDB connection
const mongoose = require('mongoose').set('debug', true)
mongoose.Promise = require('bluebird')
mongoose.connect(currentDB)

// Express environments
app.set('port', process.env.PORT || 8081)
app.use(morgan('combined'))
app.use(methodOverride())

// CORS headers
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
    // Setting custom headers
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  res.header('Access-Control-Allow-Headers', 'Authorization')
  res.header('Access-Control-Allow-Headers', 'Accept,X-Auth-Token,X-Auth-Key')
  next()
})
app.use(bodyParser.json({strict: false}))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(multer())

app.use(filter({urlMessage: 'A forbidden character set has been found in URL: '}))
// Middleware which blocks requests when server is too busy
app.use(function (req, res, next) {
  if (toobusy()) {
    res.status(503)
    res.json({ msg: 'Service Unavailable. Try again later on!' })
  } else {
    next()
  }
})

// Ignoring ssl certificate errors
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

// API Router
endpoints(app, mongoose, co)

// Middleware which handles bad URL if no route is matched
app.use(function (req, res, next) {
  res.status(404)
  res.json({ error: 'Endpoint not Found!' })
})

// Middleware which handles errors
if (app.get('env') === 'development') {
  app.use(errorHandler())
}

// unhandled rejection management
const unhandledRejection = require('unhandled-rejection')
let rejectionEmitter = unhandledRejection({
  timeout: 20
})

rejectionEmitter.on('unhandledRejection', (error, promise) => {
  console.error(error, promise)
})

rejectionEmitter.on('rejectionHandled', (error, promise) => {
  console.error(error, promise)
})

// Launching server
app.listen(app.get('port'), function () {
  console.log('CloudTech API listening on port ' + app.get('port') + ' on ' + env + ' environment')
})
