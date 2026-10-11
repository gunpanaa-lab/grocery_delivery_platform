const Order = require('../models/Order');
const OrderRepository = require('./OrderRepository');

/**
 * Mongoose-backed implementation of OrderRepository (buyer order
 * history feature). Every Mongoose/MongoDB detail — query shape, sort
 * order, the underlying collection — stays behind this class, so
 * orderController never has to import the Order model directly for
 * the operations exposed here.
 */
class MongoOrderRepository extends OrderRepository {
  async findByBuyer(buyerId) {
    return Order.find({ buyer: buyerId }).sort({ createdAt: -1 });
  }

  async findBySeller(sellerId) {
    return Order.find({ seller: sellerId }).sort({ createdAt: -1 });
  }

  async findById(id) {
    return Order.findById(id);
  }

  async create(orderData) {
    return Order.create(orderData);
  }
}

// Exported as a singleton instance — mirrors how models/Order.js
// exports a single configured model rather than the class itself, so
// every caller shares one repository without re-instantiating it.
module.exports = new MongoOrderRepository();
module.exports.MongoOrderRepository = MongoOrderRepository;
