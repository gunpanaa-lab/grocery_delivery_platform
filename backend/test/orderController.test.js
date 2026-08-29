const chai = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const { placeOrder, listSellerOrders, updateOrderStatus } = require('../controllers/orderController');

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

describe('listSellerOrders (GROC-67 live order queue)', () => {
  afterEach(() => {
    sinon.restore();
  });

  it("returns only the requesting seller's orders", async () => {
    const sellerId = new mongoose.Types.ObjectId();
    const orders = [{ _id: new mongoose.Types.ObjectId(), seller: sellerId, items: [], total: 5 }];
    const sortStub = sinon.stub().resolves(orders);
    const findStub = sinon.stub(Order, 'find').returns({ sort: sortStub });

    const req = { user: { id: sellerId } };
    const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

    await listSellerOrders(req, res);

    expect(findStub.calledOnceWith({ seller: sellerId })).to.be.true;
    expect(res.json.calledOnce).to.be.true;
  });

  it('returns 500 when the database throws', async () => {
    sinon.stub(Order, 'find').throws(new Error('DB Error'));
    const req = { user: { id: new mongoose.Types.ObjectId() } };
    const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

    await listSellerOrders(req, res);

    expect(res.status.calledWith(500)).to.be.true;
  });
});

describe('updateOrderStatus (GROC-76 status update controls)', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('returns 404 when the order does not exist', async () => {
    sinon.stub(Order, 'findById').resolves(null);
    const req = { user: { id: new mongoose.Types.ObjectId() }, params: { id: new mongoose.Types.ObjectId() }, body: { status: 'preparing' } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await updateOrderStatus(req, res);

    expect(res.status.calledWith(404)).to.be.true;
  });

  it('returns 403 when the order belongs to a different seller', async () => {
    const order = { seller: new mongoose.Types.ObjectId(), status: 'placed', save: sinon.stub().resolvesThis() };
    sinon.stub(Order, 'findById').resolves(order);
    const req = { user: { id: new mongoose.Types.ObjectId() }, params: { id: new mongoose.Types.ObjectId() }, body: { status: 'preparing' } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await updateOrderStatus(req, res);

    expect(res.status.calledWith(403)).to.be.true;
    expect(order.save.called).to.be.false;
  });

  it('returns 400 when the requested status is not the next allowed step', async () => {
    const sellerId = new mongoose.Types.ObjectId();
    const order = { seller: sellerId, status: 'placed', save: sinon.stub().resolvesThis() };
    sinon.stub(Order, 'findById').resolves(order);
    const req = { user: { id: sellerId }, params: { id: new mongoose.Types.ObjectId() }, body: { status: 'delivered' } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await updateOrderStatus(req, res);

    expect(res.status.calledWith(400)).to.be.true;
    expect(order.save.called).to.be.false;
  });

  it('advances the status when the requester owns the order and the step is valid', async () => {
    const sellerId = new mongoose.Types.ObjectId();
    const order = { seller: sellerId, status: 'placed', save: sinon.stub().resolvesThis() };
    sinon.stub(Order, 'findById').resolves(order);
    const req = { user: { id: sellerId }, params: { id: new mongoose.Types.ObjectId() }, body: { status: 'preparing' } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await updateOrderStatus(req, res);

    expect(order.status).to.equal('preparing');
    expect(order.save.calledOnce).to.be.true;
    expect(res.status.called).to.be.false;
  });
});
