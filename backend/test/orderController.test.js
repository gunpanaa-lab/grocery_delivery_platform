const chai = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const { placeOrder } = require('../controllers/orderController');

const { expect } = chai;

// Sub Task 7.7 — backend API tests for placing an order (GROC-58),
// following the sinon-stub controller-test pattern.
describe('placeOrder (GROC-58 checkout)', () => {
  afterEach(() => {
    sinon.restore();
  });

  const validItems = [{ product: new mongoose.Types.ObjectId(), name: 'Apples', price: 2.5, quantity: 2 }];

  it('returns 400 with field errors when the payload fails validation', async () => {
    const req = { user: { id: new mongoose.Types.ObjectId() }, body: { items: [] } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await placeOrder(req, res);

    expect(res.status.calledWith(400)).to.be.true;
    const payload = res.json.firstCall.args[0];
    expect(payload.message).to.equal('Validation failed');
    expect(payload.errors).to.have.property('items');
    expect(payload.errors).to.have.property('seller');
    expect(payload.errors).to.have.property('deliveryAddress');
  });

  it('creates the order scoped to the authenticated buyer with a server-computed total', async () => {
    const buyerId = new mongoose.Types.ObjectId();
    const sellerId = new mongoose.Types.ObjectId();
    const created = { _id: new mongoose.Types.ObjectId(), buyer: buyerId, seller: sellerId, items: validItems, total: 5, status: 'placed' };
    const createStub = sinon.stub(Order, 'create').resolves(created);

    const req = {
      user: { id: buyerId },
      body: { items: validItems, seller: sellerId, deliveryAddress: '123 St 4066' },
    };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await placeOrder(req, res);

    expect(
      createStub.calledOnceWith(
        sinon.match({ buyer: buyerId, seller: sellerId, total: 5, status: 'placed', paymentMethod: 'pay_on_delivery' })
      )
    ).to.be.true;
    expect(res.status.calledWith(201)).to.be.true;
  });

  it('returns 500 when the database throws', async () => {
    sinon.stub(Order, 'create').throws(new Error('DB Error'));
    const req = {
      user: { id: new mongoose.Types.ObjectId() },
      body: { items: validItems, seller: new mongoose.Types.ObjectId(), deliveryAddress: '123 St 4066' },
    };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await placeOrder(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;
  });
});
