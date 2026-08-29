const chai = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const {
  listMyProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  setProductStock,
} = require('../controllers/productController');

const { expect } = chai;

// Sub Task 3.8 — backend API tests for seller product management
// (GROC-21), following the sinon-stub controller-test pattern.
describe('productController (GROC-21 seller catalog)', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('listMyProducts', () => {
    it("returns only the requesting seller's products", async () => {
      const sellerId = new mongoose.Types.ObjectId();
      const products = [{ _id: new mongoose.Types.ObjectId(), seller: sellerId, name: 'Apples' }];
      const sortStub = sinon.stub().resolves(products);
      const findStub = sinon.stub(Product, 'find').returns({ sort: sortStub });

      const req = { user: { id: sellerId } };
      const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

      await listMyProducts(req, res);

      expect(findStub.calledOnceWith({ seller: sellerId })).to.be.true;
      expect(res.json.calledOnce).to.be.true;
    });
  });

  describe('createProduct', () => {
    it('returns 400 when the payload fails validation', async () => {
      const req = { user: { id: new mongoose.Types.ObjectId() }, body: { name: '' } };
      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      await createProduct(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.firstCall.args[0].errors).to.have.property('name');
      expect(res.json.firstCall.args[0].errors).to.have.property('price');
    });

    it('creates the product scoped to the authenticated seller', async () => {
      const sellerId = new mongoose.Types.ObjectId();
      const created = { _id: new mongoose.Types.ObjectId(), seller: sellerId, name: 'Apples', price: 2.5 };
      const createStub = sinon.stub(Product, 'create').resolves(created);

      const req = {
        user: { id: sellerId },
        body: { name: 'Apples', price: 2.5, description: '', category: 'produce', imageUrl: '' },
      };
      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      await createProduct(req, res);

      expect(createStub.calledOnceWith(sinon.match({ seller: sellerId, name: 'Apples' }))).to.be.true;
      expect(res.status.calledWith(201)).to.be.true;
    });
  });

  describe('updateProduct', () => {
    it("returns 403 when the product belongs to a different seller", async () => {
      const product = {
        _id: new mongoose.Types.ObjectId(),
        seller: new mongoose.Types.ObjectId(),
        save: sinon.stub().resolvesThis(),
      };
      sinon.stub(Product, 'findById').resolves(product);

      const req = {
        user: { id: new mongoose.Types.ObjectId() },
        params: { id: product._id },
        body: { name: 'Apples', price: 2.5 },
      };
      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      await updateProduct(req, res);

      expect(res.status.calledWith(403)).to.be.true;
      expect(product.save.called).to.be.false;
    });

    it('returns 404 when the product does not exist', async () => {
      sinon.stub(Product, 'findById').resolves(null);
      const req = {
        user: { id: new mongoose.Types.ObjectId() },
        params: { id: new mongoose.Types.ObjectId() },
        body: { name: 'Apples', price: 2.5 },
      };
      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      await updateProduct(req, res);

      expect(res.status.calledWith(404)).to.be.true;
    });

    it('updates the product when the requester is the owning seller', async () => {
      const sellerId = new mongoose.Types.ObjectId();
      const product = {
        _id: new mongoose.Types.ObjectId(),
        seller: sellerId,
        name: 'Old name',
        price: 1,
        save: sinon.stub().resolvesThis(),
      };
      sinon.stub(Product, 'findById').resolves(product);

      const req = {
        user: { id: sellerId },
        params: { id: product._id },
        body: { name: 'New name', price: 4, description: '', category: 'produce', imageUrl: '' },
      };
      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      await updateProduct(req, res);

      expect(product.name).to.equal('New name');
      expect(product.price).to.equal(4);
      expect(product.save.calledOnce).to.be.true;
      expect(res.status.called).to.be.false;
    });
  });

  describe('deleteProduct', () => {
    it("returns 403 when the product belongs to a different seller", async () => {
      const product = {
        seller: new mongoose.Types.ObjectId(),
        deleteOne: sinon.stub().resolves(),
      };
      sinon.stub(Product, 'findById').resolves(product);

      const req = { user: { id: new mongoose.Types.ObjectId() }, params: { id: new mongoose.Types.ObjectId() } };
      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      await deleteProduct(req, res);

      expect(res.status.calledWith(403)).to.be.true;
      expect(product.deleteOne.called).to.be.false;
    });

    it('deletes the product when the requester is the owning seller', async () => {
      const sellerId = new mongoose.Types.ObjectId();
      const product = { seller: sellerId, deleteOne: sinon.stub().resolves() };
      sinon.stub(Product, 'findById').resolves(product);

      const req = { user: { id: sellerId }, params: { id: new mongoose.Types.ObjectId() } };
      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      await deleteProduct(req, res);

      expect(product.deleteOne.calledOnce).to.be.true;
      expect(res.json.calledWith({ message: 'Product deleted' })).to.be.true;
    });
  });

  describe('setProductStock', () => {
    it('returns 400 when inStock is not a boolean', async () => {
      const req = { user: { id: new mongoose.Types.ObjectId() }, params: { id: new mongoose.Types.ObjectId() }, body: { inStock: 'yes' } };
      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      await setProductStock(req, res);

      expect(res.status.calledWith(400)).to.be.true;
    });

    it('returns 403 when the product belongs to a different seller', async () => {
      const product = { seller: new mongoose.Types.ObjectId(), save: sinon.stub().resolvesThis() };
      sinon.stub(Product, 'findById').resolves(product);

      const req = { user: { id: new mongoose.Types.ObjectId() }, params: { id: new mongoose.Types.ObjectId() }, body: { inStock: false } };
      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      await setProductStock(req, res);

      expect(res.status.calledWith(403)).to.be.true;
      expect(product.save.called).to.be.false;
    });

    it('updates inStock when the requester is the owning seller', async () => {
      const sellerId = new mongoose.Types.ObjectId();
      const product = { seller: sellerId, inStock: true, save: sinon.stub().resolvesThis() };
      sinon.stub(Product, 'findById').resolves(product);

      const req = { user: { id: sellerId }, params: { id: new mongoose.Types.ObjectId() }, body: { inStock: false } };
      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      await setProductStock(req, res);

      expect(product.inStock).to.equal(false);
      expect(product.save.calledOnce).to.be.true;
      expect(res.status.called).to.be.false;
    });
  });
});
