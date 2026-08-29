const chai = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { loginUser } = require('../controllers/authController');

const { expect } = chai;

// Sub Task 2.8 — backend API tests for login (GROC-11), following the
// same sinon-stub controller-test pattern used for GROC-2.8: stub the
// Mongoose model + bcrypt/jwt, call the controller directly with
// mocked req/res, assert on the response.
describe('loginUser (GROC-11 login)', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('returns 400 with field errors when the payload fails validation', async () => {
    const req = { body: { email: 'not-an-email' } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await loginUser(req, res);

    expect(res.status.calledWith(400)).to.be.true;
    const payload = res.json.firstCall.args[0];
    expect(payload.message).to.equal('Validation failed');
    expect(payload.errors).to.have.property('email');
    expect(payload.errors).to.have.property('password');
  });

  it('returns 401 when no user matches the email', async () => {
    sinon.stub(User, 'findOne').resolves(null);
    const req = { body: { email: 'ada@example.com', password: 'supersecret' } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await loginUser(req, res);

    expect(res.status.calledWith(401)).to.be.true;
    expect(res.json.calledWith({ message: 'Invalid email or password' })).to.be.true;
  });

  it('returns 401 when the password does not match', async () => {
    sinon.stub(User, 'findOne').resolves({ _id: new mongoose.Types.ObjectId(), password: 'hashed' });
    sinon.stub(bcrypt, 'compare').resolves(false);
    const req = { body: { email: 'ada@example.com', password: 'wrongpassword' } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await loginUser(req, res);

    expect(res.status.calledWith(401)).to.be.true;
    expect(res.json.calledWith({ message: 'Invalid email or password' })).to.be.true;
  });

  it('returns the user and a token on valid credentials', async () => {
    const user = {
      _id: new mongoose.Types.ObjectId(),
      role: 'buyer',
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      address: '123 St 4066',
      password: 'hashed',
    };
    sinon.stub(User, 'findOne').resolves(user);
    sinon.stub(bcrypt, 'compare').resolves(true);
    sinon.stub(jwt, 'sign').returns('signed.jwt.token');

    const req = { body: { email: 'ada@example.com', password: 'supersecret' } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await loginUser(req, res);

    expect(res.status.calledWith(200)).to.be.true;
    const payload = res.json.firstCall.args[0];
    expect(payload).to.include({
      id: user._id,
      role: 'buyer',
      email: 'ada@example.com',
      token: 'signed.jwt.token',
    });
    expect(payload).to.not.have.property('password');
  });

  it('returns 500 when the database throws', async () => {
    sinon.stub(User, 'findOne').throws(new Error('DB Error'));
    const req = { body: { email: 'ada@example.com', password: 'supersecret' } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await loginUser(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;
  });
});
