const { expect } = require('chai');
const sinon = require('sinon');
const Order = require('../models/Order');
const OrderRepository = require('../repositories/OrderRepository');
const OrderDataSource = require('../repositories/OrderDataSource');
const MongoOrderDataSource = require('../repositories/MongoOrderDataSource');
const mongoOrderRepository = require('../repositories/MongoOrderRepository');

describe('OrderDataSource (implementor interface)', () => {
  const dataSource = new OrderDataSource();

  it('throws when findByBuyer is not overridden', async () => {
    try {
      await dataSource.findByBuyer('buyer-1');
      throw new Error('expected to throw');
    } catch (error) {
      expect(error.message).to.equal('OrderDataSource.findByBuyer must be implemented by a subclass');
    }
  });

  it('throws when findBySeller is not overridden', async () => {
    try {
      await dataSource.findBySeller('seller-1');
      throw new Error('expected to throw');
    } catch (error) {
      expect(error.message).to.equal('OrderDataSource.findBySeller must be implemented by a subclass');
    }
  });

  it('throws when findById is not overridden', async () => {
    try {
      await dataSource.findById('order-1');
      throw new Error('expected to throw');
    } catch (error) {
      expect(error.message).to.equal('OrderDataSource.findById must be implemented by a subclass');
    }
  });

  it('throws when create is not overridden', async () => {
    try {
      await dataSource.create({});
      throw new Error('expected to throw');
    } catch (error) {
      expect(error.message).to.equal('OrderDataSource.create must be implemented by a subclass');
    }
  });
});

describe('OrderRepository (abstraction)', () => {
  it('delegates operations to its data source', async () => {
    const dataSource = {
      findByBuyer: sinon.stub().resolves(['buyer-order']),
      findBySeller: sinon.stub().resolves(['seller-order']),
      findById: sinon.stub().resolves({ _id: 'order-1' }),
      create: sinon.stub().resolves({ _id: 'order-2' }),
    };
    const repository = new OrderRepository(dataSource);

    expect(await repository.findByBuyer('buyer-1')).to.deep.equal(['buyer-order']);
    expect(dataSource.findByBuyer.calledOnceWith('buyer-1')).to.equal(true);
    expect(await repository.findBySeller('seller-1')).to.deep.equal(['seller-order']);
    expect(dataSource.findBySeller.calledOnceWith('seller-1')).to.equal(true);
    expect(await repository.findById('order-1')).to.deep.equal({ _id: 'order-1' });
    expect(dataSource.findById.calledOnceWith('order-1')).to.equal(true);
    expect(await repository.create({ buyer: 'buyer-1' })).to.deep.equal({ _id: 'order-2' });
    expect(dataSource.create.calledOnceWith({ buyer: 'buyer-1' })).to.equal(true);
  });
});

describe('MongoOrderRepository composition', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('wires the repository abstraction to the Mongo data source', () => {
    expect(mongoOrderRepository).to.be.instanceOf(OrderRepository);
    expect(mongoOrderRepository.dataSource).to.be.instanceOf(MongoOrderDataSource);
    expect(mongoOrderRepository.dataSource).to.be.instanceOf(OrderDataSource);
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
