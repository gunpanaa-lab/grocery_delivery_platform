// GDP-130: Add stock policies.
// Each policy encapsulates one stock rule

/** Abstract strategy: every policy must implement checkStock(). */
class StockPolicy {
  checkStock(product, requestedQty) {
    throw new Error(`${this.constructor.name} must implement checkStock()`);
  }

  // Shared invariant: an integer greater than 0.
  assertValidQuantity(requestedQty) {
    const qty = Number(requestedQty);
	// GDP-131: No Negative Quantity
    if (Number.isNaN(qty) || qty <= 0 || !Number.isInteger(qty)) {
      return { allowed: false, reason: 'Ordered quantity must be an integer greater than 0.' };
    }
    return { allowed: true, qty };
  }
}

/**
 *  GDP-101 Server-side stock validation on order placement:
 *  reject the order if a line item exceeds stock. 
 **/
class StrictStockPolicy extends StockPolicy {
  checkStock(product, requestedQty) {
    const base = this.assertValidQuantity(requestedQty);
    if (!base.allowed) return base;
	// GDP-131: No Negative Quantity
    if (!product.inStock || product.stockQty < base.qty) {
      return {
        allowed: false,
        reason: `Not enough stock for "${product.name}". Available: ${product.inStock ? product.stockQty : 0}`,
      };
    }
    return { allowed: true, qty: base.qty };
  }
}

const POLICIES = { strict: new StrictStockPolicy()};

function getStockPolicy(name = process.env.STOCK_POLICY || 'strict') {
  const policy = POLICIES[name];
  if (!policy) throw new Error(`Unknown stock policy: ${name}`);
  return policy;
}

export default { StockPolicy, StrictStockPolicy, getStockPolicy };

/** Alternative: accept the order and record the shortfall. */
// class BackorderPolicy extends StockPolicy {
//   checkStock(product, requestedQty) {
//     const base = this.assertValidQuantity(requestedQty);
//     if (!base.allowed) return base;

//     return {
//       allowed: true,
//       qty: base.qty,
//       backordered: Math.max(0, base.qty - product.stockQty),
//     };
//   }
// }
// const POLICIES = { strict: new StrictStockPolicy() , backorder: new BackorderPolicy() };
// function getStockPolicy(name = process.env.STOCK_POLICY || 'strict') {
//   const policy = POLICIES[name];
//   if (!policy) throw new Error(`Unknown stock policy: ${name}`);
//   return policy;
// }

// export default { StockPolicy, StrictStockPolicy, BackorderPolicy, getStockPolicy };
