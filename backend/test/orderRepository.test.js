const { expect } = require('chai');
const sinon = require('sinon');
const Order = require('../models/Order');
const OrderRepository = require('../repositories/OrderRepository');
const mongoOrderRepository = require('../repositories/MongoOrderRepository');
const { MongoOrderRepository } = require('../repositories/MongoOrderRepository');

describe('OrderRepository (abstract base class)', () => {
  const repo = new OrderRepository();

  it('throws when findByBuyer is not overridden', async () => {
    try {
      await repo.findByBuyer('buyer-1');
      throw new Error('expected to throw');
    } catch (error) {
      expect(error.message).to.equal('OrderRepository.findByBuyer must be implemented by a subclass');
    }
  });

  it('throws when findBySeller is not overridden', async () => {
    try {
      await repo.findBySeller('seller-1');
      throw new Error('expected to throw');
    } catch (error) {
      expect(error.message).to.equal('OrderRepository.findBySeller must be implemented by a subclass');
    }
  });

  it('throws when findById is not overridden', async () => {
    try {
      await repo.findById('order-1');
      throw new Error('expected to throw');
    } catch (error) {
      expect(error.message).to.equal('OrderRepository.findById must be implemented by a subclass');
    }
  });

  it('throws when create is not overridden', async () => {
    try {
      await repo.create({});
      throw new Error('expected to throw');
    } catch (error) {
      expect(error.message).to.equal('OrderRepository.create must be implemented by a subclass');
    }
  });
});

describe('MongoOrderRepository', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('is an instance of OrderRepository (Abstraction/Inheritance)', () => {
    expect(mongoOrderRepository).to.be.instanceOf(OrderRepository);
    expect(mongoOrderRepository).to.be.instanceOf(MongoOrderRepository);
  });

  it('findByBuyer delegates to Order.find, sorted newest first', async () => {
    const fakeSort = sinon.stub().resolves(['order-a']);
    const findStub = sinon.stub(Order, 'find').returns({ sort: fakeSort });

    const result = await mongoOrderRepository.findByBuyer('buyer-1');

    expect(findStub.calledOnceWith({ buyer: 'buyer-1' })).to.equal(true);
    expect(fakeSort.calledOnceWith({ createdAt: -1 })).to.equal(true);
    expect(result).to.deep.equal(['order-a']);
  });

  it('findBySeller delegates to Order.find, sorted newest first', async () => {
    const fakeSort = sinon.stub().resolves(['order-b']);
    const findStub = sinon.stub(Order, 'find').returns({ sort: fakeSort });

    const result = await mongoOrderRepository.findBySeller('seller-1');

    expect(findStub.calledOnceWith({ seller: 'seller-1' })).to.equal(true);
    expect(fakeSort.calledOnceWith({ createdAt: -1 })).to.equal(true);
    expect(result).to.deep.equal(['order-b']);
  });

  it('findById delegates to Order.findById', async () => {
    const findByIdStub = sinon.stub(Order, 'findById').resolves({ _id: 'order-1' });

    const result = await mongoOrderRepository.findById('order-1');

    expect(findByIdStub.calledOnceWith('order-1')).to.equal(true);
    expect(result).to.deep.equal({ _id: 'order-1' });
  });

  it('create delegates to Order.create', async () => {
    const createStub = sinon.stub(Order, 'create').resolves({ _id: 'order-2' });

    const result = await mongoOrderRepository.create({ buyer: 'buyer-1' });

    expect(createStub.calledOnceWith({ buyer: 'buyer-1' })).to.equal(true);
    expect(result).to.deep.equal({ _id: 'order-2' });
  });
});
