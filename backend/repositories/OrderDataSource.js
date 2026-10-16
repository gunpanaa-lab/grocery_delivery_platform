/**
 * OrderDataSource (Bridge pattern — Implementor)
 *
 * The "how" half of the Bridge: defines the low-level operations any
 * concrete storage engine must provide for order data. OrderRepository
 * (the Abstraction) never talks to a database directly — it only ever
 * calls through this interface, so the storage technology underneath
 * can change without the Abstraction, or anything above it
 * (orderController), knowing or caring.
 *
 * Each method is intentionally unimplemented; a subclass that forgets
 * to override one fails loudly instead of silently returning
 * undefined.
 */
class OrderDataSource {
  /** All orders placed by a given buyer, most recent first. */
  // eslint-disable-next-line no-unused-vars
  async findByBuyer(buyerId) {
    throw new Error('OrderDataSource.findByBuyer must be implemented by a subclass');
  }

  /** All orders placed against a given seller, most recent first. */
  // eslint-disable-next-line no-unused-vars
  async findBySeller(sellerId) {
    throw new Error('OrderDataSource.findBySeller must be implemented by a subclass');
  }

  /** A single order by its id, or null if it does not exist. */
  // eslint-disable-next-line no-unused-vars
  async findById(id) {
    throw new Error('OrderDataSource.findById must be implemented by a subclass');
  }

  /** Persist a new order and return the created record. */
  // eslint-disable-next-line no-unused-vars
  async create(orderData) {
    throw new Error('OrderDataSource.create must be implemented by a subclass');
  }
}

module.exports = OrderDataSource;
