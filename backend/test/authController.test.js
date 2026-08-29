const chai = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { registerUser } = require('../controllers/authController');

const { expect } = chai;

// Sub Task 1.8 — backend API tests for signup (GROC-2), following the
// sinon-stub controller-test pattern from the reference project's
// backend/test/example_test.js: stub the Mongoose model, call the
// controller directly with mocked req/res, assert on the response.
describe('registerUser (GROC-2 signup)', () => {
  const validBody = {
    role: 'buyer',
    name: 'Ada Lovelace',
    email: 'Ada@Example.com',
    address: '123 St 4066',
    dob: '1990-01-01',
    password: 'supersecret',
  };

  afterEach(() => {
    sinon.restore();
  });

  it('returns 400 with field errors when the payload fails validation', async () => {
    const req = { body: { role: 'buyer' } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await registerUser(req, res);

    expect(res.status.calledWith(400)).to.be.true;
    const payload = res.json.firstCall.args[0];
    expect(payload.message).to.equal('Validation failed');
    expect(payload.errors).to.have.property('name');
    expect(payload.errors).to.have.property('email');
  });

  it('returns 400 when the email is already registered', async () => {
    sinon.stub(User, 'findOne').resolves({ _id: new mongoose.Types.ObjectId(), email: 'ada@example.com' });
    const createStub = sinon.stub(User, 'create');
    const req = { body: validBody };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await registerUser(req, res);

    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWith({ message: 'Email already registered' })).to.be.true;
    expect(createStub.called).to.be.false;
  });

  it('creates the user and returns a token on a valid, unique signup', async () => {
    sinon.stub(User, 'findOne').resolves(null);
    const createdUser = {
      _id: new mongoose.Types.ObjectId(),
      role: 'buyer',
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      address: '123 St 4066',
    };
    const createStub = sinon.stub(User, 'create').resolves(createdUser);
    sinon.stub(jwt, 'sign').returns('signed.jwt.token');

    const req = { body: validBody };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await registerUser(req, res);

    expect(createStub.calledOnce).to.be.true;
    expect(res.status.calledWith(201)).to.be.true;
    const payload = res.json.firstCall.args[0];
    expect(payload).to.include({
      id: createdUser._id,
      role: 'buyer',
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      token: 'signed.jwt.token',
    });
  });

  it('returns 500 when the database throws', async () => {
    sinon.stub(User, 'findOne').resolves(null);
    sinon.stub(User, 'create').throws(new Error('DB Error'));

    const req = { body: validBody };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await registerUser(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;
  });
});
