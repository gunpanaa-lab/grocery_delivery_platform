/**
 * OrderRepository (abstract base class)
 *
 * Defines the contract every order data-access implementation must
 * satisfy, so callers (controllers) depend on *what* order data they
 * need rather than *how* it is stored or queried.
 *
 * This is the Abstraction the Repository pattern relies on:
 * MongoOrderRepository is the only concrete implementation today, but
 * a controller written against this interface would not need to
 * change if the storage engine (or query library) ever changed —
 * only a new subclass would be written.
 *
 * Each method here is intentionally unimplemented; a subclass that
 * forgets to override one fails loudly instead of silently returning
 * undefined.
 */
class OrderRepository {
  /** All orders placed by a given buyer, most recent first. */
  // eslint-disable-next-line no-unused-vars
  async findByBuyer(buyerId) {
    throw new Error('OrderRepository.findByBuyer must be implemented by a subclass');
  }

  /** All orders placed against a given seller, most recent first. */
  // eslint-disable-next-line no-unused-vars
  async findBySeller(sellerId) {
    throw new Error('OrderRepository.findBySeller must be implemented by a subclass');
  }

  /** A single order by its id, or null if it does not exist. */
  // eslint-disable-next-line no-unused-vars
  async findById(id) {
    throw new Error('OrderRepository.findById must be implemented by a subclass');
  }

  /** Persist a new order and return the created record. */
  // eslint-disable-next-line no-unused-vars
  async create(orderData) {
    throw new Error('OrderRepository.create must be implemented by a subclass');
  }
}

module.exports = OrderRepository;
