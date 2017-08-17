'use strict'

module.exports = routeHandler

function routeHandler (app, mongoose, esClient, mexp, co) {
  mongoose.Promise = require('bluebird')

  /*
   ** router
   */
  const router = require('express').Router()
  const OrderRoutes = require('./routes/orderRoutes')
  const collections = require('./collections/collections')(mongoose, co)

  app.set('collections', collections)

  const orderRouter = new OrderRoutes(app, mongoose)

  app.get('/*', function (req, res, next) {
    res.contentType('application/json')
    next()
  })
  app.post('/*', function (req, res, next) {
    res.contentType('application/json')
    next()
  })
  app.put('/*', function (req, res, next) {
    res.contentType('application/json')
    next()
  })
  app.delete('/*', function (req, res, next) {
    res.contentType('application/json')
    next()
  })

    /*
     *  Endpoints that can be accessed by anyone
     */

  router.post('/orders', orderRouter.createOne) // - Creates a new order
  router.get('/orders/:id', orderRouter.retrieveOne) // - Retrieves a specific order
  router.get('/orders', orderRouter.retrieveMany) // - Retrieves a list of orders
  router.delete('/orders/:id', orderRouter.removeOne) // - Removes a specific order
  
  router.get('/ordereditems', orderRouter.countOrderedItems) // - Groups and count ordered items

  app.use('/cloudtech/api/v1.0', router)
}
