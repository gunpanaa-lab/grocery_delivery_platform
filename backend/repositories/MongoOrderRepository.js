const OrderRepository = require('./OrderRepository');
const MongoOrderDataSource = require('./MongoOrderDataSource');

/**
 * Composition root for the Bridge: wires the Abstraction
 * (OrderRepository) to its Concrete Implementor (MongoOrderDataSource)
 * exactly once, and exports the resulting object as a shared
 * singleton — mirroring how models/Order.js exports a single
 * configured model rather than the class itself, so every caller
 * (orderController) shares one repository without re-instantiating it.
 *
 * This file's name/path hasn't changed from before the refactor, so
 * nothing that imports it — orderController.js, orderController.test.js —
 * needs to change. They only ever call methods on the object this file
 * exports; they were never aware of (and still aren't aware of) how
 * it's wired together underneath.
 */
module.exports = new OrderRepository(new MongoOrderDataSource());

// Exposed for tests / callers that need the classes themselves rather
// than the pre-wired singleton instance.
module.exports.OrderRepository = OrderRepository;
module.exports.MongoOrderDataSource = MongoOrderDataSource;