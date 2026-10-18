const chai = require('chai');
const {
  StockPolicy, StrictStockPolicy, BackorderPolicy, getStockPolicy,
} = require('../strategies/stockPolicies').default;

const { expect } = chai;

// Unit tests for the Strategy pattern
// No Express and no MongoDB
describe('StockPolicy (GDP-130 Strategy pattern)', () => {
  describe('StrictStockPolicy', () => {
    const policy = new StrictStockPolicy();

    it('allows an order when stock covers the requested quantity', () => {
      const result = policy.checkStock({ name: 'Milk', inStock: true, stockQty: 10 }, 3);
      expect(result.allowed).to.be.true;
      expect(result.qty).to.equal(3);
    });

    it('allows an order that exactly consumes the remaining stock', () => {
      const result = policy.checkStock({ name: 'Milk', inStock: true, stockQty: 5 }, 5);
      expect(result.allowed).to.be.true;
    });

    it('rejects an order that exceeds stock and names the item', () => {
      const result = policy.checkStock({ name: 'Milk', inStock: true, stockQty: 2 }, 5);
      expect(result.allowed).to.be.false;
      expect(result.reason).to.equal('Not enough stock for "Milk". Available: 2');
    });

    it('rejects an out-of-stock product regardless of the stored count', () => {
      const result = policy.checkStock({ name: 'Milk', inStock: false, stockQty: 99 }, 1);
      expect(result.allowed).to.be.false;
      expect(result.reason).to.equal('Not enough stock for "Milk". Available: 0');
    });

    it('rejects a negative, zero, decimal or non-numeric quantity (GDP-130)', () => {
      const product = { name: 'Milk', inStock: true, stockQty: 10 };
      [-1, 0, 1.5, 'abc'].forEach((qty) => {
        const result = policy.checkStock(product, qty);
        expect(result.allowed, `quantity ${qty} should be rejected`).to.be.false;
      });
    });
  });

//   describe('interchangeability', () => {
//     it('BackorderPolicy accepts the same input StrictStockPolicy rejects', () => {
//       const product = { name: 'Milk', inStock: true, stockQty: 2 };
//       expect(new StrictStockPolicy().checkStock(product, 5).allowed).to.be.false;
//       expect(new BackorderPolicy().checkStock(product, 5).allowed).to.be.true;
//     });

//     it('BackorderPolicy reports the shortfall', () => {
//       const result = new BackorderPolicy().checkStock({ name: 'Milk', inStock: true, stockQty: 2 }, 5);
//       expect(result.backordered).to.equal(3);
//     });
//   });

  describe('factory and abstract strategy', () => {
    // it('getStockPolicy defaults to strict (GDP-130)', () => {
    //   expect(getStockPolicy()).to.be.instanceOf(StrictStockPolicy);
    //   expect(getStockPolicy('backorder')).to.be.instanceOf(BackorderPolicy);
    // });

    it('getStockPolicy rejects an unknown policy name', () => {
      expect(() => getStockPolicy('nope')).to.throw('Unknown stock policy: nope');
    });

    it('the abstract strategy cannot be used directly', () => {
      expect(() => new StockPolicy().checkStock({}, 1))
        .to.throw('StockPolicy must implement checkStock()');
    });
  });
});
