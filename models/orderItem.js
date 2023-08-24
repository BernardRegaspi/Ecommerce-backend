const mongoose = require('mongoose');

const orderItemSchema = mongoose.Schema({
  quantity: {
    type: Number,
    require: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    require: true,
  },
});

exports.OrderItem = mongoose.model('OrderItem', orderItemSchema);
