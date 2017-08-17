'use strict'

module.exports = function (mongoose, moment, co) {
  let autoIncrement = require('mongoose-auto-increment')
  mongoose = require('mongoose')
  mongoose.Promise = require('bluebird')

  let orderSchema = new mongoose.Schema({
    _id: {type: Number},
    companyName: { type: String,
      required: true,
      validate: [
        function (v) { return v.length > 1 },
        'Company name must have at least 2 characters'
      ]
    },
    customerAddress: { type: String,
      required: true,
      validate: [
        function (v) { return v.length > 2 },
        'Customer address must have at least 3 characters'
      ]
    },
    orderedItem: { type: String,
        required: true,
        validate: [
          function (v) { return v.length > 2 },
          'Ordered item name must have at least 3 characters'
        ]
      },
  },
        { collection: 'order' }
    )

  orderSchema.index({_id: 1}, {unique: true})
  
  orderSchema.virtual('orderId').get(function () {
    return this._id;
  })
  
  autoIncrement.initialize(mongoose.connection)
  orderSchema.plugin(autoIncrement.plugin, 'Order');
  let Order = mongoose.model('Order', orderSchema)

  return Order
}
