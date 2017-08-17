'use strict'

const sanitize = require('mongo-sanitize')
const ucfirst = require('ucfirst')
const logger = require('../../logger')
const co = require('co')
let Order

module.exports = Routes

function Routes (app, mongoose) {
  mongoose.Promise = require('bluebird')
  Order = app.get('collections')['Order']
}

/**
 * Creates a new order
 * @method createOne
 * @param req
 * @param res
 */
Routes.prototype.createOne = function (req, res) {
  logger.debug('Router for POST /orders')
  
  let createNewOrder = new Promise(function (resolve, reject) {
    let keys = {
      companyName : undefined,
      customerAddress : undefined,
      orderedItem : undefined,
    }
    let response = {}
    let params = {}
    logger.debug('Checking all required parameters')
    for (let key in keys) {
      // if one of the required param is undefined, process is stopped
      if (!req.body.hasOwnProperty(key)) {
        response.errMsg = key + ' undefined'
        response.json = {error: response.errMsg}
        logger.error(response.errMsg)
        res.status(400)
        res.json(response.json)
        reject(response.json)
      }
      else {
        params[key] = req.body[key]
      }
    }
    resolve(params)
  })
  .then((data) => {
    let response = {}
    if (!data) {
      response.errMsg = 'Data are required to create an Order object!'
      logger.error(response.errMsg)
      res.status(400)
      res.json({error: response.errMsg})
    }
    else {
      let obj = new Order(data)
      obj.save(function (err, newObj) {
        if (err) {
          logger.error('Internal error with mongoose while creating new order')
          res.status(400)
          res.json({error: response.errMsg})
        } else {
          logger.debug('Successfully created new order')
          res.status(201)
          res.json(newObj)
        }
      })
    }
  })
  
  createNewOrder
    .catch((err) => {
      res.status(400)
      res.json({ error: 'An error occured.' })
    })
}

/**
 * Retrieves several order objects
 * @method retrieveMany
 * @param req
 * @param res
 */
Routes.prototype.retrieveMany = function (req, res) {
  logger.debug('Router for GET /orders')
  
  let searchOrders = new Promise(function (resolve, reject) {
    let response = {}
    let query = Order.find()
    // applying filters (or not)
    for (let key in req.query) {
      let clean = sanitize(req.query[key])
      if (key in { companyName:undefined, customerAddress:undefined, orderedItem:undefined }) {
        query = query.where(key).equals(new RegExp('^' + clean.replace('+', ' '), 'i'))
      }
    }
    query.lean().exec(function(err, objs) {
      if (err || !objs) {
        response.errMsg = 'Internal error with mongoose looking for orders list'
        response.json = {error: response.errMsg}
        logger.error(response.errMsg)
        res.status(400)
        res.json(response.json)
        reject(response.json)
      }
      else if (objs.length === 0) {
        response.errMsg = 'No order objects found in the database'
        response.json = {error: response.errMsg}
        logger.error(response.errMsg)
        res.status(400)
        res.json(response.json)
        reject(response.json)
      }
      else {
        logger.debug('Successfully find order object results')
        res.status(200)
        res.json(objs)
        resolve(objs)
      }
    })
  })

  searchOrders
    .catch((err) => {
      res.status(400)
      res.json({ error: 'An error occured.' })
    })
}

/**
 * Retrieves a specific order object
 * @method retrieveOne
 * @param req
 * @param res
 */
Routes.prototype.retrieveOne = function (req, res) {
  logger.debug('Router for GET /orders/:id')
  
  let searchOrder = new Promise(function (resolve, reject) {
    let response = {}
    let orderId = sanitize(req.params['id'])
  
    Order.findOne({ _id : orderId }).lean().exec(function(err, obj) {
      if (err || !obj) {
        response.errMsg = 'Internal error with mongoose looking for order object with id ' + orderId
        response.json = {error: response.errMsg}
        logger.error(response.errMsg)
        res.status(400)
        res.json(response.json)
        reject(response.json)
      }
      else {
        logger.debug('Successfully found order object with id ' + orderId)
        res.status(200)
        res.json(obj)
        resolve(obj)
      }
    })
  })
  
  searchOrder
    .catch((err) => {
      res.status(400)
      res.json({ error: 'An error occured.' })
    })
}

/**
 * Count how often each item has been ordered
 * @method countOrderedItems
 * @param req
 * @param res
 */
Routes.prototype.countOrderedItems = function (req, res) {
  logger.debug('Router for GET /ordereditems')
  
  let searchOrders = new Promise(function (resolve, reject) {
    let response = {}
    const options = [
      {
        $group: {
          _id: "$orderedItem",
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.count": -1 } } // sort in descending order
    ]
  
    Order.aggregate(options).exec(function(err, objs) {
      if (err || !objs) {
        response.errMsg = 'Internal error with mongoose looking for order items'
        response.json = {error: response.errMsg}
        logger.error(response.errMsg)
        res.status(400)
        res.json(response.json)
        reject(response.json)
      }
      else if (objs.length === 0) {
        response.errMsg = 'No order item found in the database'
        response.json = {error: response.errMsg}
        logger.error(response.errMsg)
        res.status(400)
        res.json(response.json)
        reject(response.json)
      }
      else {
        logger.debug('Successfully find order items results')
        res.status(200)
        res.json(objs)
        resolve(objs)
      }
    })
  })
  
  searchOrders
    .catch((err) => {
      res.status(400)
      res.json({ error: 'An error occured.' })
    })
}

/**
 * Removes a specific order object
 * @method retrieveOne
 * @param req
 * @param res
 */
Routes.prototype.removeOne = function (req, res) {
  logger.debug('Router for DELETE /orders/:id')
  
  let searchOrder = new Promise(function (resolve, reject) {
    let response = {}
    let orderId = sanitize(req.params['id'])
  
    Order.findOne({ _id : orderId }).exec(function(err, obj) {
      if (err || !obj) {
        response.errMsg = 'Internal error with mongoose looking for order object with id ' + orderId
        response.json = {error: response.errMsg}
        logger.error(response.errMsg)
        res.status(400)
        res.json(response.json)
        reject(response.json)
      }
      else {
        obj.remove(function (err) {
          if (err) {
            response.errMsg = 'Internal error with mongoose removing order object with id ' + orderId
            response.json = {error: response.errMsg}
            logger.error(response.errMsg)
            res.status(400)
            res.json({error: response.errMsg})
            reject(response.json)
          }
          response.msg = 'Successfully removed order object with id ' + orderId
          response.json = {msg: response.msg}
          logger.debug(response.msg)
          res.status(200)
          res.json(response.json)
          resolve(response.json)
        })
      }
    })
  })
  
  searchOrder
    .catch((err) => {
      res.status(400)
      res.json({ error: 'An error occured.' })
    })
}
