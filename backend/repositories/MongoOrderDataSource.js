const Order = require('../models/Order');
const OrderDataSource = require('./OrderDataSource');

/**
 * MongoOrderDataSource (Bridge pattern — Concrete Implementor)
 *
 * The Mongoose/MongoDB-specific implementation of OrderDataSource.
 * Every query-shape, sort-order, and collection detail stays behind
 * this class. If the project ever swapped databases (or needed a fake
 * data source for tests without hitting MongoDB), only a new
 * OrderDataSource subclass would be needed here — OrderRepository and
 * orderController would not change at all.
 */
class MongoOrderDataSource extends OrderDataSource {
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

module.exports = MongoOrderDataSource;
