const chai = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const { cancelOrder } = require('../controllers/orderController');
const { requireRole } = require('../middleware/authMiddleware');
const { getOrderState, OrderState, OrderStateError } = require('../states/orderStates');

const { expect } = chai;

// GDP-120 — automated tests for buyer order cancellation (GDP-103, FR-13),
// following the sinon-stub controller-test pattern.
describe('cancelOrder (GDP-103 buyer order cancellation)', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('returns 200 and sets status to cancelled when the buyer cancels their own placed order', async () => {
    const buyerId = new mongoose.Types.ObjectId();
    const order = { _id: new mongoose.Types.ObjectId(), buyer: buyerId, status: 'placed', save: sinon.stub().resolvesThis() };
    sinon.stub(Order, 'findById').resolves(order);
    const req = { user: { id: buyerId }, params: { id: order._id } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await cancelOrder(req, res);

    expect(order.status).to.equal('cancelled');
    expect(order.save.calledOnce).to.be.true;
    expect(res.status.called).to.be.false; // Express default is 200
    expect(res.json.firstCall.args[0]).to.include({ id: order._id, status: 'cancelled' });
  });

  it('returns 400 and keeps the status when the order is already preparing', async () => {
    const buyerId = new mongoose.Types.ObjectId();
    const order = { buyer: buyerId, status: 'preparing', save: sinon.stub().resolvesThis() };
    sinon.stub(Order, 'findById').resolves(order);
    const req = { user: { id: buyerId }, params: { id: new mongoose.Types.ObjectId() } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await cancelOrder(req, res);

    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWithMatch({ message: "An order in status 'preparing' cannot be cancelled" })).to.be.true;
    expect(order.status).to.equal('preparing');
    expect(order.save.called).to.be.false;
  });

  it("returns 403 when a buyer tries to cancel another buyer's order", async () => {
    const order = { buyer: new mongoose.Types.ObjectId(), status: 'placed', save: sinon.stub().resolvesThis() };
    sinon.stub(Order, 'findById').resolves(order);
    const req = { user: { id: new mongoose.Types.ObjectId() }, params: { id: new mongoose.Types.ObjectId() } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await cancelOrder(req, res);

    expect(res.status.calledWith(403)).to.be.true;
    expect(order.status).to.equal('placed');
    expect(order.save.called).to.be.false;
  });

  it('returns 404 when the order does not exist', async () => {
    sinon.stub(Order, 'findById').resolves(null);
    const req = { user: { id: new mongoose.Types.ObjectId() }, params: { id: new mongoose.Types.ObjectId() } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await cancelOrder(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'Order not found' })).to.be.true;
  });

  it('returns 500 when the database throws', async () => {
    sinon.stub(Order, 'findById').throws(new Error('DB Error'));
    const req = { user: { id: new mongoose.Types.ObjectId() }, params: { id: new mongoose.Types.ObjectId() } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await cancelOrder(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;
  });
});

// A seller never reaches cancelOrder: requireRole('buyer') on the route
// stops the request first. So the seller case is tested on the middleware.
describe("requireRole('buyer') on PATCH /api/orders/:id/cancel (GDP-103)", () => {
  it('returns 403 and does not call next() when a seller attempts to cancel', () => {
    const req = { user: { id: new mongoose.Types.ObjectId(), role: 'seller' } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };
    const next = sinon.spy();

    requireRole('buyer')(req, res, next);

    expect(res.status.calledWith(403)).to.be.true;
    expect(next.called).to.be.false;
  });

  it('calls next() when a buyer sends the request', () => {
    const req = { user: { id: new mongoose.Types.ObjectId(), role: 'buyer' } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };
    const next = sinon.spy();

    requireRole('buyer')(req, res, next);

    expect(next.calledOnce).to.be.true;
    expect(res.status.called).to.be.false;
  });
});

// GDP-117 — every state object shares the OrderState interface (polymorphism),
// and only the placed state allows cancellation.
describe('order state objects (GDP-117 State pattern)', () => {
  const ALL_STATUSES = ['placed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];

  it('returns an OrderState for every status in the Order model', () => {
    expect(Order.ORDER_STATUSES).to.have.members(ALL_STATUSES);
    ALL_STATUSES.forEach((status) => {
      const state = getOrderState(status);
      expect(state).to.be.instanceOf(OrderState);
      expect(state.name).to.equal(status);
    });
  });

  it('allows cancel only from placed and throws OrderStateError (400) for every other status', () => {
    ALL_STATUSES.forEach((status) => {
      const order = { status };
      if (status === 'placed') {
        getOrderState(status).cancel(order);
        expect(order.status).to.equal('cancelled');
      } else {
        expect(() => getOrderState(status).cancel(order))
          .to.throw(OrderStateError)
          .with.property('statusCode', 400);
        expect(order.status).to.equal(status);
      }
    });
  });

  it('throws OrderStateError (500) for an unknown status', () => {
    expect(() => getOrderState('unknown')).to.throw(OrderStateError).with.property('statusCode', 500);
  });
});