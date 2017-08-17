'use strict'

module.exports = function (mongoose, co) {
  let collections = {}
  collections.Order = require('./schemas/orderSchema')(mongoose, co)

  return collections
}
