/**
 * OrderRepository (Bridge pattern — Abstraction)
 *
 * The "what" half of the Bridge: the interface orderController
 * actually programs against ("give me this buyer's orders"), kept
 * deliberately separate from *how* that data is actually fetched.
 *
 * Unlike the earlier inheritance-based version of this class
 * (MongoOrderRepository extends OrderRepository), this is now a
 * concrete class that is handed an OrderDataSource (the Implementor)
 * through its constructor and delegates every call to it. That
 * composition — "has-a" data source, not "is-a" Mongo-specific
 * subclass — is what the GoF Bridge pattern (Week 6, Structural
 * patterns) actually means by "decouple an abstraction from its
 * implementation so the two can vary independently": the data source
 * can be swapped (a different database, or a fake one for tests)
 * without writing a new OrderRepository subclass, and OrderRepository
 * itself is free to grow its own behaviour later (caching, logging,
 * validation) without touching the data source at all.
 */
class OrderRepository {
  constructor(dataSource) {
    this.dataSource = dataSource;
  }

  /** All orders placed by a given buyer, most recent first. */
  async findByBuyer(buyerId) {
    return this.dataSource.findByBuyer(buyerId);
  }

  /** All orders placed against a given seller, most recent first. */
  async findBySeller(sellerId) {
    return this.dataSource.findBySeller(sellerId);
  }

  /** A single order by its id, or null if it does not exist. */
  async findById(id) {
    return this.dataSource.findById(id);
  }

  /** Persist a new order and return the created record. */
  async create(orderData) {
    return this.dataSource.create(orderData);
  }
}

module.exports = OrderRepository;
