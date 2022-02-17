const { NodeService, UserService, SessionService } = require("../../services");
const chai = require("chai");
const expect = chai.expect;
require("dotenv").config({ path: "../../.env" });

const { UserFactory, NodeFactory } = require("../utils/factories");
const SessionModel = require("../../models/SessionModel");

const mongoose = require("mongoose");
const { nanoid } = require("nanoid");

let userFactory;
let nodeFactory;

before(async () => {
  await mongoose.connect(
    // `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@${process.env.MONGODB_HOST}/publicsphere?retryWrites=true&w=majority`
    'mongodb://localhost:27017/ps_test'
  );
  userFactory = new UserFactory();
  nodeFactory = new NodeFactory();
});

beforeEach(async () => {
  await userFactory.clear();
  await userFactory.generate(2);
  await nodeFactory.clear();
  await nodeFactory.generate(10);
});

describe("SessionService", () => {
  describe("#createSession()", () => {
    it("should return a session token if successful", async () => {
      let result = await SessionService.createSession(
        userFactory.getRandomUser()._id
      );
      expect(result.sessionToken).to.be.a("string");
    });
    it("should return a failure message if user doesn't exist", async () => {
      let result = await SessionService.createSession(nanoid());
      expect(result.status).to.eql("ERROR");
    });
  });
  describe("#authenticateSession()", () => {
    it("should return user if session is valid", async () => {
      const newSessionToken = nanoid(12);

      const session = new SessionModel({
        userId: userFactory.getRandomUser()._id,
        timeStarted: Date.now(),
        sessionToken: newSessionToken,
      });

      await session.save();

      let result = await SessionService.authenticateSession(
        newSessionToken
      );

      expect(result).to.include.keys('user');
    });
    it("should return false if session is NOT valid", async () => {
      const newSessionToken = nanoid(12);

      let result = await SessionService.authenticateSession(
        newSessionToken
      );

      expect(result.status).to.eql("ERROR");
    });
  });
  describe("#removeSession()", () => {
    it("should return the removed session", async () => {
      let sessionId = userFactory.getRandomSession()._id;
      let removedSession = await SessionService.removeSession(sessionId);
      expect(removedSession).to.be.an("object");
    });

    it("should decrease the session count if successful", async () => {
      let beforeCount = await SessionModel.find();
      beforeCount = beforeCount.length;
      let sessionId = userFactory.getRandomSession()._id;
      await SessionService.removeSession(sessionId);
      let afterCount = await SessionModel.find();
      afterCount = afterCount.length;
      expect(afterCount).to.equal(beforeCount - 1);
    });

    it("should throw an error if the session ID doesn't exist", async () => {
      let sessionId = nanoid();
      let result = await SessionService.removeSession(sessionId);
      expect(result.status).to.eql("ERROR");
    });
  });
});

after(async () => {
  await userFactory.clear();
  await nodeFactory.clear();
});
