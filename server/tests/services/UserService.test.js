const { NodeService, UserService, SessionService } = require("../../services");
const chai = require("chai");
const expect = chai.expect;
require("dotenv").config({ path: "../../.env" });

const { UserFactory, NodeFactory } = require("../utils/factories");

const NodeModel = require("../../models/NodeModel");
const UserModel = require("../../models/UserModel");
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

describe("UserService", () => {
  describe("#getUsers()", () => {
    it("should return the correct number of users", async () => {
      let result = await UserService.getUsers();
      expect(result.users.length).to.equal(2);
    });
  });
  describe("#register()", () => {
    it("should return a new ID if successful", async () => {
      let result = await UserService.register(nanoid(5), "test");
      expect(result.userId).to.be.a("string");
    });
    it("should return an error if username is taken", async () => {
      let user = userFactory.getRandomUser();
      let result = await UserService.register(user.username, "test");
      expect(result.status).to.eql("ERROR");
    });
    it("should increase the user count if successful", async () => {
      let beforeCount = await UserModel.find();
      beforeCount = beforeCount.length;      
      await UserService.register(nanoid(5), "test");
      let afterCount = await UserModel.find();
      afterCount = afterCount.length;
      expect(afterCount).to.equal(beforeCount + 1);
    });
  });
  describe("#login()", () => {
    it("should return a success message if username and password match", async () => {
      let user = userFactory.getRandomUser();
      let result = await UserService.login(
        user.username,
        user.plaintextPassword
      );
      expect(result.status).to.eql("OK");
    });
    it("should return an error if password fails", async () => {
      let user = userFactory.getRandomUser();
      let result = await UserService.login(user.username, nanoid(5));
      expect(result.status).to.eql("ERROR");
    });
    it("should return an error if username doesn't exist", async () => {
      let result = await UserService.login(nanoid(5), nanoid(5));
      expect(result.status).to.eql("ERROR");
    });
    it("should start a new session", async () => {
      let user = userFactory.getRandomUser();
      let initialSessionCount = await SessionModel.find();
      initialSessionCount = initialSessionCount.length;
      await UserService.login(user.username, user.password);
      let finalSessionCount = await SessionModel.find();
      finalSessionCount = finalSessionCount.length;
      expect(finalSessionCount).to.equal(initialSessionCount + 1);
    });
    it("should return a new session token", async () => {
      let user = userFactory.getRandomUser();
      let result = await UserService.login(user.username, user.password);
      expect(result).to.include.keys("sessionToken");
    });
  });
  describe("#logout()", () => {
    it("should return a success message if session exists and successfully logged out", async () => {
      let session = userFactory.getRandomSession();
      let result = await UserService.logout(session.sessionToken);
      expect(result.status).to.eql("OK");
    });
  });
});

after(async () => {
  await userFactory.clear();
  await nodeFactory.clear();
});
